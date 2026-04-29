package com.hpcl.colony.controller;

import com.hpcl.colony.entity.*;
import com.hpcl.colony.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/po")
@RequiredArgsConstructor
public class PoSubmittedController {
    private final PoSubmittedService service;

    // PO Submitted (items linked to complaints)
    @GetMapping("/submitted")
    public List<PoSubmitted> getAllSubmitted() {
        return service.findAll();
    }

    @GetMapping("/submitted/{id}")
    public PoSubmitted getSubmittedById(@PathVariable Long id) {
        return service.findById(id);
    }

    @GetMapping("/submitted/req/{reqId}")
    public List<PoSubmitted> getSubmittedByReqId(@PathVariable String reqId) {
        return service.findByReqId(reqId);
    }

    @PostMapping("/submitted")
    public ResponseEntity<PoSubmitted> addPoItem(@RequestBody PoSubmitted po,
                                                  @RequestParam String insertedBy) {
        service.addPoItem(po, insertedBy);
        return ResponseEntity.ok(po);
    }

    @PostMapping("/submitted/delete/{id}")
    public ResponseEntity<String> deleteSubmitted(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.ok("Deleted Successfully");
    }

    // PO Master (rate items)
    @GetMapping("/master")
    public List<PoItem> getAllPoItems() {
        return service.findAllPoItems();
    }

    @GetMapping("/master/{id}")
    public PoItem getPoItemById(@PathVariable Long id) {
        return service.findPoItemById(id);
    }

    @GetMapping("/master/category/{category}")
    public List<PoItem> getPoItemsByCategory(@PathVariable String category) {
        return service.findPoItemsByCategory(category);
    }

    @GetMapping("/master/next-item/{category}")
    public String getNextAgtmItem(@PathVariable String category) {
        return service.getNextAgtmItem(category);
    }

    @GetMapping("/master/categories")
    public List<String> getPoCategories() {
        return service.getPoCategories();
    }

    @PostMapping("/master")
    public ResponseEntity<PoItem> addPoItemMaster(@RequestBody PoItem item,
                                                   @RequestParam String insertedBy) {
        return ResponseEntity.ok(service.savePoItem(item, insertedBy));
    }

    @PostMapping("/master/delete/{id}")
    public ResponseEntity<String> deletePoItemMaster(@PathVariable Long id) {
        service.softDeletePoItem(id);
        return ResponseEntity.ok("Deleted Successfully");
    }
}