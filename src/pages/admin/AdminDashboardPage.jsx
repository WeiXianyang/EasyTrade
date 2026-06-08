import { Card, Col, Row, Space, Statistic, Steps, Table, Tag, Typography } from 'antd';

import PermissionNotice from '../../components/admin/PermissionNotice.jsx';
import { useApp } from '../../contexts/useApp.js';
import auditLogService from '../../services/auditLogService.js';
import demoService from '../../services/demoService.js';
import productService from '../../services/productService.js';
import requestLogService from '../../services/requestLogService.js';
import orderService from '../../services/orderService.js';
import { formatCurrency, formatOrderStatus } from '../../utils/format.js';

export default function AdminDashboardPage() {
  const { currentAdmin, version } = useApp();
  const products = productService.getAdminProducts();
  const orders = orderService.getAllOrders();
  const paidOrders = orders.filter((order) => order.status === 'paid' || order.status === 'shipped');
  const totalSales = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const requestLogs = requestLogService.getRequestLogs(5);
  const auditLogs = auditLogService.getAuditLogs(5);
  const scenarioSteps = demoService.getScenarioSteps();

  return (
    <Space orientation="vertical" size={18} style={{ width: '100%' }}>
      <PermissionNotice role={currentAdmin.role} />
      <Row gutter={[16, 16]} key={version}>
        <Col xs={24} md={6}>
          <Card>
            <Statistic title="商品总数" value={products.length} suffix="件" />
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card>
            <Statistic title="在售商品" value={products.filter((product) => product.status === 'on').length} suffix="件" />
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card>
            <Statistic title="有效订单" value={paidOrders.length} suffix="笔" />
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card>
            <Statistic title="销售额" value={totalSales} formatter={formatCurrency} />
          </Card>
        </Col>
      </Row>
      <Card title="最近订单">
        <Table
          rowKey="id"
          dataSource={orders.slice(0, 5)}
          pagination={false}
          scroll={{ x: 680 }}
          tableLayout="fixed"
          columns={[
            { title: '订单号', dataIndex: 'orderNo', width: 190, ellipsis: true },
            { title: '用户', dataIndex: 'userId', width: 120, ellipsis: true },
            {
              title: '金额',
              dataIndex: 'totalAmount',
              width: 120,
              render: formatCurrency,
            },
            {
              title: '状态',
              dataIndex: 'status',
              width: 120,
              render: (status) => <Tag color="blue">{formatOrderStatus(status)}</Tag>,
            },
          ]}
        />
      </Card>
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={10}>
          <Card title="答辩演示助手">
            <Steps
              direction="vertical"
              size="small"
              current={-1}
              items={scenarioSteps.map((step) => ({
                title: step.title,
                description: step.description,
              }))}
            />
          </Card>
        </Col>
        <Col xs={24} lg={14}>
          <Card title="最近操作审计">
            <Table
              rowKey="id"
              dataSource={auditLogs}
              pagination={false}
              scroll={{ x: 720 }}
              tableLayout="fixed"
              columns={[
                { title: '时间', dataIndex: 'createdAt', width: 170, ellipsis: true },
                { title: '操作人', dataIndex: 'actorName', width: 120, ellipsis: true },
                { title: '模块', dataIndex: 'moduleName', width: 120, ellipsis: true },
                { title: '动作', dataIndex: 'action', width: 130, ellipsis: true },
                { title: '对象', dataIndex: 'target', width: 150, ellipsis: true },
              ]}
            />
          </Card>
        </Col>
      </Row>
      <Typography.Text className="muted">
        Mock API 最近记录 {requestLogs.length} 条，审计最近记录 {auditLogs.length} 条。
      </Typography.Text>
      <Typography.Text className="muted">版本刷新标识：{version}</Typography.Text>
    </Space>
  );
}
