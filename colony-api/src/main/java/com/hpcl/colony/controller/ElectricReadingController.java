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
    public List<ElectricReading> getAll(@RequestParam(required = false) String enteredDate) {
        if (enteredDate == null || enteredDate.isBlank()) {
            return service.findAll();
        }
        // enteredDate format: "YYYY-MM-01T00:00:00"
        // Filter by year + month only
        try {
            java.time.LocalDateTime dt = java.time.LocalDateTime.parse(enteredDate);
            return service.findAll().stream()
                .filter(r -> r.getEnteredDate() != null
                    && r.getEnteredDate().getYear() == dt.getYear()
                    && r.getEnteredDate().getMonth() == dt.getMonth())
                .collect(java.util.stream.Collectors.toList());
        } catch (Exception e) {
            return service.findAll();
        }
    }

    @GetMapping("/{id}")
    public ElectricReading getById(@PathVariable Long id) {
        return service.findById(id);
    }

    /**
     * Get the last reading for a given flat (to auto-fill initial reading).
     * Mirrors GetLastReading.jsp — returns finalReading of the most recent record before the given month.
     */
    @GetMapping("/last")
    public org.springframework.http.ResponseEntity<java.util.Map<String, Object>> getLastReading(
            @RequestParam String flatNo,
            @RequestParam(required = false) String month) {
        java.util.Optional<ElectricReading> last = service.findAll().stream()
            .filter(r -> flatNo.equals(r.getFlatNo()) && r.getFinalReading() != null)
            .max(java.util.Comparator.comparing(r -> r.getEnteredDate() != null ? r.getEnteredDate() : java.time.LocalDateTime.MIN));
        return last.map(r -> org.springframework.http.ResponseEntity.ok(
            java.util.Map.<String, Object>of("finalReading", r.getFinalReading(), "finalReading1", r.getFinalReading())))
            .orElse(org.springframework.http.ResponseEntity.ok(java.util.Map.of("finalReading", 0, "finalReading1", 0)));
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