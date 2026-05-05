package com.campusconnect;

import com.campusconnect.model.User;
import com.campusconnect.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class CampusConnectApplication {

    public static void main(String[] args) {
        SpringApplication.run(CampusConnectApplication.class, args);
    }

    @Bean
    CommandLineRunner init(UserRepository repo) {
        return args -> {
            if (repo.count() == 0) {
                User admin = new User();
                admin.setName("System Admin");
                admin.setEmail("admin@campus.com");
                admin.setPassword("admin123");
                admin.setRole("ADMIN");
                admin.setApproved(true);
                admin.setDepartment("ADMINISTRATION");
                repo.save(admin);
                System.out.println(">>> Default Admin created: admin@campus.com / admin123");
            }
        };
    }
}