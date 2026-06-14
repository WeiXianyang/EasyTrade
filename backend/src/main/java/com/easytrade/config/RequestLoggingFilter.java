package com.easytrade.config;

import com.easytrade.entity.User;
import com.easytrade.service.AdminOpsService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class RequestLoggingFilter extends OncePerRequestFilter {
  private final AdminOpsService adminOpsService;

  public RequestLoggingFilter(AdminOpsService adminOpsService) {
    this.adminOpsService = adminOpsService;
  }

  @Override
  protected boolean shouldNotFilter(HttpServletRequest request) {
    return !request.getRequestURI().startsWith("/api/");
  }

  @Override
  protected void doFilterInternal(
      HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
      throws ServletException, IOException {
    long startedAt = System.currentTimeMillis();
    Exception failure = null;
    try {
      filterChain.doFilter(request, response);
    } catch (ServletException | IOException exception) {
      failure = exception;
      throw exception;
    } catch (RuntimeException exception) {
      failure = exception;
      throw exception;
    } finally {
      recordRequest(request, response, startedAt, failure);
    }
  }

  private void recordRequest(
      HttpServletRequest request, HttpServletResponse response, long startedAt, Exception failure) {
    try {
      User actor = currentUser();
      adminOpsService.recordRequest(
          new AdminOpsService.RequestLogCommand(
              request.getMethod(),
              request.getRequestURI(),
              response.getStatus(),
              System.currentTimeMillis() - startedAt,
              moduleName(request.getRequestURI()),
              actor == null ? "匿名用户" : actor.getName(),
              actor == null ? "anonymous" : actor.getRole(),
              failure == null ? "" : failure.getMessage()));
    } catch (RuntimeException ignored) {
      // Logging must never break the business request.
    }
  }

  private User currentUser() {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    if (authentication == null || !(authentication.getPrincipal() instanceof User user)) {
      return null;
    }
    return user;
  }

  private String moduleName(String path) {
    if (path.contains("/admin/products") || path.contains("/products")) return "商品管理";
    if (path.contains("/admin/categories") || path.contains("/categories")) return "分类管理";
    if (path.contains("/admin/orders") || path.contains("/orders")) return "订单管理";
    if (path.contains("/permissions")) return "权限管理";
    if (path.contains("/cart")) return "前台购物车";
    if (path.contains("/auth")) return "认证登录";
    if (path.contains("/activity")) return "用户活动";
    return "系统接口";
  }
}
