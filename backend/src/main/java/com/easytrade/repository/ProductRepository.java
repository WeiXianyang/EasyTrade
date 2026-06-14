package com.easytrade.repository;

import com.easytrade.entity.Product;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, String> {
  boolean existsByCategoryId(String categoryId);

  List<Product> findByCategoryId(String categoryId);
}
