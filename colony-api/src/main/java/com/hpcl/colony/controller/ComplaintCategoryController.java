package com.hpcl.colony.controller;

import com.hpcl.colony.entity.ComplaintCategory;
import com.hpcl.colony.service.ComplaintCategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/complaint-categories")
@RequiredArgsConstructor
public class ComplaintCategoryController {
    private final ComplaintCategoryService service;

    @GetMapping
    public List<ComplaintCategory> getAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public ComplaintCategory getById(@PathVariable Long id) {
        return service.findById(id);
    }

    @PostMapping
    public ResponseEntity<ComplaintCategory> create(@RequestBody ComplaintCategory category) {
        return ResponseEntity.ok(service.save(category));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ComplaintCategory> update(@PathVariable Long id,
                                                     @RequestBody ComplaintCategory category) {
        category.setId(id);
        return ResponseEntity.ok(service.save(category));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}