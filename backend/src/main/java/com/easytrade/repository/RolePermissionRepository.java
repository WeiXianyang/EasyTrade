package com.easytrade.repository;

import com.easytrade.entity.RolePermission;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RolePermissionRepository extends JpaRepository<RolePermission, Long> {
  List<RolePermission> findByRoleName(String roleName);

  void deleteByRoleName(String roleName);
}
