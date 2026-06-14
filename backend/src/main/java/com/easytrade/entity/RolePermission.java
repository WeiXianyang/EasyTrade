package com.easytrade.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class RolePermission {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  private String roleName;
  private String moduleName;

  public RolePermission() {}

  public RolePermission(String roleName, String moduleName) {
    this.roleName = roleName;
    this.moduleName = moduleName;
  }

  public String getRoleName() {
    return roleName;
  }

  public String getModuleName() {
    return moduleName;
  }
}
