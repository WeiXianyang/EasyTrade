package com.easytrade.repository;

import com.easytrade.entity.CategoryFollow;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryFollowRepository extends JpaRepository<CategoryFollow, Long> {
  Optional<CategoryFollow> findByUserIdAndCategoryId(String userId, String categoryId);

  List<CategoryFollow> findByUserIdOrderByCreatedAtDesc(String userId);
}
