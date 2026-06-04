import { Alert } from 'antd';

import { getRoleLabel } from '../../services/permissionService.js';

export default function PermissionNotice({ role }) {
  return (
    <Alert
      showIcon
      type="info"
      title={`当前后台角色：${getRoleLabel(role)}`}
      description="管理员可管理商品和订单，运营账号只能查看订单与权限说明。"
      style={{ marginBottom: 16 }}
    />
  );
}
