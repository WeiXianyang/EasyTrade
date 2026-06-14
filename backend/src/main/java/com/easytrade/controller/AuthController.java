package com.easytrade.controller;

import com.easytrade.common.ApiResponse;
import com.easytrade.entity.User;
import com.easytrade.service.AuthService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
  private final AuthService authService;

  public AuthController(AuthService authService) {
    this.authService = authService;
  }

  public record LoginRequest(@NotBlank String identifier, @NotBlank String password) {}

  public record SendCodeRequest(@NotBlank String phone) {}

  public record CodeLoginRequest(@NotBlank String phone, @NotBlank String code) {}

  public record RegisterRequest(
      @NotBlank String username,
      String email,
      @NotBlank String phone,
      @NotBlank String password,
      String name,
      String address) {}

  @PostMapping("/send-code")
  public ApiResponse<String> sendCode(@Valid @RequestBody SendCodeRequest request) {
    authService.sendVerificationCode(request.phone());
    return ApiResponse.success("验证码已发送");
  }

  @PostMapping("/register")
  public ApiResponse<AuthService.AuthSession> register(@Valid @RequestBody RegisterRequest request) {
    return ApiResponse.success(
        authService.register(
            new AuthService.RegisterCommand(
                request.username(),
                request.email(),
                request.phone(),
                request.password(),
                request.name(),
                request.address())));
  }

  @PostMapping("/login")
  public ApiResponse<AuthService.AuthSession> login(@Valid @RequestBody LoginRequest request) {
    return ApiResponse.success(authService.login(request.identifier(), request.password()));
  }

  @PostMapping("/code-login")
  public ApiResponse<AuthService.AuthSession> codeLogin(
      @Valid @RequestBody CodeLoginRequest request) {
    return ApiResponse.success(authService.loginByCode(request.phone(), request.code()));
  }

  @PostMapping("/admin/login")
  public ApiResponse<AuthService.AuthSession> adminLogin(@Valid @RequestBody LoginRequest request) {
    return ApiResponse.success(authService.adminLogin(request.identifier(), request.password()));
  }

  @GetMapping("/me")
  public ApiResponse<AuthService.SafeUser> me(@AuthenticationPrincipal User user) {
    return ApiResponse.success(authService.safeUser(user));
  }
}
