import {
  App,
  Button,
  Drawer,
  Form,
  Image,
  Input,
  InputNumber,
  Popconfirm,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  Typography,
} from 'antd';
import { EditOutlined, PlusOutlined } from '@ant-design/icons';
import { useCallback, useMemo, useState } from 'react';

import categoryService from '../../services/categoryService.js';
import productService from '../../services/productService.js';
import { formatCurrency } from '../../utils/format.js';

export default function AdminProductsPage() {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState('all');
  const [editingProduct, setEditingProduct] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [version, setVersion] = useState(0);
  const categories = categoryService.getCategories();

  const reload = useCallback(() => setVersion((v) => v + 1), []);

  const products = useMemo(() => {
    void version;
    const lowerKeyword = keyword.trim().toLowerCase();
    return productService.getAdminProducts().filter((product) => {
      const matchesKeyword = !lowerKeyword || product.name.toLowerCase().includes(lowerKeyword);
      const matchesStatus = status === 'all' || product.status === status;
      return matchesKeyword && matchesStatus;
    });
  }, [keyword, status, version]);

  const openDrawer = (product = null) => {
    setEditingProduct(product);
    form.setFieldsValue(
      product
        ? { ...product, tags: product.tags.join(', ') }
        : {
            status: 'on',
            categoryId: categories[0]?.id,
            stock: 10,
            sold: 0,
            tags: '新品',
          },
    );
    setDrawerOpen(true);
  };

  const saveProduct = (values) => {
    const payload = {
      ...editingProduct,
      ...values,
      tags: values.tags ? values.tags.split(/[，,]/).map((tag) => tag.trim()).filter(Boolean) : [],
    };
    if (editingProduct) {
      productService.updateProduct(payload);
      message.success('商品已更新');
    } else {
      productService.addProduct(payload);
      message.success('商品已新增');
    }
    setDrawerOpen(false);
    form.resetFields();
    reload();
  };

  return (
    <Space orientation="vertical" size={16} style={{ width: '100%' }}>
      <div className="section-head">
        <div>
          <Typography.Title level={2}>商品管理</Typography.Title>
          <Typography.Text className="muted">完整 CRUD 与上下架，前台商品列表实时读取同一份 localStorage 数据。</Typography.Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openDrawer()}>
          新增商品
        </Button>
      </div>
      <Space wrap>
        <Input.Search allowClear placeholder="搜索商品名称" onSearch={setKeyword} onChange={(event) => setKeyword(event.target.value)} />
        <Select
          value={status}
          style={{ width: 140 }}
          onChange={setStatus}
          options={[
            { value: 'all', label: '全部状态' },
            { value: 'on', label: '在售' },
            { value: 'off', label: '下架' },
          ]}
        />
      </Space>
      <Table
        rowKey="id"
        dataSource={products}
        scroll={{ x: 1180 }}
        tableLayout="fixed"
        columns={[
          {
            title: '商品',
            width: 300,
            render: (_, record) => (
              <Space className="table-product-cell">
                <Image width={72} height={54} src={record.image} alt={record.name} style={{ objectFit: 'cover', borderRadius: 8 }} />
                <div className="table-text-stack">
                  <Typography.Text strong ellipsis title={record.name}>
                    {record.name}
                  </Typography.Text>
                  <div className="muted">{record.subtitle}</div>
                </div>
              </Space>
            ),
          },
          {
            title: '分类',
            dataIndex: 'categoryId',
            width: 130,
            ellipsis: true,
            render: (categoryId) => categoryService.getCategoryById(categoryId)?.name || categoryId,
          },
          {
            title: '价格',
            dataIndex: 'price',
            width: 110,
            render: formatCurrency,
          },
          { title: '库存', dataIndex: 'stock', width: 90 },
          { title: '销量', dataIndex: 'sold', width: 90 },
          {
            title: '状态',
            dataIndex: 'status',
            width: 120,
            render: (value, record) => (
              <Switch
                checked={value === 'on'}
                checkedChildren="在售"
                unCheckedChildren="下架"
                onChange={(checked) => {
                  productService.toggleStatus(record.id, checked ? 'on' : 'off');
                  reload();
                }}
              />
            ),
          },
          {
            title: '标签',
            dataIndex: 'tags',
            width: 170,
            render: (tags) => tags.map((tag) => <Tag key={tag}>{tag}</Tag>),
          },
          {
            title: '操作',
            width: 170,
            fixed: 'right',
            render: (_, record) => (
              <Space>
                <Button type="link" icon={<EditOutlined />} onClick={() => openDrawer(record)}>
                  编辑
                </Button>
                <Popconfirm
                  title="删除商品？"
                  description="删除后前台和后台都不再显示该商品。"
                  onConfirm={() => {
                    productService.deleteProduct(record.id);
                    reload();
                    message.success('商品已删除');
                  }}
                >
                  <Button danger type="link">
                    删除
                  </Button>
                </Popconfirm>
              </Space>
            ),
          },
        ]}
      />
      <Drawer
        width={520}
        title={editingProduct ? '编辑商品' : '新增商品'}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={saveProduct}>
          <Form.Item name="name" label="商品名称" rules={[{ required: true, message: '请输入商品名称' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="subtitle" label="副标题" rules={[{ required: true, message: '请输入副标题' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="categoryId" label="分类" rules={[{ required: true, message: '请选择分类' }]}>
            <Select options={categories.map((category) => ({ value: category.id, label: category.name }))} />
          </Form.Item>
          <Form.Item name="image" label="商品图片 URL" rules={[{ required: true, type: 'url', message: '请输入图片 URL' }]}>
            <Input placeholder="https://images.unsplash.com/..." />
          </Form.Item>
          <div className="form-inline-grid">
            <Form.Item name="price" label="售价" rules={[{ required: true, message: '请输入售价' }]}>
              <InputNumber min={1} prefix="¥" />
            </Form.Item>
            <Form.Item name="originalPrice" label="原价" rules={[{ required: true, message: '请输入原价' }]}>
              <InputNumber min={1} prefix="¥" />
            </Form.Item>
            <Form.Item name="stock" label="库存" rules={[{ required: true, message: '请输入库存' }]}>
              <InputNumber min={0} />
            </Form.Item>
          </div>
          <Form.Item name="status" label="状态">
            <Select options={[{ value: 'on', label: '在售' }, { value: 'off', label: '下架' }]} />
          </Form.Item>
          <Form.Item name="tags" label="标签">
            <Input placeholder="新品, 热卖" />
          </Form.Item>
          <Form.Item name="description" label="商品说明" rules={[{ required: true, message: '请输入商品说明' }]}>
            <Input.TextArea rows={4} />
          </Form.Item>
          <Button type="primary" htmlType="submit">
            保存商品
          </Button>
        </Form>
      </Drawer>
    </Space>
  );
}
