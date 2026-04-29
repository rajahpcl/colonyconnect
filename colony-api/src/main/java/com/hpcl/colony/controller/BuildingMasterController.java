package com.hpcl.colony.controller;

import com.hpcl.colony.entity.*;
import com.hpcl.colony.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/buildingmasters")
@RequiredArgsConstructor
public class BuildingMasterController {
    private final BuildingMasterService service;

    @GetMapping
    public List<BuildingMaster> getAll() {
        return service.findAll();
    }

    @GetMapping("/{colonyCode}/{building}")
    public BuildingMaster getById(@PathVariable String colonyCode, @PathVariable String building) {
        return service.findById(colonyCode, building);
    }

    @GetMapping("/colony/{colonyCode}")
    public List<BuildingMaster> getByColonyCode(@PathVariable String colonyCode) {
        return service.findByColonyCode(colonyCode);
    }

    @PostMapping
    public ResponseEntity<BuildingMaster> create(@RequestBody BuildingMaster building) {
        return ResponseEntity.ok(service.save(building));
    }

    @PutMapping
    public ResponseEntity<BuildingMaster> update(@RequestBody BuildingMaster building) {
        return ResponseEntity.ok(service.save(building));
    }

    @DeleteMapping("/{colonyCode}/{building}")
    public ResponseEntity<Void> delete(@PathVariable String colonyCode, @PathVariable String building) {
        service.delete(colonyCode, building);
        return ResponseEntity.noContent().build();
    }
}