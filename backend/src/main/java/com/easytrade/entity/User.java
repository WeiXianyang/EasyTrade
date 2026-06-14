package com.easytrade.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "users")
public class User {
  @Id private String id;

  @Column(nullable = false, unique = true)
  private String username;

  @Column(unique = true)
  private String email;

  @Column(unique = true)
  private String phone;

  @Column(nullable = false)
  private String passwordHash;

  @Column(nullable = false)
  private String role;

  @Column(nullable = false)
  private String name;

  private String addressName;
  private String addressPhone;
  private String addressDetail;

  public static User customer(
      String id,
      String username,
      String email,
      String phone,
      String passwordHash,
      String name,
      String addressName,
      String addressPhone,
      String addressDetail) {
    User user = new User();
    user.id = id;
    user.username = username;
    user.email = email;
    user.phone = phone;
    user.passwordHash = passwordHash;
    user.role = "customer";
    user.name = name;
    user.addressName = addressName;
    user.addressPhone = addressPhone;
    user.addressDetail = addressDetail;
    return user;
  }

  public static User admin(
      String id, String username, String passwordHash, String role, String name) {
    User user = new User();
    user.id = id;
    user.username = username;
    user.passwordHash = passwordHash;
    user.role = role;
    user.name = name;
    return user;
  }

  public String getId() {
    return id;
  }

  public void setId(String id) {
    this.id = id;
  }

  public String getUsername() {
    return username;
  }

  public void setUsername(String username) {
    this.username = username;
  }

  public String getEmail() {
    return email;
  }

  public void setEmail(String email) {
    this.email = email;
  }

  public String getPhone() {
    return phone;
  }

  public void setPhone(String phone) {
    this.phone = phone;
  }

  public String getPasswordHash() {
    return passwordHash;
  }

  public void setPasswordHash(String passwordHash) {
    this.passwordHash = passwordHash;
  }

  public String getRole() {
    return role;
  }

  public void setRole(String role) {
    this.role = role;
  }

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public String getAddressName() {
    return addressName;
  }

  public void setAddressName(String addressName) {
    this.addressName = addressName;
  }

  public String getAddressPhone() {
    return addressPhone;
  }

  public void setAddressPhone(String addressPhone) {
    this.addressPhone = addressPhone;
  }

  public String getAddressDetail() {
    return addressDetail;
  }

  public void setAddressDetail(String addressDetail) {
    this.addressDetail = addressDetail;
  }
}
