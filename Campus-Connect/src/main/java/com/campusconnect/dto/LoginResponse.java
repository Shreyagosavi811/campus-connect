package com.campusconnect.dto;

public class LoginResponse {

    private Long id;
    private String token;
    private String email;
    private String role;
    private String name;
    private String department;
    private String year;
    private boolean financeAccess;

    public LoginResponse(Long id, String token, String email, String role,
                         String name, String department, String year, boolean financeAccess) {
        this.id = id;
        this.token = token;
        this.email = email;
        this.role = role;
        this.name = name;
        this.department = department;
        this.year = year;
        this.financeAccess = financeAccess;
    }

    public Long getId() { return id; }
    public String getToken() { return token; }
    public String getEmail() { return email; }
    public String getRole() { return role; }
    public String getName() { return name; }
    public String getDepartment() { return department; }
    public String getYear() { return year; }
    public boolean isFinanceAccess() { return financeAccess; }
}