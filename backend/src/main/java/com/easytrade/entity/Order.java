package com.easytrade.entity;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
public class Order {
  @Id private String id;

  @Column(nullable = false, unique = true)
  private String orderNo;

  @Column(nullable = false)
  private String userId;

  private LocalDateTime createTime;
  private LocalDateTime payTime;
  private LocalDateTime shippedAt;

  @Column(nullable = false)
  private String status;

  @Column(nullable = false, precision = 12, scale = 2)
  private BigDecimal totalAmount;

  private String addressName;
  private String addressPhone;
  private String addressDetail;
  private String logisticsCompany;
  private String trackingNo;

  @ElementCollection(fetch = FetchType.EAGER)
  @CollectionTable(name = "order_items", joinColumns = @JoinColumn(name = "order_id"))
  private List<OrderItem> items = new ArrayList<>();

  @ElementCollection(fetch = FetchType.EAGER)
  @CollectionTable(name = "order_logistics_traces", joinColumns = @JoinColumn(name = "order_id"))
  @Column(name = "trace")
  private List<String> traces = new ArrayList<>();

  public String getId() {
    return id;
  }

  public void setId(String id) {
    this.id = id;
  }

  public String getOrderNo() {
    return orderNo;
  }

  public void setOrderNo(String orderNo) {
    this.orderNo = orderNo;
  }

  public String getUserId() {
    return userId;
  }

  public void setUserId(String userId) {
    this.userId = userId;
  }

  public LocalDateTime getCreateTime() {
    return createTime;
  }

  public void setCreateTime(LocalDateTime createTime) {
    this.createTime = createTime;
  }

  public LocalDateTime getPayTime() {
    return payTime;
  }

  public void setPayTime(LocalDateTime payTime) {
    this.payTime = payTime;
  }

  public LocalDateTime getShippedAt() {
    return shippedAt;
  }

  public void setShippedAt(LocalDateTime shippedAt) {
    this.shippedAt = shippedAt;
  }

  public String getStatus() {
    return status;
  }

  public void setStatus(String status) {
    this.status = status;
  }

  public BigDecimal getTotalAmount() {
    return totalAmount;
  }

  public void setTotalAmount(BigDecimal totalAmount) {
    this.totalAmount = totalAmount;
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

  public String getLogisticsCompany() {
    return logisticsCompany;
  }

  public void setLogisticsCompany(String logisticsCompany) {
    this.logisticsCompany = logisticsCompany;
  }

  public String getTrackingNo() {
    return trackingNo;
  }

  public void setTrackingNo(String trackingNo) {
    this.trackingNo = trackingNo;
  }

  public List<OrderItem> getItems() {
    return items;
  }

  public void setItems(List<OrderItem> items) {
    this.items = new ArrayList<>(items);
  }

  public List<String> getTraces() {
    return traces;
  }

  public void setTraces(List<String> traces) {
    this.traces = new ArrayList<>(traces);
  }
}
