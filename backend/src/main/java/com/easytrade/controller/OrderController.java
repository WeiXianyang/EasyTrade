package com.easytrade.controller;

import com.easytrade.common.ApiResponse;
import com.easytrade.entity.User;
import com.easytrade.service.OrderService;
import java.util.List;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/orders")
public class OrderController {
  private final OrderService orderService;

  public OrderController(OrderService orderService) {
    this.orderService = orderService;
  }

  public record BuyNowRequest(String productId, int quantity, OrderService.AddressCommand address) {}

  @GetMapping
  public ApiResponse<List<OrderService.OrderView>> orders(@AuthenticationPrincipal User user) {
    return ApiResponse.success(orderService.ordersByUser(user.getId()));
  }

  @GetMapping("/{orderId}")
  public ApiResponse<OrderService.OrderView> order(
      @AuthenticationPrincipal User user, @PathVariable String orderId) {
    return ApiResponse.success(orderService.orderById(user.getId(), orderId));
  }

  @PostMapping
  public ApiResponse<OrderService.OrderView> create(
      @AuthenticationPrincipal User user, @RequestBody OrderService.AddressCommand address) {
    return ApiResponse.success(orderService.createFromSelectedCart(user.getId(), address));
  }

  @PostMapping("/buy-now")
  public ApiResponse<OrderService.OrderView> buyNow(
      @AuthenticationPrincipal User user, @RequestBody BuyNowRequest request) {
    return ApiResponse.success(
        orderService.createBuyNow(user.getId(), request.productId(), request.quantity(), request.address()));
  }

  @PatchMapping("/{orderId}/pay")
  public ApiResponse<OrderService.OrderView> pay(
      @AuthenticationPrincipal User user, @PathVariable String orderId) {
    return ApiResponse.success(orderService.payOrder(user.getId(), orderId));
  }

  @PatchMapping("/{orderId}/finish")
  public ApiResponse<OrderService.OrderView> finish(
      @AuthenticationPrincipal User user, @PathVariable String orderId) {
    return ApiResponse.success(orderService.finishOrder(user.getId(), orderId));
  }
}
