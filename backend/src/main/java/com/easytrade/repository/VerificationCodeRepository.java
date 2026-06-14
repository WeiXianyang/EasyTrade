package com.easytrade.repository;

import com.easytrade.entity.VerificationCode;
import java.time.LocalDateTime;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface VerificationCodeRepository extends JpaRepository<VerificationCode, Long> {
  @Query(
      """
      select code from VerificationCode code
      where code.phone = :phone
        and code.code = :code
        and code.used = false
        and code.expiresAt > :now
      order by code.expiresAt desc
      limit 1
      """)
  Optional<VerificationCode> findValidCode(
      @Param("phone") String phone, @Param("code") String code, @Param("now") LocalDateTime now);
}
