import productService from './productService.js';
import storageService from './storageService.js';

const statusText = {
  'pending-payment': '待支付',
  paid: '已支付',
  shipped: '已发货',
  finished: '已完成',
  cancelled: '已取消',
};

function createOrderNo() {
  const stamp = new Date().toISOString().replace(/\D/g, '').slice(0, 14);
  return `ET${stamp}${Math.floor(Math.random() * 90 + 10)}`;
}

export function getOrderStatusText(status) {
  return statusText[status] || '未知状态';
}

/**
 * Owns the full order lifecycle: create, pay, ship, and finish.
 *
 * Cart items are copied into immutable order line snapshots. Later product
 * edits should not rewrite historical order names, prices, or images shown to
 * the buyer.
 */
export function createOrderService(storage = storageService, products = productService) {
  function getOrders() {
    return storage.read(storage.keys.orders, []);
  }

  function saveOrders(orders) {
    return storage.write(storage.keys.orders, orders);
  }

  function calculateItems(cartItems) {
    return cartItems.map((item) => {
      const product = item.product || products.getProductById(item.productId);
      if (!product) {
        throw new Error('订单商品不存在');
      }
      return {
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.image,
      };
    });
  }

  return {
    getAllOrders() {
      return getOrders();
    },
    getOrdersByUser(userId) {
      return getOrders().filter((order) => order.userId === userId);
    },
    getOrderById(orderId) {
      return getOrders().find((order) => order.id === orderId);
    },
    createOrderFromCart(userId, cartItems, address) {
      if (!cartItems.length) {
        throw new Error('请选择需要结算的商品');
      }

      const items = calculateItems(cartItems);
      const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const order = {
        id: `o-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
        orderNo: createOrderNo(),
        userId,
        createTime: new Date().toLocaleString(),
        payTime: '',
        status: 'pending-payment',
        totalAmount,
        address,
        items,
        logistics: {
          company: '顺丰速运',
          trackingNo: '',
          shippedAt: '',
          traces: ['订单已创建，等待支付'],
        },
      };
      saveOrders([order, ...getOrders()]);
      return order;
    },
    payOrder(orderId) {
      const orders = getOrders();
      const order = orders.find((item) => item.id === orderId);
      if (!order) {
        throw new Error('订单不存在');
      }
      order.status = 'paid';
      order.payTime = new Date().toLocaleString();
      order.logistics.traces = ['订单已支付，等待仓库发货'];
      saveOrders(orders);
      return order;
    },
    shipOrder(orderId, trackingNo) {
      const orders = getOrders();
      const order = orders.find((item) => item.id === orderId);
      if (!order) {
        throw new Error('订单不存在');
      }
      order.status = 'shipped';
      order.logistics = {
        company: '顺丰速运',
        trackingNo,
        shippedAt: new Date().toLocaleString(),
        traces: ['仓库已发货', `物流单号：${trackingNo}`, '运输中'],
      };
      saveOrders(orders);
      return order;
    },
    finishOrder(orderId) {
      const orders = getOrders();
      const order = orders.find((item) => item.id === orderId);
      if (!order) {
        throw new Error('订单不存在');
      }
      order.status = 'finished';
      order.logistics.traces = [...order.logistics.traces, '用户已确认收货'];
      saveOrders(orders);
      return order;
    },
  };
}

const orderService = createOrderService();
export default orderService;
