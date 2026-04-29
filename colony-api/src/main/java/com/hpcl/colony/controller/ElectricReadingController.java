package com.hpcl.colony.controller;

import com.hpcl.colony.dto.ElectricReadingDto;
import com.hpcl.colony.dto.ElectricReadingDto.BillCalculationResult;
import com.hpcl.colony.entity.*;
import com.hpcl.colony.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/v1/electricreadings")
@RequiredArgsConstructor
public class ElectricReadingController {
    private final ElectricReadingService service;

    @GetMapping
    public List<ElectricReading> getAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public ElectricReading getById(@PathVariable Long id) {
        return service.findById(id);
    }

    @GetMapping("/month/{month}")
    public List<ElectricReading> getByMonth(@PathVariable @DateTimeFormat(pattern = "MM-yyyy") LocalDateTime month) {
        return service.findByMonth(month);
    }

    @PostMapping
    public ElectricReading create(@RequestBody ElectricReading reading) {
        return service.save(reading);
    }

    @PostMapping("/calculate")
    public BillCalculationResult calculateBill(
            @RequestParam Double initReading,
            @RequestParam Double finalReading,
            @RequestParam @DateTimeFormat(pattern = "MM-yyyy") LocalDateTime month) {
        return service.calculateBill(initReading, finalReading, month);
    }

    @PostMapping("/calculate-dual")
    public BillCalculationResult calculateBillDual(
            @RequestParam Double initReading,
            @RequestParam Double initReading1,
            @RequestParam Double finalReading,
            @RequestParam Double finalReading1,
            @RequestParam @DateTimeFormat(pattern = "MM-yyyy") LocalDateTime month) {
        return service.calculateBillDual(initReading, initReading1, finalReading, finalReading1, month);
    }

    @PostMapping("/approve")
    public ResponseEntity<String> approveReadings(@RequestBody List<Long> ids, @RequestParam String approvedBy) {
        service.approveReadings(ids, approvedBy);
        return ResponseEntity.ok("Approved Successfully");
    }

    @PutMapping("/{id}")
    public ElectricReading update(@PathVariable Long id, @RequestBody ElectricReading reading) {
        reading.setId(id);
        return service.save(reading);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}