import { App, Button, Drawer, Form, Input, Popconfirm, Space, Table, Typography } from 'antd';
import { EditOutlined, PlusOutlined } from '@ant-design/icons';
import { useCallback, useEffect, useState } from 'react';

import easytradeApi from '../../api/easytradeApi.js';
import { useApp } from '../../contexts/useApp.js';

export default function AdminCategoriesPage() {
  const { message } = App.useApp();
  const { refresh } = useApp();
  const [form] = Form.useForm();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [version, setVersion] = useState(0);

  const reload = useCallback(async () => {
    setVersion((v) => v + 1);
    await refresh();
  }, [refresh]);

  useEffect(() => {
    let active = true;
    Promise.all([
      easytradeApi.catalog.categories(),
      easytradeApi.catalog.adminProducts(),
    ])
      .then(([nextCategories, nextProducts]) => {
        if (!active) return;
        setCategories(nextCategories || []);
        setProducts(nextProducts || []);
      })
      .catch((error) => {
        if (!active) return;
        setCategories([]);
        setProducts([]);
        message.error(error.message);
      });
    return () => {
      active = false;
    };
  }, [message, version]);

  const openDrawer = (category = null) => {
    setEditingCategory(category);
    form.setFieldsValue(category || { name: '', description: '' });
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setEditingCategory(null);
    form.resetFields();
  };

  const saveCategory = async (values) => {
    try {
      if (editingCategory) {
        await easytradeApi.catalog.updateCategory(editingCategory.id, { ...editingCategory, ...values });
        message.success('分类已更新');
      } else {
        await easytradeApi.catalog.addCategory(values);
        message.success('分类已新增');
      }
      closeDrawer();
      await reload();
    } catch (error) {
      message.error(error.message);
    }
  };

  const deleteCategory = async (categoryId) => {
    try {
      await easytradeApi.catalog.deleteCategory(categoryId);
      await reload();
      message.success('分类已删除');
    } catch (error) {
      message.error(error.message);
    }
  };

  return (
    <Space orientation="vertical" size={16} style={{ width: '100%' }}>
      <div className="section-head">
        <div>
          <Typography.Title level={2}>分类管理</Typography.Title>
          <Typography.Text className="muted">维护前台分类索引，删除分类前会检查是否仍有关联商品。</Typography.Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openDrawer()}>
          新增分类
        </Button>
      </div>

      <Table
        rowKey="id"
        dataSource={categories}
        scroll={{ x: 720 }}
        tableLayout="fixed"
        columns={[
          {
            title: '分类名称',
            dataIndex: 'name',
            width: 180,
            ellipsis: true,
          },
          {
            title: '分类说明',
            dataIndex: 'description',
            width: 320,
            ellipsis: true,
          },
          {
            title: '商品数',
            width: 100,
            render: (_, record) => products.filter((product) => product.categoryId === record.id).length,
          },
          {
            title: '操作',
            width: 160,
            fixed: 'right',
            render: (_, record) => (
              <Space>
                <Button type="link" icon={<EditOutlined />} onClick={() => openDrawer(record)}>
                  编辑
                </Button>
                <Popconfirm
                  title="删除分类？"
                  description="有关联商品的分类不能删除。"
                  onConfirm={() => deleteCategory(record.id)}
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
        size="default"
        title={editingCategory ? '编辑分类' : '新增分类'}
        open={drawerOpen}
        onClose={closeDrawer}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={saveCategory}>
          <Form.Item name="name" label="分类名称" rules={[{ required: true, message: '请输入分类名称' }]}>
            <Input placeholder="例如：校园文具" />
          </Form.Item>
          <Form.Item name="description" label="分类说明" rules={[{ required: true, message: '请输入分类说明' }]}>
            <Input.TextArea rows={4} placeholder="简要说明分类覆盖的商品范围" />
          </Form.Item>
          <Button type="primary" htmlType="submit">
            保存分类
          </Button>
        </Form>
      </Drawer>
    </Space>
  );
}
