import { getOrderStatusText } from '../services/orderService.js';

export function formatCurrency(value) {
  return `¥${Number(value || 0).toFixed(0)}`;
}

export function formatOrderStatus(status) {
  return getOrderStatusText(status);
}
