package com.campusconnect.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private double amount;
    private LocalDateTime date;
    private String type; // "PAYMENT" or "ASSIGNMENT"
    
    private String paymentMethod;
    private String referenceNumber;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    public Transaction() {}

    public Transaction(double amount, LocalDateTime date, String type, User user) {
        this.amount = amount;
        this.date = date;
        this.type = type;
        this.user = user;
    }

    public Transaction(double amount, LocalDateTime date, String type, User user, String paymentMethod, String referenceNumber) {
        this.amount = amount;
        this.date = date;
        this.type = type;
        this.user = user;
        this.paymentMethod = paymentMethod;
        this.referenceNumber = referenceNumber;
    }

    // GETTERS & SETTERS
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public double getAmount() { return amount; }
    public void setAmount(double amount) { this.amount = amount; }

    public LocalDateTime getDate() { return date; }
    public void setDate(LocalDateTime date) { this.date = date; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public String getReferenceNumber() { return referenceNumber; }
    public void setReferenceNumber(String referenceNumber) { this.referenceNumber = referenceNumber; }
}
