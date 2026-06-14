package com.easytrade.service;

import com.easytrade.entity.CategoryFollow;
import com.easytrade.entity.Favorite;
import com.easytrade.entity.Footprint;
import com.easytrade.repository.CategoryFollowRepository;
import com.easytrade.repository.FavoriteRepository;
import com.easytrade.repository.FootprintRepository;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ActivityService {
  private final FavoriteRepository favorites;
  private final CategoryFollowRepository follows;
  private final FootprintRepository footprints;

  public ActivityService(
      FavoriteRepository favorites, CategoryFollowRepository follows, FootprintRepository footprints) {
    this.favorites = favorites;
    this.follows = follows;
    this.footprints = footprints;
  }

  public record ToggleResult(boolean active) {}

  public record ActivityItem(String userId, String productId, String categoryId, String createdAt) {}

  @Transactional
  public ToggleResult toggleFavorite(String userId, String productId) {
    return favorites
        .findByUserIdAndProductId(userId, productId)
        .map(
            favorite -> {
              favorites.delete(favorite);
              return new ToggleResult(false);
            })
        .orElseGet(
            () -> {
              Favorite favorite = new Favorite();
              favorite.setUserId(userId);
              favorite.setProductId(productId);
              favorite.setCreatedAt(LocalDateTime.now());
              favorites.save(favorite);
              return new ToggleResult(true);
            });
  }

  @Transactional
  public ToggleResult toggleCategoryFollow(String userId, String categoryId) {
    return follows
        .findByUserIdAndCategoryId(userId, categoryId)
        .map(
            follow -> {
              follows.delete(follow);
              return new ToggleResult(false);
            })
        .orElseGet(
            () -> {
              CategoryFollow follow = new CategoryFollow();
              follow.setUserId(userId);
              follow.setCategoryId(categoryId);
              follow.setCreatedAt(LocalDateTime.now());
              follows.save(follow);
              return new ToggleResult(true);
            });
  }

  @Transactional
  public void recordFootprint(String userId, String productId) {
    Footprint footprint =
        footprints
            .findByUserIdAndProductId(userId, productId)
            .orElseGet(
                () -> {
                  Footprint next = new Footprint();
                  next.setUserId(userId);
                  next.setProductId(productId);
                  return next;
                });
    footprint.setViewedAt(LocalDateTime.now());
    footprints.save(footprint);
  }

  @Transactional(readOnly = true)
  public List<ActivityItem> favorites(String userId, int limit) {
    return favorites.findByUserIdOrderByCreatedAtDesc(userId).stream()
        .limit(limit)
        .map(item -> new ActivityItem(userId, item.getProductId(), null, item.getCreatedAt().toString()))
        .toList();
  }

  @Transactional(readOnly = true)
  public List<String> followedCategoryIds(String userId) {
    return follows.findByUserIdOrderByCreatedAtDesc(userId).stream().map(CategoryFollow::getCategoryId).toList();
  }

  @Transactional(readOnly = true)
  public List<ActivityItem> footprints(String userId, int limit) {
    return footprints.findByUserIdOrderByViewedAtDesc(userId).stream()
        .limit(limit)
        .map(item -> new ActivityItem(userId, item.getProductId(), null, item.getViewedAt().toString()))
        .toList();
  }
}
