package com.easytrade.repository;

import com.easytrade.entity.CartItem;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {
  List<CartItem> findByUserIdOrderByAddedAtAsc(String userId);

  Optional<CartItem> findByUserIdAndProductId(String userId, String productId);

  void deleteByUserIdAndProductId(String userId, String productId);

  void deleteByUserIdAndSelectedTrue(String userId);
}
