package com.campusconnect.service;

import com.campusconnect.model.Fee;
import com.campusconnect.model.Transaction;
import com.campusconnect.repository.FeeRepository;
import com.campusconnect.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class FeeService {

    @Autowired
    private FeeRepository repo;

    @Autowired
    private TransactionRepository transactionRepo;

    public Fee saveFee(Fee fee) {
        double amountPaidInThisSession = 0;

        if (fee.getId() != null) {
            Optional<Fee> oldFee = repo.findById(fee.getId());
            if (oldFee.isPresent()) {
                amountPaidInThisSession = fee.getPaidFees() - oldFee.get().getPaidFees();
            } else {
                // New assignment with initial payment
                amountPaidInThisSession = fee.getPaidFees();
            }
        } else {
            // New assignment with initial payment
            amountPaidInThisSession = fee.getPaidFees();
        }

        fee.setRemainingFees(fee.getTotalFees() - fee.getPaidFees());

        if (fee.getRemainingFees() <= 0) {
            fee.setStatus("Paid");
        } else {
            fee.setStatus("Pending");
        }

        Fee savedFee = repo.save(fee);

        // Log transaction if money was paid
        if (amountPaidInThisSession > 0) {
            Transaction t = new Transaction(
                amountPaidInThisSession, 
                LocalDateTime.now(), 
                "PAYMENT", 
                savedFee.getUser(),
                fee.getPaymentMethod(),
                fee.getReferenceNumber()
            );
            transactionRepo.save(t);
        } else if (fee.getId() == null) {
            // Log as initial assignment if it's new but maybe 0 paid
             Transaction t = new Transaction(
                0, 
                LocalDateTime.now(), 
                "FEE_ASSIGNED", 
                savedFee.getUser(),
                null,
                null
            );
            transactionRepo.save(t);
        }

        return savedFee;
    }

    public List<Fee> getAllFees() {
        return repo.findAll();
    }

    public List<Fee> getFeesByUser(Long userId) {
        return repo.findByUserId(userId);
    }
}