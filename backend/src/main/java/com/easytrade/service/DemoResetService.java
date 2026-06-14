package com.easytrade.service;

import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DemoResetService {
  private final CatalogService catalogService;
  private final AdminOpsService adminOpsService;

  public DemoResetService(CatalogService catalogService, AdminOpsService adminOpsService) {
    this.catalogService = catalogService;
    this.adminOpsService = adminOpsService;
  }

  public record Actor(String id, String name, String role) {}

  public record ScenarioStep(String title, String description) {}

  public record DemoResetResult(List<ScenarioStep> steps) {}

  @Transactional
  public DemoResetResult resetDemoData(Actor actor) {
    catalogService.toggleStatus("p-phone", "on");
    catalogService.toggleStatus("p-speaker", "off");
    adminOpsService.resetRolePermissions();
    adminOpsService.recordAudit(
        new AdminOpsService.AuditLogCommand(
            actor.id(), actor.name(), actor.role(), "演示数据", "重置演示数据", "EasyTrade", "success", "demo reset"));
    return new DemoResetResult(
        List.of(
            new ScenarioStep("用户登录", "使用 buyer@example.com 进入商城"),
            new ScenarioStep("浏览商品", "进入热门商品或分类列表"),
            new ScenarioStep("加入购物车", "选择商品并确认购物车数量"),
            new ScenarioStep("创建订单", "填写收货地址并提交订单"),
            new ScenarioStep("后台发货", "管理员在订单管理中录入物流单号")));
  }
}
