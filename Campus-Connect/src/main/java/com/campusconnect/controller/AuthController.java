package com.campusconnect.controller;

import com.campusconnect.dto.LoginRequest;
import com.campusconnect.dto.LoginResponse;
import com.campusconnect.model.User;
import com.campusconnect.repository.UserRepository;
import com.campusconnect.security.JwtUtil;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository repo;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            System.out.println(">>> Login attempt for: " + request.getEmail());
            Optional<User> userOpt = repo.findByEmail(request.getEmail());

            if (userOpt.isEmpty()) {
                System.out.println(">>> User not found: " + request.getEmail());
                return ResponseEntity.status(401).body("User not found");
            }

            User user = userOpt.get();

            if (!user.getPassword().equals(request.getPassword())) {
                System.out.println(">>> Invalid password for: " + request.getEmail());
                return ResponseEntity.status(401).body("Invalid credentials");
            }

            if (!user.isApproved()) {
                System.out.println(">>> User not approved: " + request.getEmail());
                return ResponseEntity.status(403).body("Account not approved");
            }

            String token = jwtUtil.generateToken(user.getEmail(), user.getRole());
            System.out.println(">>> Login successful: " + user.getEmail());

            return ResponseEntity.ok(
                    new LoginResponse(
                            user.getId(),
                            token,
                            user.getEmail(),
                            user.getRole(),
                            user.getName(),
                            user.getDepartment(),
                            user.getYear(),
                            user.isFinanceAccess()
                    )
            );
        } catch (Exception e) {
            System.err.println("!!! CRITICAL LOGIN ERROR: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Internal Server Error: " + e.getMessage());
        }
    }
}