package com.campusconnect.model;

import jakarta.persistence.*;

@Entity
public class Fee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private double totalFees;
    private double paidFees;
    private double remainingFees;
    private String status;
    
    @Transient
    private String paymentMethod;
    
    @Transient
    private String referenceNumber;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    public Fee() {}

    // GETTERS & SETTERS
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public double getTotalFees() { return totalFees; }
    public void setTotalFees(double totalFees) { this.totalFees = totalFees; }

    public double getPaidFees() { return paidFees; }
    public void setPaidFees(double paidFees) { this.paidFees = paidFees; }

    public double getRemainingFees() { return remainingFees; }
    public void setRemainingFees(double remainingFees) { this.remainingFees = remainingFees; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public String getReferenceNumber() { return referenceNumber; }
    public void setReferenceNumber(String referenceNumber) { this.referenceNumber = referenceNumber; }
}