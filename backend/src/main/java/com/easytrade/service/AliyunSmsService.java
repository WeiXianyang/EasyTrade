package com.easytrade.service;

import com.aliyun.auth.credentials.Credential;
import com.aliyun.auth.credentials.provider.StaticCredentialProvider;
import com.aliyun.sdk.service.dysmsapi20170525.AsyncClient;
import com.aliyun.sdk.service.dysmsapi20170525.models.SendSmsRequest;
import com.aliyun.sdk.service.dysmsapi20170525.models.SendSmsResponse;
import com.easytrade.config.SmsProperties;
import darabonba.core.client.ClientOverrideConfiguration;
import java.util.concurrent.CompletableFuture;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class AliyunSmsService implements SmsService {
  private static final Logger log = LoggerFactory.getLogger(AliyunSmsService.class);
  private final SmsProperties properties;

  public AliyunSmsService(SmsProperties properties) {
    this.properties = properties;
  }

  @Override
  public boolean sendVerificationCode(String phone, String code) {
    if (isBlank(properties.accessKeyId())
        || isBlank(properties.accessKeySecret())
        || isBlank(properties.signName())
        || isBlank(properties.templateCode())) {
      log.warn("阿里云短信配置不完整，跳过短信发送，手机号: {}", maskPhone(phone));
      return true;
    }
    try {
      StaticCredentialProvider provider =
          StaticCredentialProvider.create(
              Credential.builder()
                  .accessKeyId(properties.accessKeyId())
                  .accessKeySecret(properties.accessKeySecret())
                  .build());
      try (AsyncClient client =
          AsyncClient.builder()
              .region(properties.region())
              .credentialsProvider(provider)
              .overrideConfiguration(
                  ClientOverrideConfiguration.create().setEndpointOverride("dysmsapi.aliyuncs.com"))
              .build()) {
        SendSmsRequest request =
            SendSmsRequest.builder()
                .signName(properties.signName())
                .templateCode(properties.templateCode())
                .phoneNumbers(phone)
                .templateParam(String.format("{\"code\":\"%s\"}", code))
                .build();
        CompletableFuture<SendSmsResponse> response = client.sendSms(request);
        SendSmsResponse result = response.get();
        return result != null && result.getBody() != null && "OK".equals(result.getBody().getCode());
      }
    } catch (Exception error) {
      log.error("发送阿里云短信失败，手机号: {}", maskPhone(phone), error);
      return false;
    }
  }

  private boolean isBlank(String value) {
    return value == null || value.trim().isEmpty();
  }

  private String maskPhone(String phone) {
    if (phone == null || phone.length() < 7) {
      return phone;
    }
    return phone.substring(0, 3) + "****" + phone.substring(phone.length() - 4);
  }
}
