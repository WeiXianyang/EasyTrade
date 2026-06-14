package com.easytrade;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.easytrade.common.BusinessException;
import com.easytrade.service.CatalogService;
import java.math.BigDecimal;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class CatalogServiceTests {
  @Autowired private CatalogService catalogService;

  @Test
  void visibleProductsExcludeOffShelfAndOutOfStockItems() {
    List<CatalogService.ProductView> visible = catalogService.visibleProducts(null, null);

    assertThat(visible).extracting(CatalogService.ProductView::id).contains("p-phone");
    assertThat(visible).extracting(CatalogService.ProductView::id).doesNotContain("p-speaker");
  }

  @Test
  void hotProductsSortBySoldCount() {
    List<CatalogService.ProductView> hot = catalogService.hotProducts(2);

    assertThat(hot).extracting(CatalogService.ProductView::id).containsExactly("p-coffee", "p-phone");
  }

  @Test
  void adminProductCrudAndStatusChangesAffectShopVisibility() {
    CatalogService.ProductView added =
        catalogService.addProduct(
            new CatalogService.ProductCommand(
                null,
                "演示马克杯",
                "答辩演示专用",
                "home",
                BigDecimal.valueOf(39),
                BigDecimal.valueOf(49),
                20,
                0,
                "on",
                "https://example.com/cup.jpg",
                List.of("新品"),
                "用于展示真实后端商品新增。"));

    assertThat(catalogService.adminProducts(null, "all")).extracting(CatalogService.ProductView::id).contains(added.id());

    CatalogService.ProductView updated =
        catalogService.updateProduct(
            added.id(),
            new CatalogService.ProductCommand(
                added.id(),
                "演示马克杯 Pro",
                added.subtitle(),
                added.categoryId(),
                BigDecimal.valueOf(45),
                added.originalPrice(),
                added.stock(),
                added.sold(),
                "on",
                added.image(),
                added.tags(),
                added.description()));
    assertThat(updated.name()).isEqualTo("演示马克杯 Pro");

    catalogService.toggleStatus(added.id(), "off");
    assertThat(catalogService.visibleProducts(null, null)).extracting(CatalogService.ProductView::id).doesNotContain(added.id());

    catalogService.deleteProduct(added.id());
    assertThat(catalogService.adminProducts(null, "all")).extracting(CatalogService.ProductView::id).doesNotContain(added.id());
  }

  @Test
  void categoryCrudRejectsDuplicatesAndProtectsCategoriesWithProducts() {
    CatalogService.CategoryView category =
        catalogService.addCategory(new CatalogService.CategoryCommand(null, "校园文具", "笔记本、书写工具"));

    assertThat(category.id()).startsWith("c-");
    assertThatThrownBy(() -> catalogService.addCategory(new CatalogService.CategoryCommand(null, "校园文具", "重复")))
        .isInstanceOf(BusinessException.class)
        .hasMessageContaining("分类名称已存在");

    CatalogService.CategoryView updated =
        catalogService.updateCategory(category.id(), new CatalogService.CategoryCommand(category.id(), "精选文具", "精选学习工具"));
    assertThat(updated.name()).isEqualTo("精选文具");

    catalogService.addProduct(
        new CatalogService.ProductCommand(
            null,
            "软面笔记本",
            "课堂记录",
            category.id(),
            BigDecimal.valueOf(12),
            BigDecimal.valueOf(16),
            20,
            0,
            "on",
            "https://example.com/notebook.jpg",
            List.of(),
            "适合课堂和实验记录。"));

    assertThatThrownBy(() -> catalogService.deleteCategory(category.id()))
        .isInstanceOf(BusinessException.class)
        .hasMessageContaining("分类下仍有关联商品");
  }
}
