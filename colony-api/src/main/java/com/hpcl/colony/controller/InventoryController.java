package com.hpcl.colony.controller;

import com.hpcl.colony.entity.*;
import com.hpcl.colony.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/inventories")
@RequiredArgsConstructor
public class InventoryController {
    private final InventoryService service;

    @GetMapping
    public List<InventoryMain> getAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public InventoryMain getById(@PathVariable Long id) {
        return service.findById(id);
    }

    @GetMapping("/emp/{empNo}")
    public List<InventoryMain> getByEmpNo(@PathVariable String empNo) {
        return service.findByEmpNo(empNo);
    }

    @PostMapping
    public InventoryMain create(@RequestBody InventoryMain inventory) {
        return service.save(inventory);
    }

    @PostMapping("/save-with-entries")
    public InventoryMain saveWithEntries(@RequestBody SaveInventoryRequest request) {
        return service.createOrUpdateWithEntries(
            request.getInventory(),
            request.getEntries(),
            request.getStatus(),
            request.getUpdateBy()
        );
    }

    @PostMapping("/{id}/submit")
    public ResponseEntity<String> submit(@PathVariable Long id, @RequestParam String updateBy) {
        service.submitForApproval(id, updateBy);
        return ResponseEntity.ok("Submitted Successfully");
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<String> approve(@PathVariable Long id, @RequestParam String approvedBy) {
        service.approve(id, approvedBy);
        return ResponseEntity.ok("Approved Successfully");
    }

    @PostMapping("/{id}/sendback")
    public ResponseEntity<String> sendBack(@PathVariable Long id, @RequestParam String updateBy) {
        service.sendBack(id, updateBy);
        return ResponseEntity.ok("Sent Back Successfully");
    }

    @PutMapping("/{id}")
    public InventoryMain update(@PathVariable Long id, @RequestBody InventoryMain inventory) {
        inventory.setId(id);
        return service.save(inventory);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/master")
    public List<InventoryMaster> getMaster() {
        return service.getInventoryMaster();
    }

    @GetMapping("/master/{category}")
    public List<InventoryMaster> getMasterByCategory(@PathVariable String category) {
        return service.getMasterByCategory(category);
    }

    @GetMapping("/{id}/history")
    public List<InventoryHistory> getHistory(@PathVariable Long id) {
        return service.getHistory(id);
    }

    // Request DTO for save-with-entries
    @lombok.Data
    public static class SaveInventoryRequest {
        private InventoryMain inventory;
        private List<InventoryEntry> entries;
        private String status; // null/10=Draft, 20=Submitted
        private String updateBy;
    }
}