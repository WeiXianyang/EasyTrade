package com.easytrade.service;

import com.easytrade.common.BusinessException;
import com.easytrade.entity.CartItem;
import com.easytrade.entity.Product;
import com.easytrade.repository.CartItemRepository;
import com.easytrade.repository.ProductRepository;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CartService {
  private final CartItemRepository cartItems;
  private final ProductRepository products;

  public CartService(CartItemRepository cartItems, ProductRepository products) {
    this.cartItems = cartItems;
    this.products = products;
  }

  public record ProductSnapshot(
      String id, String name, String subtitle, BigDecimal price, int stock, String image) {}

  public record CartItemView(
      String productId,
      int quantity,
      boolean selected,
      ProductSnapshot product,
      BigDecimal subtotal) {}

  public record CartSummary(int count, BigDecimal total) {}

  @Transactional(readOnly = true)
  public List<CartItemView> cart(String userId) {
    return cartItems.findByUserIdOrderByAddedAtAsc(userId).stream().map(this::toView).toList();
  }

  @Transactional
  public List<CartItemView> addItem(String userId, String productId, int quantity) {
    Product product = purchasableProduct(productId);
    CartItem item =
        cartItems
            .findByUserIdAndProductId(userId, productId)
            .orElseGet(
                () -> {
                  CartItem next = new CartItem();
                  next.setUserId(userId);
                  next.setProductId(productId);
                  next.setQuantity(0);
                  next.setAddedAt(LocalDateTime.now());
                  return next;
                });
    item.setQuantity(Math.min(product.getStock(), item.getQuantity() + Math.max(1, quantity)));
    item.setSelected(true);
    cartItems.save(item);
    return cart(userId);
  }

  @Transactional
  public List<CartItemView> updateQuantity(String userId, String productId, int quantity) {
    Product product = products.findById(productId).orElseThrow(() -> new BusinessException("商品不存在"));
    CartItem item =
        cartItems
            .findByUserIdAndProductId(userId, productId)
            .orElseThrow(() -> new BusinessException("购物车商品不存在"));
    item.setQuantity(Math.min(product.getStock(), Math.max(1, quantity)));
    return cart(userId);
  }

  @Transactional
  public List<CartItemView> setSelected(String userId, String productId, boolean selected) {
    CartItem item =
        cartItems
            .findByUserIdAndProductId(userId, productId)
            .orElseThrow(() -> new BusinessException("购物车商品不存在"));
    item.setSelected(selected);
    return cart(userId);
  }

  @Transactional
  public List<CartItemView> setAllSelected(String userId, boolean selected) {
    cartItems.findByUserIdOrderByAddedAtAsc(userId).forEach(item -> item.setSelected(selected));
    return cart(userId);
  }

  @Transactional
  public List<CartItemView> removeItem(String userId, String productId) {
    cartItems.deleteByUserIdAndProductId(userId, productId);
    return cart(userId);
  }

  @Transactional
  public List<CartItemView> removeSelected(String userId) {
    cartItems.deleteByUserIdAndSelectedTrue(userId);
    return cart(userId);
  }

  @Transactional(readOnly = true)
  public List<CartItemView> selectedItems(String userId) {
    return cart(userId).stream().filter(CartItemView::selected).toList();
  }

  @Transactional(readOnly = true)
  public CartSummary selectedSummary(String userId) {
    List<CartItemView> selected = selectedItems(userId);
    return new CartSummary(
        selected.stream().mapToInt(CartItemView::quantity).sum(),
        selected.stream().map(CartItemView::subtotal).reduce(BigDecimal.ZERO, BigDecimal::add));
  }

  private CartItemView toView(CartItem item) {
    Product product = products.findById(item.getProductId()).orElse(null);
    if (product == null) {
      return new CartItemView(item.getProductId(), item.getQuantity(), item.isSelected(), null, BigDecimal.ZERO);
    }
    ProductSnapshot snapshot =
        new ProductSnapshot(
            product.getId(), product.getName(), product.getSubtitle(), product.getPrice(), product.getStock(), product.getImage());
    return new CartItemView(
        item.getProductId(),
        item.getQuantity(),
        item.isSelected(),
        snapshot,
        product.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
  }

  private Product purchasableProduct(String productId) {
    Product product = products.findById(productId).orElseThrow(() -> new BusinessException("商品不存在"));
    if (!"on".equals(product.getStatus()) || product.getStock() < 1) {
      throw new BusinessException("商品不可购买");
    }
    return product;
  }
}
