package com.hpcl.colony.controller;

import com.hpcl.colony.dto.ElectricRateDto;
import com.hpcl.colony.entity.*;
import com.hpcl.colony.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/electricrates")
@RequiredArgsConstructor
public class ElectricRateController {
    private final ElectricRateService service;

    @GetMapping
    public List<ElectricRate> getAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public ElectricRate getById(@PathVariable Long id) {
        return service.findById(id);
    }

    @PostMapping
    public ElectricRate create(@RequestBody ElectricRate rate) {
        return service.save(rate);
    }

    @PostMapping("/slabs")
    public ResponseEntity<String> saveSlabRates(@RequestBody ElectricRateDto.SlabRateDto[] slabs,
                                                 @RequestParam String updateBy) {
        if (service.existsRatesForMonth(java.time.LocalDateTime.now())) {
            return ResponseEntity.badRequest().body("Rate already saved for this month");
        }
        service.saveSlabRates(slabs, updateBy);
        return ResponseEntity.ok("Saved Successfully");
    }

    @PutMapping("/{id}")
    public ElectricRate update(@PathVariable Long id, @RequestBody ElectricRate rate) {
        rate.setId(id);
        return service.save(rate);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
