package com.easytrade.repository;

import com.easytrade.entity.Order;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderRepository extends JpaRepository<Order, String> {
  List<Order> findByUserIdOrderByCreateTimeDesc(String userId);

  List<Order> findAllByOrderByCreateTimeDesc();
}
