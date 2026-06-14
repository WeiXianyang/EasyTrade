package com.easytrade.repository;

import com.easytrade.entity.User;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, String> {
  Optional<User> findByUsername(String username);

  Optional<User> findByEmail(String email);

  Optional<User> findByPhone(String phone);

  default Optional<User> findByIdentifier(String identifier) {
    return findByUsername(identifier)
        .or(() -> findByEmail(identifier))
        .or(() -> findByPhone(identifier));
  }

  boolean existsByUsernameOrEmailOrPhone(String username, String email, String phone);
}
