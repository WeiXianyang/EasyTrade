package com.easytrade.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "easytrade.jwt")
public record JwtProperties(String secret, long expirationMs) {}
