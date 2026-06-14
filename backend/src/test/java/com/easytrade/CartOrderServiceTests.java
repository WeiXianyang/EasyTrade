package com.easytrade;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.easytrade.common.BusinessException;
import com.easytrade.service.CartService;
import com.easytrade.service.OrderService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class CartOrderServiceTests {
  @Autowired private CartService cartService;
  @Autowired private OrderService orderService;

  @Test
  void cartMergesQuantitiesCapsToStockAndCalculatesSelectedSummary() {
    cartService.addItem("u-demo", "p-phone", 1);
    cartService.addItem("u-demo", "p-phone", 50);
    cartService.addItem("u-demo", "p-watch", 2);
    cartService.setSelected("u-demo", "p-watch", false);

    assertThat(cartService.cart("u-demo"))
        .filteredOn(item -> item.productId().equals("p-phone"))
        .first()
        .extracting(CartService.CartItemView::quantity)
        .isEqualTo(38);
    assertThat(cartService.selectedSummary("u-demo").count()).isEqualTo(38);
    assertThat(cartService.selectedSummary("u-demo").total().intValue()).isEqualTo(151962);
  }

  @Test
  void cartSupportsSelectAllAndRemoveSelected() {
    cartService.addItem("u-demo", "p-phone", 1);
    cartService.addItem("u-demo", "p-watch", 2);

    cartService.setAllSelected("u-demo", false);
    assertThat(cartService.selectedSummary("u-demo").count()).isZero();

    cartService.setSelected("u-demo", "p-watch", true);
    assertThat(cartService.selectedSummary("u-demo").count()).isEqualTo(2);

    cartService.removeSelected("u-demo");
    assertThat(cartService.cart("u-demo")).extracting(CartService.CartItemView::productId).containsExactly("p-phone");
  }

  @Test
  void orderLifecycleCopiesItemSnapshotsAndSupportsPayShipFinish() {
    cartService.addItem("u-demo", "p-coffee", 2);
    OrderService.OrderView order =
        orderService.createFromSelectedCart(
            "u-demo", new OrderService.AddressCommand("张三", "13800000000", "北京市海淀区学院路 1 号"));

    assertThat(order.status()).isEqualTo("pending-payment");
    assertThat(order.totalAmount().intValue()).isEqualTo(158);
    assertThat(order.items()).first().extracting(OrderService.OrderItemView::name).isEqualTo("晨光冷萃咖啡套装");

    OrderService.OrderView paid = orderService.payOrder("u-demo", order.id());
    assertThat(paid.status()).isEqualTo("paid");

    OrderService.OrderView shipped = orderService.shipOrder(order.id(), "SF123456");
    assertThat(shipped.status()).isEqualTo("shipped");
    assertThat(shipped.logistics().trackingNo()).isEqualTo("SF123456");

    OrderService.OrderView finished = orderService.finishOrder("u-demo", order.id());
    assertThat(finished.status()).isEqualTo("finished");
    assertThat(finished.logistics().traces()).contains("用户已确认收货");
  }

  @Test
  void orderCreationRejectsEmptySelections() {
    assertThatThrownBy(
            () ->
                orderService.createFromSelectedCart(
                    "u-demo", new OrderService.AddressCommand("张三", "13800000000", "北京市海淀区学院路 1 号")))
        .isInstanceOf(BusinessException.class)
        .hasMessageContaining("请选择需要结算的商品");
  }

  @Test
  void buyNowOrderCreationCopiesSingleProductWithoutCartSelection() {
    OrderService.OrderView order =
        orderService.createBuyNow(
            "u-demo",
            "p-watch",
            2,
            new OrderService.AddressCommand("张三", "13800000000", "北京市海淀区学院路 1 号"));

    assertThat(order.items()).hasSize(1);
    assertThat(order.items()).first().extracting(OrderService.OrderItemView::productId).isEqualTo("p-watch");
    assertThat(order.totalAmount().intValue()).isEqualTo(1798);
    assertThat(cartService.cart("u-demo")).isEmpty();
  }
}
