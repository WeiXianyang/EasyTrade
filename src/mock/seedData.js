/**
 * Initial mock data for the course project.
 *
 * storageService writes these values into localStorage on first read and during
 * test resets. Keep ids stable: routes, tests, and demo credentials rely on
 * them for repeatable walkthroughs.
 */
export const STORAGE_KEYS = {
  products: 'easytrade.products',
  categories: 'easytrade.categories',
  carts: 'easytrade.carts',
  orders: 'easytrade.orders',
  users: 'easytrade.users',
  currentUser: 'easytrade.currentUser',
  currentAdmin: 'easytrade.currentAdmin',
  rolePermissions: 'easytrade.rolePermissions',
  requestLogs: 'easytrade.requestLogs',
  auditLogs: 'easytrade.auditLogs',
  favorites: 'easytrade.favorites',
  follows: 'easytrade.follows',
  footprints: 'easytrade.footprints',
};

export const adminModules = [
  { key: 'dashboard', label: '后台概览' },
  { key: 'products', label: '商品管理' },
  { key: 'categories', label: '分类管理' },
  { key: 'orders', label: '订单管理' },
  { key: 'roles', label: '权限管理' },
];

export const seedRolePermissions = {
  admin: ['dashboard', 'products', 'categories', 'orders', 'roles'],
  operator: ['dashboard', 'orders'],
};

export const seedCategories = [
  { id: 'digital', name: '数码潮品', description: '手机、耳机、智能设备' },
  { id: 'home', name: '品质生活', description: '小家电、收纳、香氛' },
  { id: 'food', name: '精选食品', description: '咖啡、零食、轻食' },
  { id: 'sports', name: '运动户外', description: '训练、出行、露营' },
];

export const seedProducts = [
  {
    id: 'p-phone',
    name: 'Aurora X1 智能手机',
    subtitle: '轻薄机身，全天候影像系统',
    categoryId: 'digital',
    price: 3999,
    originalPrice: 4599,
    stock: 38,
    sold: 1260,
    status: 'on',
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80',
    tags: ['新品', '热卖'],
    description: '搭载高刷屏、长续航和夜景算法，适合移动办公与日常拍摄。',
  },
  {
    id: 'p-watch',
    name: 'Pulse Pro 运动手表',
    subtitle: '健康监测与长续航训练助手',
    categoryId: 'digital',
    price: 899,
    originalPrice: 1099,
    stock: 56,
    sold: 860,
    status: 'on',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80',
    tags: ['运动', '智能'],
    description: '支持心率、睡眠、运动记录和消息提醒，适合学生日常通勤与训练。',
  },
  {
    id: 'p-coffee',
    name: '晨光冷萃咖啡套装',
    subtitle: '低酸顺滑，6 瓶组合装',
    categoryId: 'food',
    price: 79,
    originalPrice: 99,
    stock: 120,
    sold: 2300,
    status: 'on',
    image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=900&q=80',
    tags: ['限时', '高复购'],
    description: '精选阿拉比卡咖啡豆，冷萃工艺保留香气，适合学习和办公场景。',
  },
  {
    id: 'p-lamp',
    name: 'Luma 护眼台灯',
    subtitle: '无频闪调光，宿舍书桌友好',
    categoryId: 'home',
    price: 189,
    originalPrice: 239,
    stock: 44,
    sold: 710,
    status: 'on',
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=80',
    tags: ['学习', '护眼'],
    description: '三档色温、触控调光，夜间阅读更舒适。',
  },
  {
    id: 'p-shoes',
    name: 'BreezeRun 轻跑鞋',
    subtitle: '回弹缓震，校园跑步优选',
    categoryId: 'sports',
    price: 329,
    originalPrice: 429,
    stock: 67,
    sold: 540,
    status: 'on',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80',
    tags: ['户外', '舒适'],
    description: '透气网面与轻量中底，适合日常训练和短途出行。',
  },
  {
    id: 'p-speaker',
    name: 'Nest Mini 蓝牙音箱',
    subtitle: '小体积，大声场',
    categoryId: 'home',
    price: 259,
    originalPrice: 299,
    stock: 0,
    sold: 390,
    status: 'off',
    image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=900&q=80',
    tags: ['下架', '展示'],
    description: '下架商品用于演示后台上下架与前台联动效果。',
  },
];

export const seedUsers = [
  {
    id: 'u-demo',
    username: 'buyer',
    email: 'buyer@example.com',
    phone: '13800000000',
    password: '123456',
    role: 'customer',
    name: '校园买手',
    address: {
      name: '张三',
      phone: '13800000000',
      detail: '北京市海淀区学院路 1 号',
    },
  },
  {
    id: 'a-admin',
    username: 'admin',
    password: 'admin123',
    role: 'admin',
    name: '系统管理员',
  },
  {
    id: 'a-operator',
    username: 'operator',
    password: 'operator123',
    role: 'operator',
    name: '订单运营',
  },
];

export const seedOrders = [
  {
    id: 'o-demo',
    orderNo: 'ET202606020001',
    userId: 'u-demo',
    createTime: '2026/6/2 19:30:00',
    payTime: '2026/6/2 19:35:00',
    status: 'paid',
    totalAmount: 79,
    address: {
      name: '张三',
      phone: '13800000000',
      detail: '北京市海淀区学院路 1 号',
    },
    logistics: {
      company: '顺丰速运',
      trackingNo: '',
      shippedAt: '',
      traces: ['订单已支付，等待仓库发货'],
    },
    items: [
      {
        productId: 'p-coffee',
        name: '晨光冷萃咖啡套装',
        price: 79,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=900&q=80',
      },
    ],
  },
];
