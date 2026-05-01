package com.campusconnect.controller;

import com.campusconnect.model.Fee;
import com.campusconnect.service.FeeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/fees")
@CrossOrigin(origins = "*")
public class FeeController {

    @Autowired
    private FeeService service;

    @PostMapping
    public Fee addFee(@RequestBody Fee fee) {
        return service.saveFee(fee);
    }

    @GetMapping
    public List<Fee> getFees() {
        return service.getAllFees();
    }

    @GetMapping("/user/{id}")
    public List<Fee> getFeesByUser(@PathVariable Long id) {
        return service.getFeesByUser(id);
    }

    @PutMapping("/{id}")
    public Fee updateFee(@PathVariable Long id, @RequestBody Fee updatedFee) {
        updatedFee.setId(id);
        return service.saveFee(updatedFee);
    }
}