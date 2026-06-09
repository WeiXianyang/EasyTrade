import { useCallback } from 'react';
import { App } from 'antd';
import { useNavigate } from 'react-router-dom';

import { useApp } from '../contexts/useApp.js';
import cartService from '../services/cartService.js';
import mockApiService from '../services/mockApiService.js';

/**
 * useAddToCart —— 加入购物车的可复用自定义 Hook
 *
 * 封装了"检查登录 → 调用 Mock API → 刷新购物车 → 打开 Drawer → 提示"的完整流程，
 * 避免在 HomePage / CategoryPage / ProductDetailPage 中重复相同逻辑。
 *
 * @returns {Function} handleAddCart(product, quantity?)
 *   - product  商品对象（需含 id、name 字段）
 *   - quantity 加购数量，默认 1
 */
export function useAddToCart() {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const { currentUser, openCart, refresh } = useApp();

  const handleAddCart = useCallback(
    (product, quantity = 1) => {
      // 未登录时引导去登录
      if (!currentUser) {
        message.warning('请先登录再加入购物车');
        navigate('/login');
        return;
      }

      // 通过 Mock API 记录操作日志
      mockApiService.request({
        method: 'POST',
        path: '/cart/items',
        actor: currentUser,
        moduleName: '前台购物车',
        action: '加入购物车',
        target: product.name,
        handler: () => cartService.addItem(currentUser.id, product.id, quantity),
      });

      refresh();    // 触发全局购物车数量更新
      openCart();   // 打开购物车 Drawer
      message.success('已加入购物车');
    },
    [currentUser, message, navigate, openCart, refresh],
  );

  return handleAddCart;
}
