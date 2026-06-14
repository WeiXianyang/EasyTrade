package com.easytrade.controller;

import com.easytrade.common.ApiResponse;
import com.easytrade.service.CatalogService;
import java.util.List;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
public class AdminCatalogController {
  private final CatalogService catalogService;

  public AdminCatalogController(CatalogService catalogService) {
    this.catalogService = catalogService;
  }

  public record StatusRequest(String status) {}

  @GetMapping("/products")
  public ApiResponse<List<CatalogService.ProductView>> products(
      @RequestParam(required = false) String keyword,
      @RequestParam(defaultValue = "all") String status) {
    return ApiResponse.success(catalogService.adminProducts(keyword, status));
  }

  @PostMapping("/products")
  public ApiResponse<CatalogService.ProductView> addProduct(
      @RequestBody CatalogService.ProductCommand command) {
    return ApiResponse.success(catalogService.addProduct(command));
  }

  @PutMapping("/products/{productId}")
  public ApiResponse<CatalogService.ProductView> updateProduct(
      @PathVariable String productId, @RequestBody CatalogService.ProductCommand command) {
    return ApiResponse.success(catalogService.updateProduct(productId, command));
  }

  @PatchMapping("/products/{productId}/status")
  public ApiResponse<CatalogService.ProductView> toggleStatus(
      @PathVariable String productId, @RequestBody StatusRequest request) {
    return ApiResponse.success(catalogService.toggleStatus(productId, request.status()));
  }

  @DeleteMapping("/products/{productId}")
  public ApiResponse<String> deleteProduct(@PathVariable String productId) {
    catalogService.deleteProduct(productId);
    return ApiResponse.success("商品已删除");
  }

  @PostMapping("/categories")
  public ApiResponse<CatalogService.CategoryView> addCategory(
      @RequestBody CatalogService.CategoryCommand command) {
    return ApiResponse.success(catalogService.addCategory(command));
  }

  @PutMapping("/categories/{categoryId}")
  public ApiResponse<CatalogService.CategoryView> updateCategory(
      @PathVariable String categoryId, @RequestBody CatalogService.CategoryCommand command) {
    return ApiResponse.success(catalogService.updateCategory(categoryId, command));
  }

  @DeleteMapping("/categories/{categoryId}")
  public ApiResponse<String> deleteCategory(@PathVariable String categoryId) {
    catalogService.deleteCategory(categoryId);
    return ApiResponse.success("分类已删除");
  }
}
