package com.easytrade.controller;

import com.easytrade.common.ApiResponse;
import com.easytrade.service.CatalogService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class CatalogController {
  private final CatalogService catalogService;

  public CatalogController(CatalogService catalogService) {
    this.catalogService = catalogService;
  }

  @GetMapping("/categories")
  public ApiResponse<List<CatalogService.CategoryView>> categories() {
    return ApiResponse.success(catalogService.categories());
  }

  @GetMapping("/products")
  public ApiResponse<List<CatalogService.ProductView>> products(
      @RequestParam(required = false) String keyword,
      @RequestParam(required = false) String categoryId) {
    return ApiResponse.success(catalogService.visibleProducts(keyword, categoryId));
  }

  @GetMapping("/products/hot")
  public ApiResponse<List<CatalogService.ProductView>> hotProducts(
      @RequestParam(defaultValue = "4") int limit) {
    return ApiResponse.success(catalogService.hotProducts(limit));
  }

  @GetMapping("/products/{productId}")
  public ApiResponse<CatalogService.ProductView> product(@PathVariable String productId) {
    return ApiResponse.success(catalogService.productById(productId));
  }
}
