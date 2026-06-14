package com.easytrade;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.easytrade.common.BusinessException;
import com.easytrade.entity.VerificationCode;
import com.easytrade.repository.VerificationCodeRepository;
import com.easytrade.service.AuthService;
import java.time.LocalDateTime;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class AuthServiceTests {
  @Autowired private AuthService authService;
  @Autowired private VerificationCodeRepository verificationCodeRepository;

  @Test
  void passwordLoginAcceptsSeedCustomerWithoutExposingPasswordHash() {
    AuthService.AuthSession session = authService.login("buyer@example.com", "123456");

    assertThat(session.token()).isNotBlank();
    assertThat(session.user().id()).isEqualTo("u-demo");
    assertThat(session.user().role()).isEqualTo("customer");
    assertThat(session.user().passwordHash()).isNull();
  }

  @Test
  void adminLoginAcceptsSeedAdminAndRejectsCustomerRole() {
    AuthService.AuthSession admin = authService.adminLogin("admin", "admin123");

    assertThat(admin.user().role()).isEqualTo("admin");
    assertThatThrownBy(() -> authService.adminLogin("buyer@example.com", "123456"))
        .isInstanceOf(BusinessException.class)
        .hasMessageContaining("后台账号或密码错误");
  }

  @Test
  void registerRejectsDuplicateIdentifiers() {
    assertThatThrownBy(
            () ->
                authService.register(
                    new AuthService.RegisterCommand(
                        "buyer", "buyer@example.com", "13800000000", "123456", "校园买手", "海淀")))
        .isInstanceOf(BusinessException.class)
        .hasMessageContaining("账号已存在");
  }

  @Test
  void verificationCodeLoginCreatesCustomerWhenPhoneIsNew() {
    verificationCodeRepository.save(
        new VerificationCode("13900000000", "123456", LocalDateTime.now().plusMinutes(5), false));

    AuthService.AuthSession session = authService.loginByCode("13900000000", "123456");

    assertThat(session.user().phone()).isEqualTo("13900000000");
    assertThat(session.user().role()).isEqualTo("customer");
    assertThat(session.user().username()).isEqualTo("u_13900000000");
  }

  @Test
  void verificationCodeLoginRejectsInvalidCode() {
    verificationCodeRepository.save(
        new VerificationCode("13900000001", "123456", LocalDateTime.now().plusMinutes(5), false));

    assertThatThrownBy(() -> authService.loginByCode("13900000001", "000000"))
        .isInstanceOf(BusinessException.class)
        .hasMessageContaining("验证码错误或已过期");
  }
}
