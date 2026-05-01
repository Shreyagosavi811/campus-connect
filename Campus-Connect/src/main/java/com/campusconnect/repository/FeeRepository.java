package com.campusconnect.repository;

import com.campusconnect.model.Fee;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FeeRepository extends JpaRepository<Fee, Long> {
    List<Fee> findByUserId(Long userId);
}