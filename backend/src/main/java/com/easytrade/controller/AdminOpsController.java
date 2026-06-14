package com.easytrade.controller;

import com.easytrade.common.ApiResponse;
import com.easytrade.entity.User;
import com.easytrade.service.AdminOpsService;
import com.easytrade.service.DemoResetService;
import java.util.List;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
public class AdminOpsController {
  private final AdminOpsService adminOpsService;
  private final DemoResetService demoResetService;

  public AdminOpsController(AdminOpsService adminOpsService, DemoResetService demoResetService) {
    this.adminOpsService = adminOpsService;
    this.demoResetService = demoResetService;
  }

  public record RolePermissionRequest(String role, List<String> modules) {}

  @GetMapping("/permissions")
  public ApiResponse<AdminOpsService.RolePermissions> permissions() {
    return ApiResponse.success(adminOpsService.rolePermissions());
  }

  @PatchMapping("/permissions")
  public ApiResponse<AdminOpsService.RolePermissions> updatePermissions(
      @RequestBody RolePermissionRequest request) {
    return ApiResponse.success(adminOpsService.updateRolePermissions(request.role(), request.modules()));
  }

  @PostMapping("/permissions/reset")
  public ApiResponse<AdminOpsService.RolePermissions> resetPermissions() {
    return ApiResponse.success(adminOpsService.resetRolePermissions());
  }

  @GetMapping("/request-logs")
  public ApiResponse<List<AdminOpsService.RequestLogView>> requestLogs(
      @RequestParam(defaultValue = "80") int limit) {
    return ApiResponse.success(adminOpsService.requestLogs(limit));
  }

  @DeleteMapping("/request-logs")
  public ApiResponse<String> clearRequestLogs() {
    adminOpsService.clearRequestLogs();
    return ApiResponse.success("请求日志已清空");
  }

  @GetMapping("/audit-logs")
  public ApiResponse<List<AdminOpsService.AuditLogView>> auditLogs(
      @RequestParam(defaultValue = "80") int limit) {
    return ApiResponse.success(adminOpsService.auditLogs(limit));
  }

  @DeleteMapping("/audit-logs")
  public ApiResponse<String> clearAuditLogs() {
    adminOpsService.clearAuditLogs();
    return ApiResponse.success("操作审计已清空");
  }

  @PostMapping("/demo/reset")
  public ApiResponse<DemoResetService.DemoResetResult> resetDemo(@AuthenticationPrincipal User user) {
    return ApiResponse.success(
        demoResetService.resetDemoData(new DemoResetService.Actor(user.getId(), user.getName(), user.getRole())));
  }
}
