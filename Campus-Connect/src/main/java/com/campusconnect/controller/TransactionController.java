package com.campusconnect.controller;

import com.campusconnect.model.Transaction;
import com.campusconnect.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    @Autowired
    private TransactionRepository repository;

    @GetMapping("/user/{id}")
    public List<Transaction> getTransactionsByUser(@PathVariable Long id) {
        return repository.findByUserIdOrderByDateDesc(id);
    }

    @PostMapping
    public Transaction createTransaction(@RequestBody Transaction transaction) {
        if (transaction.getDate() == null) {
            transaction.setDate(java.time.LocalDateTime.now());
        }
        return repository.save(transaction);
    }
}
