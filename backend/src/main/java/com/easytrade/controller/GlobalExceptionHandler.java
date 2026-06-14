package com.easytrade.controller;

import com.easytrade.common.ApiResponse;
import com.easytrade.common.BusinessException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {
  @ExceptionHandler(BusinessException.class)
  ResponseEntity<ApiResponse<Void>> handleBusiness(BusinessException error) {
    return ResponseEntity.status(error.getStatus())
        .body(ApiResponse.error(error.getStatus().value(), error.getMessage()));
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  ResponseEntity<ApiResponse<Void>> handleValidation(MethodArgumentNotValidException error) {
    String message =
        error.getBindingResult().getFieldErrors().stream()
            .findFirst()
            .map(fieldError -> fieldError.getDefaultMessage())
            .orElse("请求参数不正确");
    return ResponseEntity.badRequest().body(ApiResponse.error(400, message));
  }
}
