package com.easytrade.repository;

import com.easytrade.entity.RequestLog;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RequestLogRepository extends JpaRepository<RequestLog, String> {
  List<RequestLog> findAllByOrderByCreatedAtDesc();
}
