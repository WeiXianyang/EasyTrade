package com.easytrade.entity;

import jakarta.persistence.Embeddable;
import java.math.BigDecimal;

@Embeddable
public class OrderItem {
  private String productId;
  private String name;
  private BigDecimal price;
  private int quantity;
  private String image;

  public OrderItem() {}

  public OrderItem(String productId, String name, BigDecimal price, int quantity, String image) {
    this.productId = productId;
    this.name = name;
    this.price = price;
    this.quantity = quantity;
    this.image = image;
  }

  public String getProductId() {
    return productId;
  }

  public String getName() {
    return name;
  }

  public BigDecimal getPrice() {
    return price;
  }

  public int getQuantity() {
    return quantity;
  }

  public String getImage() {
    return image;
  }
}
