package com.easytrade.repository;

import com.easytrade.entity.Footprint;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FootprintRepository extends JpaRepository<Footprint, Long> {
  Optional<Footprint> findByUserIdAndProductId(String userId, String productId);

  List<Footprint> findByUserIdOrderByViewedAtDesc(String userId);
}
