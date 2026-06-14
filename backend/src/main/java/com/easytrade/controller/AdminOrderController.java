package com.easytrade.controller;

import com.easytrade.common.ApiResponse;
import com.easytrade.service.OrderService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/orders")
public class AdminOrderController {
  private final OrderService orderService;

  public AdminOrderController(OrderService orderService) {
    this.orderService = orderService;
  }

  public record ShipRequest(String trackingNo) {}

  @GetMapping
  public ApiResponse<List<OrderService.OrderView>> orders() {
    return ApiResponse.success(orderService.allOrders());
  }

  @PatchMapping("/{orderId}/ship")
  public ApiResponse<OrderService.OrderView> ship(
      @PathVariable String orderId, @RequestBody ShipRequest request) {
    return ApiResponse.success(orderService.shipOrder(orderId, request.trackingNo()));
  }
}
