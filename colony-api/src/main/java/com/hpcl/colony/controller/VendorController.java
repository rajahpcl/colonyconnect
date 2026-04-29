package com.hpcl.colony.controller;

import com.hpcl.colony.entity.Vendor;
import com.hpcl.colony.service.VendorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/vendors")
@RequiredArgsConstructor
public class VendorController {
    private final VendorService service;

    @GetMapping
    public List<Vendor> getAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public Vendor getById(@PathVariable Long id) {
        return service.findById(id);
    }

    @GetMapping("/code/{code}")
    public List<Vendor> getByCode(@PathVariable String code) {
        return service.findByCodeAll(code);
    }

    @PostMapping
    public ResponseEntity<Vendor> create(@RequestBody Vendor vendor) {
        return ResponseEntity.ok(service.save(vendor));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Vendor> update(@PathVariable Long id, @RequestBody Vendor vendor) {
        vendor.setId(id);
        return ResponseEntity.ok(service.save(vendor));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}