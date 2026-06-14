package com.easytrade.repository;

import com.easytrade.entity.Favorite;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FavoriteRepository extends JpaRepository<Favorite, Long> {
  Optional<Favorite> findByUserIdAndProductId(String userId, String productId);

  List<Favorite> findByUserIdOrderByCreatedAtDesc(String userId);
}
