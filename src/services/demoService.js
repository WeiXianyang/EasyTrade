import mockApiService from './mockApiService.js';
import storageService from './storageService.js';

export const demoScenarioSteps = [
  { title: '前台浏览', description: '进入首页或分类页，查看热门商品与分类索引。' },
  { title: '加入购物车', description: '使用 buyer@example.com / 123456 登录并加入商品。' },
  { title: '创建订单', description: '从购物车进入结算页，确认地址并生成待支付订单。' },
  { title: '模拟支付', description: '支付页完成倒计时与支付成功状态流转。' },
  { title: '后台发货', description: '管理员在订单管理中录入物流单号，前台订单详情同步更新。' },
  { title: '审计回放', description: '打开请求日志和操作审计，说明数据链路与权限边界。' },
];

const demoCartItems = [
  {
    userId: 'u-demo',
    productId: 'p-phone',
    quantity: 1,
    selected: true,
    addedAt: '2026/6/8 10:00:00',
  },
  {
    userId: 'u-demo',
    productId: 'p-coffee',
    quantity: 2,
    selected: true,
    addedAt: '2026/6/8 10:02:00',
  },
];

/**
 * Restores a deterministic defense walkthrough while keeping the current login
 * session intact. This makes live demos recoverable after exploratory clicks.
 */
export function createDemoService(storage = storageService, api = mockApiService) {
  return {
    getScenarioSteps() {
      return demoScenarioSteps;
    },
    resetDemoData(actor) {
      return api.request({
        method: 'POST',
        path: '/demo/reset',
        actor,
        moduleName: '演示助手',
        action: '重置演示数据',
        target: 'EasyTrade 答辩场景',
        successStatus: 200,
        handler: () => {
          storage.reset({ preserveSessions: true });
          storage.write(storage.keys.carts, demoCartItems);
          return {
            steps: demoScenarioSteps,
            cartItems: demoCartItems,
          };
        },
      });
    },
  };
}

const demoService = createDemoService();
export default demoService;
