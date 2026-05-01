package com.campusconnect.controller;

import com.campusconnect.model.User;
import com.campusconnect.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    // GET ALL USERS
    @GetMapping
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // GET BY ID
    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        Optional<User> user = userRepository.findById(id);
        return user.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // CREATE USER
    @PostMapping
    public User createUser(@RequestBody User user) {
        return userRepository.save(user);
    }

    // UPDATE USER
    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User updatedUser) {
        return userRepository.findById(id).map(user -> {
            user.setName(updatedUser.getName());
            user.setEmail(updatedUser.getEmail());
            user.setRole(updatedUser.getRole());
            user.setDepartment(updatedUser.getDepartment());
            user.setYear(updatedUser.getYear());
            user.setApproved(updatedUser.isApproved());
            user.setFinanceAccess(updatedUser.isFinanceAccess());
            userRepository.save(user);
            return ResponseEntity.ok(user);
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // APPROVE USER
    @PutMapping("/{id}/approve")
    public ResponseEntity<User> approveUser(@PathVariable Long id) {
        return userRepository.findById(id).map(user -> {
            user.setApproved(true);
            userRepository.save(user);
            return ResponseEntity.ok(user);
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // DELETE USER
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        userRepository.deleteById(id);
        return ResponseEntity.ok("User deleted");
    }
}