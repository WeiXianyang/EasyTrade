package com.easytrade;

import static org.assertj.core.api.Assertions.assertThat;

import com.easytrade.service.ActivityService;
import com.easytrade.service.AdminOpsService;
import com.easytrade.service.CatalogService;
import com.easytrade.service.DemoResetService;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class AdminOpsServiceTests {
  @Autowired private AdminOpsService adminOpsService;
  @Autowired private ActivityService activityService;
  @Autowired private CatalogService catalogService;
  @Autowired private DemoResetService demoResetService;

  @Test
  void permissionsPersistOperatorChangesAndKeepAdminSafeguards() {
    AdminOpsService.RolePermissions updated =
        adminOpsService.updateRolePermissions("operator", List.of("dashboard", "products"));

    assertThat(updated.permissions().get("operator")).containsExactly("dashboard", "products");
    assertThat(adminOpsService.canAccess("operator", "orders")).isFalse();

    AdminOpsService.RolePermissions safeguarded =
        adminOpsService.updateRolePermissions("admin", List.of("products"));
    assertThat(safeguarded.permissions().get("admin")).contains("dashboard", "roles", "products");
  }

  @Test
  void requestAndAuditLogsCanBeRecordedAndCleared() {
    adminOpsService.recordRequest(
        new AdminOpsService.RequestLogCommand(
            "POST", "/api/admin/products", 201, 12, "商品管理", "系统管理员", "admin", ""));
    adminOpsService.recordAudit(
        new AdminOpsService.AuditLogCommand(
            "a-admin", "系统管理员", "admin", "商品管理", "新增商品", "演示马克杯", "success", "POST"));

    assertThat(adminOpsService.requestLogs(40)).hasSize(1);
    assertThat(adminOpsService.auditLogs(40)).hasSize(1);

    adminOpsService.clearRequestLogs();
    adminOpsService.clearAuditLogs();
    assertThat(adminOpsService.requestLogs(40)).isEmpty();
    assertThat(adminOpsService.auditLogs(40)).isEmpty();
  }

  @Test
  void activityTogglesAndDedupesPerUserSignals() {
    assertThat(activityService.toggleFavorite("u-demo", "p-phone").active()).isTrue();
    assertThat(activityService.toggleFavorite("u-demo", "p-phone").active()).isFalse();

    assertThat(activityService.toggleCategoryFollow("u-demo", "digital").active()).isTrue();
    activityService.recordFootprint("u-demo", "p-phone");
    activityService.recordFootprint("u-demo", "p-watch");
    activityService.recordFootprint("u-demo", "p-phone");

    assertThat(activityService.followedCategoryIds("u-demo")).containsExactly("digital");
    assertThat(activityService.footprints("u-demo", 2)).extracting(ActivityService.ActivityItem::productId).containsExactly("p-phone", "p-watch");
  }

  @Test
  void demoResetRestoresCatalogPermissionsAndReturnsScenarioSteps() {
    catalogService.toggleStatus("p-phone", "off");
    adminOpsService.updateRolePermissions("operator", List.of("dashboard", "products"));

    DemoResetService.DemoResetResult result =
        demoResetService.resetDemoData(new DemoResetService.Actor("a-admin", "系统管理员", "admin"));

    assertThat(catalogService.productById("p-phone").status()).isEqualTo("on");
    assertThat(adminOpsService.canAccess("operator", "orders")).isTrue();
    assertThat(result.steps()).hasSizeGreaterThanOrEqualTo(5);
    assertThat(adminOpsService.auditLogs(10)).extracting(AdminOpsService.AuditLogView::action).contains("重置演示数据");
  }
}
