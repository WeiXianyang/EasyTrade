package com.easytrade.controller;

import com.easytrade.common.ApiResponse;
import com.easytrade.entity.User;
import com.easytrade.service.ActivityService;
import java.util.List;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/activity")
public class ActivityController {
  private final ActivityService activityService;

  public ActivityController(ActivityService activityService) {
    this.activityService = activityService;
  }

  @PostMapping("/favorites/{productId}/toggle")
  public ApiResponse<ActivityService.ToggleResult> toggleFavorite(
      @AuthenticationPrincipal User user, @PathVariable String productId) {
    return ApiResponse.success(activityService.toggleFavorite(user.getId(), productId));
  }

  @PostMapping("/follows/{categoryId}/toggle")
  public ApiResponse<ActivityService.ToggleResult> toggleFollow(
      @AuthenticationPrincipal User user, @PathVariable String categoryId) {
    return ApiResponse.success(activityService.toggleCategoryFollow(user.getId(), categoryId));
  }

  @PostMapping("/footprints/{productId}")
  public ApiResponse<String> recordFootprint(
      @AuthenticationPrincipal User user, @PathVariable String productId) {
    activityService.recordFootprint(user.getId(), productId);
    return ApiResponse.success("已记录浏览足迹");
  }

  @GetMapping("/favorites")
  public ApiResponse<List<ActivityService.ActivityItem>> favorites(
      @AuthenticationPrincipal User user, @RequestParam(defaultValue = "20") int limit) {
    return ApiResponse.success(activityService.favorites(user.getId(), limit));
  }

  @GetMapping("/followed-category-ids")
  public ApiResponse<List<String>> followedCategoryIds(@AuthenticationPrincipal User user) {
    return ApiResponse.success(activityService.followedCategoryIds(user.getId()));
  }

  @GetMapping("/footprints")
  public ApiResponse<List<ActivityService.ActivityItem>> footprints(
      @AuthenticationPrincipal User user, @RequestParam(defaultValue = "20") int limit) {
    return ApiResponse.success(activityService.footprints(user.getId(), limit));
  }
}
