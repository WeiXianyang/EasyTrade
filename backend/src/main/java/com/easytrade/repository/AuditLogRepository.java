package com.easytrade.repository;

import com.easytrade.entity.AuditLog;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AuditLogRepository extends JpaRepository<AuditLog, String> {
  List<AuditLog> findAllByOrderByCreatedAtDesc();
}
