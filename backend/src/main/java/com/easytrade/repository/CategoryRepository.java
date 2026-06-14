package com.easytrade.repository;

import com.easytrade.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepository extends JpaRepository<Category, String> {
  boolean existsByName(String name);

  boolean existsByNameAndIdNot(String name, String id);
}
