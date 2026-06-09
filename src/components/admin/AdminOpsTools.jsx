import { App, Button, Drawer, Popconfirm, Space, Table, Tag, Typography } from 'antd';
import { ApiOutlined, DeleteOutlined, HistoryOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { useState } from 'react';

import { useApp } from '../../contexts/useApp.js';
import auditLogService from '../../services/auditLogService.js';
import demoService from '../../services/demoService.js';
import requestLogService from '../../services/requestLogService.js';

function statusColor(status) {
  if (status >= 200 && status < 300) return 'green';
  if (status >= 400) return 'red';
  return 'blue';
}

export default function AdminOpsTools() {
  const { message } = App.useApp();
  const { currentAdmin, refresh, version } = useApp();
  const [requestOpen, setRequestOpen] = useState(false);
  const [auditOpen, setAuditOpen] = useState(false);
  const requestLogs = requestLogService.getRequestLogs(40);
  const auditLogs = auditLogService.getAuditLogs(40);

  const resetDemo = () => {
    demoService.resetDemoData(currentAdmin);
    refresh();
    message.success('演示数据已重置，购买链路可以从固定场景重新开始');
  };

  const clearRequestLogs = () => {
    requestLogService.clearRequestLogs();
    refresh();
    message.success('请求日志已清空');
  };

  const clearAuditLogs = () => {
    auditLogService.clearAuditLogs();
    refresh();
    message.success('操作审计已清空');
  };

  return (
    <Space wrap className="admin-ops-tools" key={version}>
      <Button icon={<ApiOutlined />} onClick={() => setRequestOpen(true)}>
        请求日志
      </Button>
      <Button icon={<HistoryOutlined />} onClick={() => setAuditOpen(true)}>
        操作审计
      </Button>
      <Popconfirm title="重置演示数据？" description="会恢复商品、订单、购物车和权限示例，保留当前后台登录状态。" onConfirm={resetDemo}>
        <Button type="primary" icon={<ThunderboltOutlined />}>
          重置演示
        </Button>
      </Popconfirm>

      <Drawer
        title="Mock API 请求日志"
        size="large"
        open={requestOpen}
        onClose={() => setRequestOpen(false)}
        extra={
          <Button danger icon={<DeleteOutlined />} onClick={clearRequestLogs}>
            清空
          </Button>
        }
      >
        <Typography.Paragraph className="muted">
          前台和后台核心操作会写入类似 REST 的请求记录，便于答辩时展示数据流。
        </Typography.Paragraph>
        <Table
          rowKey="id"
          dataSource={requestLogs}
          pagination={{ pageSize: 8 }}
          scroll={{ x: 820 }}
          tableLayout="fixed"
          columns={[
            { title: '时间', dataIndex: 'createdAt', width: 170, ellipsis: true },
            { title: '方法', dataIndex: 'method', width: 80 },
            { title: '路径', dataIndex: 'path', width: 220, ellipsis: true },
            {
              title: '状态',
              dataIndex: 'status',
              width: 90,
              render: (status) => <Tag color={statusColor(status)}>{status}</Tag>,
            },
            { title: '耗时', dataIndex: 'durationMs', width: 90, render: (value) => `${value} ms` },
            { title: '模块', dataIndex: 'moduleName', width: 130, ellipsis: true },
            { title: '操作人', dataIndex: 'actorName', width: 120, ellipsis: true },
          ]}
        />
      </Drawer>

      <Drawer
        title="后台操作审计"
        size="large"
        open={auditOpen}
        onClose={() => setAuditOpen(false)}
        extra={
          <Button danger icon={<DeleteOutlined />} onClick={clearAuditLogs}>
            清空
          </Button>
        }
      >
        <Typography.Paragraph className="muted">
          审计日志记录谁在后台修改了商品、分类、订单、权限或演示数据。
        </Typography.Paragraph>
        <Table
          rowKey="id"
          dataSource={auditLogs}
          pagination={{ pageSize: 8 }}
          scroll={{ x: 860 }}
          tableLayout="fixed"
          columns={[
            { title: '时间', dataIndex: 'createdAt', width: 170, ellipsis: true },
            { title: '操作人', dataIndex: 'actorName', width: 120, ellipsis: true },
            { title: '角色', dataIndex: 'actorRole', width: 90 },
            { title: '模块', dataIndex: 'moduleName', width: 130, ellipsis: true },
            { title: '动作', dataIndex: 'action', width: 130, ellipsis: true },
            { title: '对象', dataIndex: 'target', width: 160, ellipsis: true },
            {
              title: '结果',
              dataIndex: 'status',
              width: 90,
              render: (status) => <Tag color={status === 'success' ? 'green' : 'red'}>{status === 'success' ? '成功' : '失败'}</Tag>,
            },
          ]}
        />
      </Drawer>
    </Space>
  );
}
