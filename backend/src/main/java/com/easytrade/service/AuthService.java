package com.easytrade.service;

import com.easytrade.common.BusinessException;
import com.easytrade.config.JwtService;
import com.easytrade.entity.User;
import com.easytrade.entity.VerificationCode;
import com.easytrade.repository.UserRepository;
import com.easytrade.repository.VerificationCodeRepository;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Random;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {
  private final UserRepository users;
  private final VerificationCodeRepository verificationCodes;
  private final PasswordEncoder passwordEncoder;
  private final JwtService jwtService;
  private final SmsService smsService;
  private final Random random = new Random();

  public AuthService(
      UserRepository users,
      VerificationCodeRepository verificationCodes,
      PasswordEncoder passwordEncoder,
      JwtService jwtService,
      SmsService smsService) {
    this.users = users;
    this.verificationCodes = verificationCodes;
    this.passwordEncoder = passwordEncoder;
    this.jwtService = jwtService;
    this.smsService = smsService;
  }

  public record Address(String name, String phone, String detail) {}

  public record SafeUser(
      String id,
      String username,
      String email,
      String phone,
      String role,
      String name,
      Address address,
      String passwordHash) {}

  public record AuthSession(String token, SafeUser user) {}

  public record RegisterCommand(
      String username, String email, String phone, String password, String name, String address) {}

  @Transactional
  public AuthSession login(String identifier, String password) {
    User user =
        users.findByIdentifier(identifier)
            .filter(candidate -> "customer".equals(candidate.getRole()))
            .filter(candidate -> passwordEncoder.matches(password, candidate.getPasswordHash()))
            .orElseThrow(() -> new BusinessException(HttpStatus.UNAUTHORIZED, "账号或密码错误"));
    return session(user);
  }

  @Transactional
  public AuthSession adminLogin(String identifier, String password) {
    User user =
        users.findByIdentifier(identifier)
            .filter(candidate -> "admin".equals(candidate.getRole()) || "operator".equals(candidate.getRole()))
            .filter(candidate -> passwordEncoder.matches(password, candidate.getPasswordHash()))
            .orElseThrow(() -> new BusinessException(HttpStatus.UNAUTHORIZED, "后台账号或密码错误"));
    return session(user);
  }

  @Transactional
  public AuthSession register(RegisterCommand command) {
    validatePhone(command.phone());
    if (users.existsByUsernameOrEmailOrPhone(command.username(), command.email(), command.phone())) {
      throw new BusinessException("账号已存在");
    }
    String id = "u-" + System.currentTimeMillis() + "-" + Math.abs(random.nextInt(9999));
    User user =
        User.customer(
            id,
            command.username(),
            command.email(),
            command.phone(),
            passwordEncoder.encode(command.password()),
            isBlank(command.name()) ? command.username() : command.name(),
            isBlank(command.name()) ? command.username() : command.name(),
            command.phone(),
            command.address());
    users.save(user);
    return session(user);
  }

  @Transactional
  public void sendVerificationCode(String phone) {
    validatePhone(phone);
    String code = String.format("%06d", random.nextInt(1000000));
    verificationCodes.save(new VerificationCode(phone, code, LocalDateTime.now().plusMinutes(5), false));
    if (!smsService.sendVerificationCode(phone, code)) {
      throw new BusinessException("短信发送失败，请稍后重试");
    }
  }

  @Transactional
  public AuthSession loginByCode(String phone, String code) {
    VerificationCode verificationCode =
        verificationCodes
            .findValidCode(phone, code, LocalDateTime.now())
            .orElseThrow(() -> new BusinessException(HttpStatus.UNAUTHORIZED, "验证码错误或已过期"));
    verificationCode.setUsed(true);
    User user =
        users.findByPhone(phone)
            .orElseGet(
                () -> {
                  User created =
                      User.customer(
                          "u-code-" + phone,
                          "u_" + phone,
                          null,
                          phone,
                          passwordEncoder.encode(""),
                          phone,
                          phone,
                          phone,
                          "");
                  return users.save(created);
                });
    return session(user);
  }

  @Transactional(readOnly = true)
  public SafeUser safeUser(User user) {
    return toSafeUser(user);
  }

  private AuthSession session(User user) {
    return new AuthSession(
        jwtService.generateToken(user.getId(), user.getPhone(), user.getRole()), toSafeUser(user));
  }

  private SafeUser toSafeUser(User user) {
    Address address =
        new Address(user.getAddressName(), user.getAddressPhone(), user.getAddressDetail());
    return new SafeUser(
        user.getId(),
        user.getUsername(),
        user.getEmail(),
        user.getPhone(),
        user.getRole(),
        user.getName(),
        address,
        null);
  }

  private void validatePhone(String phone) {
    if (phone == null || !phone.matches("^1[3-9]\\d{9}$")) {
      throw new BusinessException("手机号格式不正确");
    }
  }

  private boolean isBlank(String value) {
    return value == null || value.trim().isEmpty();
  }
}
