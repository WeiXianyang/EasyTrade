package com.easytrade.service;

import com.easytrade.common.BusinessException;
import com.easytrade.entity.Category;
import com.easytrade.entity.Product;
import com.easytrade.repository.CategoryRepository;
import com.easytrade.repository.ProductRepository;
import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CatalogService {
  private final ProductRepository products;
  private final CategoryRepository categories;

  public CatalogService(ProductRepository products, CategoryRepository categories) {
    this.products = products;
    this.categories = categories;
  }

  public record CategoryCommand(String id, String name, String description) {}

  public record CategoryView(String id, String name, String description) {}

  public record ProductCommand(
      String id,
      String name,
      String subtitle,
      String categoryId,
      BigDecimal price,
      BigDecimal originalPrice,
      int stock,
      int sold,
      String status,
      String image,
      List<String> tags,
      String description) {}

  public record ProductView(
      String id,
      String name,
      String subtitle,
      String categoryId,
      BigDecimal price,
      BigDecimal originalPrice,
      int stock,
      int sold,
      String status,
      String image,
      List<String> tags,
      String description) {}

  @Transactional(readOnly = true)
  public List<CategoryView> categories() {
    return categories.findAll().stream().map(this::toCategoryView).toList();
  }

  @Transactional(readOnly = true)
  public List<ProductView> visibleProducts(String keyword, String categoryId) {
    return products.findAll().stream()
        .filter(product -> "on".equals(product.getStatus()) && product.getStock() > 0)
        .filter(product -> isBlank(categoryId) || categoryId.equals(product.getCategoryId()))
        .filter(product -> matchesKeyword(product, keyword))
        .map(this::toProductView)
        .toList();
  }

  @Transactional(readOnly = true)
  public List<ProductView> hotProducts(int limit) {
    return visibleProducts(null, null).stream()
        .sorted(Comparator.comparing(ProductView::sold).reversed())
        .limit(limit)
        .toList();
  }

  @Transactional(readOnly = true)
  public List<ProductView> adminProducts(String keyword, String status) {
    return products.findAll().stream()
        .filter(product -> "all".equals(status) || isBlank(status) || status.equals(product.getStatus()))
        .filter(product -> matchesKeyword(product, keyword))
        .map(this::toProductView)
        .toList();
  }

  @Transactional(readOnly = true)
  public ProductView productById(String productId) {
    return products.findById(productId).map(this::toProductView).orElse(null);
  }

  @Transactional
  public ProductView addProduct(ProductCommand command) {
    Product product = new Product();
    product.setId(isBlank(command.id()) ? "p-" + UUID.randomUUID() : command.id());
    applyProduct(product, command);
    return toProductView(products.save(product));
  }

  @Transactional
  public ProductView updateProduct(String productId, ProductCommand command) {
    Product product =
        products.findById(productId).orElseThrow(() -> new BusinessException("商品不存在"));
    applyProduct(product, command);
    return toProductView(products.save(product));
  }

  @Transactional
  public void deleteProduct(String productId) {
    if (!products.existsById(productId)) {
      throw new BusinessException("商品不存在");
    }
    products.deleteById(productId);
  }

  @Transactional
  public ProductView toggleStatus(String productId, String status) {
    Product product =
        products.findById(productId).orElseThrow(() -> new BusinessException("商品不存在"));
    product.setStatus(status);
    return toProductView(product);
  }

  @Transactional
  public CategoryView addCategory(CategoryCommand command) {
    String name = normalizeRequired(command.name(), "分类名称不能为空");
    if (categories.existsByName(name)) {
      throw new BusinessException("分类名称已存在");
    }
    Category category =
        new Category(isBlank(command.id()) ? "c-" + UUID.randomUUID() : command.id(), name, safe(command.description()));
    return toCategoryView(categories.save(category));
  }

  @Transactional
  public CategoryView updateCategory(String categoryId, CategoryCommand command) {
    Category category =
        categories.findById(categoryId).orElseThrow(() -> new BusinessException("分类不存在"));
    String name = normalizeRequired(command.name(), "分类名称不能为空");
    if (categories.existsByNameAndIdNot(name, categoryId)) {
      throw new BusinessException("分类名称已存在");
    }
    category.setName(name);
    category.setDescription(safe(command.description()));
    return toCategoryView(category);
  }

  @Transactional
  public void deleteCategory(String categoryId) {
    if (products.existsByCategoryId(categoryId)) {
      throw new BusinessException("分类下仍有关联商品，不能删除");
    }
    if (!categories.existsById(categoryId)) {
      throw new BusinessException("分类不存在");
    }
    categories.deleteById(categoryId);
  }

  private void applyProduct(Product product, ProductCommand command) {
    if (!categories.existsById(command.categoryId())) {
      throw new BusinessException("分类不存在");
    }
    product.setName(normalizeRequired(command.name(), "商品名称不能为空"));
    product.setSubtitle(safe(command.subtitle()));
    product.setCategoryId(command.categoryId());
    product.setPrice(command.price() == null ? BigDecimal.ZERO : command.price());
    product.setOriginalPrice(command.originalPrice() == null ? product.getPrice() : command.originalPrice());
    product.setStock(Math.max(0, command.stock()));
    product.setSold(Math.max(0, command.sold()));
    product.setStatus(isBlank(command.status()) ? "on" : command.status());
    product.setImage(safe(command.image()));
    product.setTags(command.tags());
    product.setDescription(safe(command.description()));
  }

  private boolean matchesKeyword(Product product, String keyword) {
    if (isBlank(keyword)) {
      return true;
    }
    String value = keyword.toLowerCase(Locale.ROOT).trim();
    return product.getName().toLowerCase(Locale.ROOT).contains(value)
        || product.getSubtitle().toLowerCase(Locale.ROOT).contains(value);
  }

  private ProductView toProductView(Product product) {
    return new ProductView(
        product.getId(),
        product.getName(),
        product.getSubtitle(),
        product.getCategoryId(),
        product.getPrice(),
        product.getOriginalPrice(),
        product.getStock(),
        product.getSold(),
        product.getStatus(),
        product.getImage(),
        List.copyOf(product.getTags()),
        product.getDescription());
  }

  private CategoryView toCategoryView(Category category) {
    return new CategoryView(category.getId(), category.getName(), category.getDescription());
  }

  private String normalizeRequired(String value, String message) {
    if (isBlank(value)) {
      throw new BusinessException(message);
    }
    return value.trim();
  }

  private String safe(String value) {
    return value == null ? "" : value.trim();
  }

  private boolean isBlank(String value) {
    return value == null || value.trim().isEmpty();
  }
}
