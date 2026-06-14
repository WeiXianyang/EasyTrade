package com.easytrade.service;

import com.easytrade.entity.AuditLog;
import com.easytrade.entity.RequestLog;
import com.easytrade.entity.RolePermission;
import com.easytrade.repository.AuditLogRepository;
import com.easytrade.repository.RequestLogRepository;
import com.easytrade.repository.RolePermissionRepository;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminOpsService {
  private static final List<String> MODULES = List.of("dashboard", "products", "categories", "orders", "roles");
  private static final List<String> ADMIN_DEFAULT = MODULES;
  private static final List<String> OPERATOR_DEFAULT = List.of("dashboard", "orders");
  private final RolePermissionRepository permissions;
  private final RequestLogRepository requestLogs;
  private final AuditLogRepository auditLogs;

  public AdminOpsService(
      RolePermissionRepository permissions,
      RequestLogRepository requestLogs,
      AuditLogRepository auditLogs) {
    this.permissions = permissions;
    this.requestLogs = requestLogs;
    this.auditLogs = auditLogs;
  }

  public record RolePermissions(Map<String, List<String>> permissions) {}

  public record RequestLogCommand(
      String method,
      String path,
      int status,
      long durationMs,
      String moduleName,
      String actorName,
      String actorRole,
      String errorMessage) {}

  public record RequestLogView(
      String id,
      String method,
      String path,
      int status,
      long durationMs,
      String moduleName,
      String actorName,
      String actorRole,
      String errorMessage,
      String createdAt) {}

  public record AuditLogCommand(
      String actorId,
      String actorName,
      String actorRole,
      String moduleName,
      String action,
      String target,
      String status,
      String detail) {}

  public record AuditLogView(
      String id,
      String actorId,
      String actorName,
      String actorRole,
      String moduleName,
      String action,
      String target,
      String status,
      String detail,
      String createdAt) {}

  @Transactional
  public RolePermissions rolePermissions() {
    ensureDefaults();
    Map<String, List<String>> result = new LinkedHashMap<>();
    result.put("admin", modulesFor("admin"));
    result.put("operator", modulesFor("operator"));
    return new RolePermissions(result);
  }

  @Transactional
  public RolePermissions updateRolePermissions(String role, List<String> moduleNames) {
    ensureDefaults();
    List<String> normalized = new ArrayList<>(moduleNames == null ? List.of() : moduleNames);
    normalized.removeIf(module -> !MODULES.contains(module));
    if ("admin".equals(role)) {
      normalized.add("dashboard");
      normalized.add("roles");
    }
    permissions.deleteByRoleName(role);
    normalized.stream().distinct().forEach(module -> permissions.save(new RolePermission(role, module)));
    return rolePermissions();
  }

  @Transactional
  public RolePermissions resetRolePermissions() {
    permissions.deleteAll();
    saveDefaults();
    return rolePermissions();
  }

  @Transactional(readOnly = true)
  public boolean canAccess(String role, String moduleName) {
    return modulesFor(role).contains(moduleName);
  }

  @Transactional
  public RequestLogView recordRequest(RequestLogCommand command) {
    RequestLog log = new RequestLog();
    log.setId("req-" + UUID.randomUUID());
    log.setMethod(command.method());
    log.setPath(command.path());
    log.setStatus(command.status());
    log.setDurationMs(command.durationMs());
    log.setModuleName(command.moduleName());
    log.setActorName(command.actorName());
    log.setActorRole(command.actorRole());
    log.setErrorMessage(command.errorMessage());
    log.setCreatedAt(LocalDateTime.now());
    return toRequestLogView(requestLogs.save(log));
  }

  @Transactional(readOnly = true)
  public List<RequestLogView> requestLogs(int limit) {
    return requestLogs.findAllByOrderByCreatedAtDesc().stream().limit(limit).map(this::toRequestLogView).toList();
  }

  @Transactional
  public void clearRequestLogs() {
    requestLogs.deleteAll();
  }

  @Transactional
  public AuditLogView recordAudit(AuditLogCommand command) {
    AuditLog log = new AuditLog();
    log.setId("audit-" + UUID.randomUUID());
    log.setActorId(command.actorId());
    log.setActorName(command.actorName());
    log.setActorRole(command.actorRole());
    log.setModuleName(command.moduleName());
    log.setAction(command.action());
    log.setTarget(command.target());
    log.setStatus(command.status());
    log.setDetail(command.detail());
    log.setCreatedAt(LocalDateTime.now());
    return toAuditLogView(auditLogs.save(log));
  }

  @Transactional(readOnly = true)
  public List<AuditLogView> auditLogs(int limit) {
    return auditLogs.findAllByOrderByCreatedAtDesc().stream().limit(limit).map(this::toAuditLogView).toList();
  }

  @Transactional
  public void clearAuditLogs() {
    auditLogs.deleteAll();
  }

  private void ensureDefaults() {
    if (permissions.count() == 0) {
      saveDefaults();
    }
  }

  private void saveDefaults() {
    ADMIN_DEFAULT.forEach(module -> permissions.save(new RolePermission("admin", module)));
    OPERATOR_DEFAULT.forEach(module -> permissions.save(new RolePermission("operator", module)));
  }

  private List<String> modulesFor(String role) {
    List<String> modules = permissions.findByRoleName(role).stream().map(RolePermission::getModuleName).toList();
    if (modules.isEmpty()) {
      return "admin".equals(role) ? ADMIN_DEFAULT : OPERATOR_DEFAULT;
    }
    return modules.stream().filter(Set.copyOf(MODULES)::contains).distinct().toList();
  }

  private RequestLogView toRequestLogView(RequestLog log) {
    return new RequestLogView(
        log.getId(),
        log.getMethod(),
        log.getPath(),
        log.getStatus(),
        log.getDurationMs(),
        log.getModuleName(),
        log.getActorName(),
        log.getActorRole(),
        log.getErrorMessage(),
        format(log.getCreatedAt()));
  }

  private AuditLogView toAuditLogView(AuditLog log) {
    return new AuditLogView(
        log.getId(),
        log.getActorId(),
        log.getActorName(),
        log.getActorRole(),
        log.getModuleName(),
        log.getAction(),
        log.getTarget(),
        log.getStatus(),
        log.getDetail(),
        format(log.getCreatedAt()));
  }

  private String format(LocalDateTime time) {
    return time == null ? "" : time.format(DateTimeFormatter.ofPattern("yyyy/M/d HH:mm:ss"));
  }
}
