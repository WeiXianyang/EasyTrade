package com.easytrade.controller;

import com.easytrade.common.ApiResponse;
import com.easytrade.entity.User;
import com.easytrade.service.CartService;
import java.util.List;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/cart")
public class CartController {
  private final CartService cartService;

  public CartController(CartService cartService) {
    this.cartService = cartService;
  }

  public record CartItemRequest(String productId, int quantity) {}

  public record CartSelectRequest(String productId, boolean selected) {}

  public record CartSelectAllRequest(boolean selected) {}

  @GetMapping
  public ApiResponse<List<CartService.CartItemView>> cart(@AuthenticationPrincipal User user) {
    return ApiResponse.success(cartService.cart(user.getId()));
  }

  @GetMapping("/summary")
  public ApiResponse<CartService.CartSummary> summary(@AuthenticationPrincipal User user) {
    return ApiResponse.success(cartService.selectedSummary(user.getId()));
  }

  @PostMapping("/items")
  public ApiResponse<List<CartService.CartItemView>> addItem(
      @AuthenticationPrincipal User user, @RequestBody CartItemRequest request) {
    return ApiResponse.success(cartService.addItem(user.getId(), request.productId(), request.quantity()));
  }

  @PatchMapping("/items/quantity")
  public ApiResponse<List<CartService.CartItemView>> updateQuantity(
      @AuthenticationPrincipal User user, @RequestBody CartItemRequest request) {
    return ApiResponse.success(cartService.updateQuantity(user.getId(), request.productId(), request.quantity()));
  }

  @PatchMapping("/items/selected")
  public ApiResponse<List<CartService.CartItemView>> setSelected(
      @AuthenticationPrincipal User user, @RequestBody CartSelectRequest request) {
    return ApiResponse.success(cartService.setSelected(user.getId(), request.productId(), request.selected()));
  }

  @PatchMapping("/items/select-all")
  public ApiResponse<List<CartService.CartItemView>> setAllSelected(
      @AuthenticationPrincipal User user, @RequestBody CartSelectAllRequest request) {
    return ApiResponse.success(cartService.setAllSelected(user.getId(), request.selected()));
  }

  @DeleteMapping("/items")
  public ApiResponse<List<CartService.CartItemView>> removeItem(
      @AuthenticationPrincipal User user, @RequestBody CartItemRequest request) {
    return ApiResponse.success(cartService.removeItem(user.getId(), request.productId()));
  }

  @DeleteMapping("/items/selected")
  public ApiResponse<List<CartService.CartItemView>> removeSelected(@AuthenticationPrincipal User user) {
    return ApiResponse.success(cartService.removeSelected(user.getId()));
  }
}
