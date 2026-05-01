package com.campusconnect.model;

import jakarta.persistence.*;

@Entity
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String rollNo;
    private String department;
    private String year;
    private String email;
    private String phone;
    private String address;

    public Student() {}

    public Student(Long id, String name, String rollNo, String department, String year,
                   String email, String phone, String address) {
        this.id = id;
        this.name = name;
        this.rollNo = rollNo;
        this.department = department;
        this.year = year;
        this.email = email;
        this.phone = phone;
        this.address = address;
    }

    // GETTERS & SETTERS
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getRollNo() { return rollNo; }
    public void setRollNo(String rollNo) { this.rollNo = rollNo; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getYear() { return year; }
    public void setYear(String year) { this.year = year; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
}