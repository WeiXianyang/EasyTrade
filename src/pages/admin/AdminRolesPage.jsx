import { App, Button, Card, Space, Switch, Table, Tag, Typography } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { useState } from 'react';

import { useApp } from '../../contexts/useApp.js';
import permissionService, { getRoleLabel } from '../../services/permissionService.js';

const roleRows = [
  { role: 'admin', description: '可配置后台全部模块，概览和权限管理为保底权限' },
  { role: 'operator', description: '默认处理订单，可按需要开放商品、分类等模块' },
];

const lockedAdminModules = ['dashboard', 'roles'];

export default function AdminRolesPage() {
  const { message } = App.useApp();
  const { currentAdmin, refresh } = useApp();
  const [permissions, setPermissions] = useState(() => permissionService.getRolePermissions());
  const modules = permissionService.getModules();
  const editable = currentAdmin.role === 'admin';

  const persistPermissions = (role, moduleName, checked) => {
    const currentModules = permissions[role] || [];
    const nextModules = checked
      ? [...currentModules, moduleName]
      : currentModules.filter((item) => item !== moduleName);
    const nextPermissions = permissionService.updateRolePermissions(role, nextModules);
    setPermissions(nextPermissions);
    refresh();
    message.success('权限配置已更新');
  };

  const resetPermissions = () => {
    const nextPermissions = permissionService.resetRolePermissions();
    setPermissions(nextPermissions);
    refresh();
    message.success('权限配置已恢复默认');
  };

  return (
    <Space orientation="vertical" size={16} style={{ width: '100%' }}>
      <div className="section-head">
        <div>
          <Typography.Title level={2}>权限管理</Typography.Title>
          <Typography.Text className="muted">通过开关配置角色可访问的后台模块，菜单与路由守卫会同步生效。</Typography.Text>
        </div>
        <Button icon={<ReloadOutlined />} disabled={!editable} onClick={resetPermissions}>
          恢复默认
        </Button>
      </div>

      {!editable ? (
        <Card>
          <Typography.Text>当前角色只能查看权限配置，修改权限需使用管理员账号。</Typography.Text>
        </Card>
      ) : null}

      <Table
        rowKey="role"
        dataSource={roleRows}
        pagination={false}
        scroll={{ x: 980 }}
        tableLayout="fixed"
        columns={[
          {
            title: '角色',
            width: 140,
            render: (_, record) => (
              <Space>
                <Typography.Text strong>{getRoleLabel(record.role)}</Typography.Text>
                {record.role === currentAdmin.role ? <Tag color="blue">当前账号</Tag> : null}
              </Space>
            ),
          },
          {
            title: '说明',
            dataIndex: 'description',
            width: 260,
            ellipsis: true,
          },
          ...modules.map((module) => ({
            title: module.label,
            dataIndex: module.key,
            width: 130,
            render: (_, record) => {
              const locked = record.role === 'admin' && lockedAdminModules.includes(module.key);
              return (
                <Switch
                  checked={permissions[record.role]?.includes(module.key)}
                  checkedChildren="可访问"
                  unCheckedChildren="关闭"
                  disabled={!editable || locked}
                  onChange={(checked) => persistPermissions(record.role, module.key, checked)}
                />
              );
            },
          })),
        ]}
      />

      <Card title="演示账号">
        <Typography.Paragraph>管理员：admin / admin123</Typography.Paragraph>
        <Typography.Paragraph>运营：operator / operator123</Typography.Paragraph>
      </Card>
    </Space>
  );
}
