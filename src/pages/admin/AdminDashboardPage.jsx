import { Card, Col, Row, Space, Statistic, Steps, Table, Tag, Typography } from 'antd';
import { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import PermissionNotice from '../../components/admin/PermissionNotice.jsx';
import { useApp } from '../../contexts/useApp.js';
import auditLogService from '../../services/auditLogService.js';
import demoService from '../../services/demoService.js';
import productService from '../../services/productService.js';
import requestLogService from '../../services/requestLogService.js';
import orderService from '../../services/orderService.js';
import { formatCurrency, formatOrderStatus } from '../../utils/format.js';

/** 将订单数据按日期聚合为近 N 天的销售额 + 订单量 */
function buildSalesTrend(orders, days = 7) {
  const result = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = `${d.getMonth() + 1}/${d.getDate()}`;
    const dateStr = d.toISOString().slice(0, 10);
    const dayOrders = orders.filter(
      (o) =>
        o.createdAt?.startsWith(dateStr) &&
        (o.status === 'paid' || o.status === 'shipped' || o.status === 'finished'),
    );
    result.push({
      date: key,
      销售额: dayOrders.reduce((s, o) => s + o.totalAmount, 0),
      订单量: dayOrders.length,
    });
  }
  return result;
}

/** 按分类统计商品数量 */
function buildCategoryDist(products) {
  const map = {};
  products.forEach((p) => {
    map[p.categoryId] = (map[p.categoryId] || 0) + 1;
  });
  return Object.entries(map).map(([name, value]) => ({ name, value }));
}

const CHART_COLORS = ['#f04f3e', '#256d5a', '#3b82f6', '#f59e0b', '#8b5cf6', '#10b981'];

export default function AdminDashboardPage() {
  const { currentAdmin, version, theme } = useApp();
  const isDark = theme === 'dark';
  const gridStroke = isDark ? '#334155' : '#edf1f5';
  const products = productService.getAdminProducts();
  const orders = orderService.getAllOrders();
  const paidOrders = orders.filter((order) => order.status === 'paid' || order.status === 'shipped');
  const totalSales = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const requestLogs = requestLogService.getRequestLogs(5);
  const auditLogs = auditLogService.getAuditLogs(5);
  const scenarioSteps = demoService.getScenarioSteps();

  // 统计图表数据（useMemo 避免每次渲染重新计算）
  const salesTrend = useMemo(() => buildSalesTrend(orders, 7), [orders.length]);
  const categoryDist = useMemo(() => buildCategoryDist(products), [products.length]);

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

      {/* ─── 销售统计图表区 ──────────────────────────────────────────────────── */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card title="近 7 天销售趋势">
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={salesTrend} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: isDark ? '#94a3b8' : '#64748b' }} />
                <YAxis yAxisId="left" tick={{ fontSize: 12, fill: isDark ? '#94a3b8' : '#64748b' }} tickFormatter={(v) => `¥${v}`} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12, fill: isDark ? '#94a3b8' : '#64748b' }} />
                <Tooltip formatter={(value, name) => name === '销售额' ? [`¥${value}`, name] : [value, name]} />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="销售额" stroke="#f04f3e" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                <Line yAxisId="right" type="monotone" dataKey="订单量" stroke="#256d5a" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card title="各分类商品数量">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={categoryDist} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: isDark ? '#94a3b8' : '#64748b' }} />
                <YAxis tick={{ fontSize: 12, fill: isDark ? '#94a3b8' : '#64748b' }} />
                <Tooltip />
                <Bar dataKey="value" name="商品数">
                  {categoryDist.map((_, index) => (
                    <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
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
              orientation="vertical"
              size="small"
              current={-1}
              items={scenarioSteps.map((step) => ({
                title: step.title,
                content: step.description,
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
