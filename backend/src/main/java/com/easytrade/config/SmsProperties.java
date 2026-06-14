package com.easytrade.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "easytrade.sms")
public record SmsProperties(
    String accessKeyId, String accessKeySecret, String signName, String templateCode, String region) {}
