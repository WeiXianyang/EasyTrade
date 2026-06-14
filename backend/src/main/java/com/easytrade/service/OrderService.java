package com.easytrade.service;

import com.easytrade.common.BusinessException;
import com.easytrade.entity.Order;
import com.easytrade.entity.OrderItem;
import com.easytrade.entity.Product;
import com.easytrade.repository.OrderRepository;
import com.easytrade.repository.ProductRepository;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OrderService {
  private final OrderRepository orders;
  private final CartService cartService;
  private final ProductRepository products;

  public OrderService(OrderRepository orders, CartService cartService, ProductRepository products) {
    this.orders = orders;
    this.cartService = cartService;
    this.products = products;
  }

  public record AddressCommand(String name, String phone, String detail) {}

  public record LogisticsView(String company, String trackingNo, String shippedAt, List<String> traces) {}

  public record OrderItemView(String productId, String name, BigDecimal price, int quantity, String image) {}

  public record OrderView(
      String id,
      String orderNo,
      String userId,
      String createTime,
      String payTime,
      String status,
      BigDecimal totalAmount,
      AddressCommand address,
      LogisticsView logistics,
      List<OrderItemView> items) {}

  @Transactional
  public OrderView createFromSelectedCart(String userId, AddressCommand address) {
    List<CartService.CartItemView> selected = cartService.selectedItems(userId);
    if (selected.isEmpty()) {
      throw new BusinessException("请选择需要结算的商品");
    }
    return createOrder(userId, selected, address);
  }

  @Transactional
  public OrderView createBuyNow(String userId, CartService.CartItemView item, AddressCommand address) {
    return createOrder(userId, List.of(item), address);
  }

  @Transactional
  public OrderView createBuyNow(String userId, String productId, int quantity, AddressCommand address) {
    Product product = products.findById(productId).orElseThrow(() -> new BusinessException("商品不存在"));
    if (!"on".equals(product.getStatus()) || product.getStock() < 1) {
      throw new BusinessException("商品不可购买");
    }
    int nextQuantity = Math.min(product.getStock(), Math.max(1, quantity));
    CartService.ProductSnapshot snapshot =
        new CartService.ProductSnapshot(
            product.getId(), product.getName(), product.getSubtitle(), product.getPrice(), product.getStock(), product.getImage());
    CartService.CartItemView item =
        new CartService.CartItemView(
            product.getId(),
            nextQuantity,
            true,
            snapshot,
            product.getPrice().multiply(BigDecimal.valueOf(nextQuantity)));
    return createOrder(userId, List.of(item), address);
  }

  @Transactional(readOnly = true)
  public List<OrderView> ordersByUser(String userId) {
    return orders.findByUserIdOrderByCreateTimeDesc(userId).stream().map(this::toView).toList();
  }

  @Transactional(readOnly = true)
  public List<OrderView> allOrders() {
    return orders.findAllByOrderByCreateTimeDesc().stream().map(this::toView).toList();
  }

  @Transactional(readOnly = true)
  public OrderView orderById(String userId, String orderId) {
    Order order = findOrder(orderId);
    if (!order.getUserId().equals(userId)) {
      throw new BusinessException("订单不存在");
    }
    return toView(order);
  }

  @Transactional
  public OrderView payOrder(String userId, String orderId) {
    Order order = findOrder(orderId);
    if (!order.getUserId().equals(userId)) {
      throw new BusinessException("订单不存在");
    }
    order.setStatus("paid");
    order.setPayTime(LocalDateTime.now());
    order.setTraces(List.of("订单已支付，等待仓库发货"));
    return toView(order);
  }

  @Transactional
  public OrderView shipOrder(String orderId, String trackingNo) {
    Order order = findOrder(orderId);
    order.setStatus("shipped");
    order.setTrackingNo(trackingNo);
    order.setShippedAt(LocalDateTime.now());
    order.setTraces(List.of("仓库已发货", "物流单号：" + trackingNo, "运输中"));
    return toView(order);
  }

  @Transactional
  public OrderView finishOrder(String userId, String orderId) {
    Order order = findOrder(orderId);
    if (!order.getUserId().equals(userId)) {
      throw new BusinessException("订单不存在");
    }
    order.setStatus("finished");
    order.getTraces().add("用户已确认收货");
    return toView(order);
  }

  private OrderView createOrder(
      String userId, List<CartService.CartItemView> cartItems, AddressCommand address) {
    Order order = new Order();
    order.setId("o-" + UUID.randomUUID());
    order.setOrderNo("ET" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss")));
    order.setUserId(userId);
    order.setCreateTime(LocalDateTime.now());
    order.setStatus("pending-payment");
    order.setAddressName(address.name());
    order.setAddressPhone(address.phone());
    order.setAddressDetail(address.detail());
    order.setLogisticsCompany("顺丰速运");
    order.setTrackingNo("");
    order.setTraces(List.of("订单已创建，等待支付"));
    List<OrderItem> items =
        cartItems.stream()
            .map(
                item ->
                    new OrderItem(
                        item.productId(),
                        item.product().name(),
                        item.product().price(),
                        item.quantity(),
                        item.product().image()))
            .toList();
    order.setItems(items);
    order.setTotalAmount(
        items.stream()
            .map(item -> item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
            .reduce(BigDecimal.ZERO, BigDecimal::add));
    return toView(orders.save(order));
  }

  private Order findOrder(String orderId) {
    return orders.findById(orderId).orElseThrow(() -> new BusinessException("订单不存在"));
  }

  private OrderView toView(Order order) {
    return new OrderView(
        order.getId(),
        order.getOrderNo(),
        order.getUserId(),
        format(order.getCreateTime()),
        format(order.getPayTime()),
        order.getStatus(),
        order.getTotalAmount(),
        new AddressCommand(order.getAddressName(), order.getAddressPhone(), order.getAddressDetail()),
        new LogisticsView(
            order.getLogisticsCompany(),
            order.getTrackingNo(),
            format(order.getShippedAt()),
            List.copyOf(order.getTraces())),
        order.getItems().stream()
            .map(item -> new OrderItemView(item.getProductId(), item.getName(), item.getPrice(), item.getQuantity(), item.getImage()))
            .toList());
  }

  private String format(LocalDateTime time) {
    return time == null ? "" : time.format(DateTimeFormatter.ofPattern("yyyy/M/d HH:mm:ss"));
  }
}
