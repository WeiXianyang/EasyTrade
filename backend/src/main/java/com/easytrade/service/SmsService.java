package com.easytrade.service;

public interface SmsService {
  boolean sendVerificationCode(String phone, String code);
}
