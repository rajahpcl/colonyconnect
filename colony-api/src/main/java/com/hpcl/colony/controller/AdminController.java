package com.hpcl.colony.controller;

import com.hpcl.colony.entity.*;
import com.hpcl.colony.repository.*;
import com.hpcl.colony.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminController {
    private final AdminService adminService;

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getAdminDashboard() {
        return ResponseEntity.ok(adminService.getAdminDashboard());
    }

    @GetMapping("/complex-list")
    public List<Map<String, Object>> getComplexList() {
        return adminService.getComplexList();
    }

    @GetMapping("/buildings")
    public List<Map<String, Object>> getBuildingsByComplex(@RequestParam String complexCode) {
        return adminService.getBuildingsByComplex(complexCode);
    }

    @GetMapping("/flats")
    public List<Map<String, Object>> getFlatsByComplexBuilding(
            @RequestParam String complexCode,
            @RequestParam String building) {
        return adminService.getFlatsByComplexBuilding(complexCode, building);
    }

    @GetMapping("/employee")
    public Map<String, Object> getEmployeeByFlatComplex(
            @RequestParam String flatNo,
            @RequestParam String complexCode) {
        return adminService.getEmployeeByFlatComplex(flatNo, complexCode);
    }

    @GetMapping("/employees")
    public List<Map<String, Object>> getEmployeeListByComplex(@RequestParam String complexCode) {
        return adminService.getEmployeeListByComplex(complexCode);
    }

    @GetMapping("/available-flats")
    public List<Map<String, Object>> getAvailableFlats(@RequestParam String complexCode) {
        return adminService.getAvailableFlats(complexCode);
    }

    @GetMapping("/flat-assignments")
    public List<Map<String, Object>> listFlatAssignments(@RequestParam(required = false) String complexCode) {
        return adminService.listFlatAssignments(complexCode);
    }

    @PostMapping("/flat-assignments")
    public Map<String, Object> createFlatAssignment(@RequestBody Map<String, Object> assignmentData) {
        return adminService.createFlatAssignment(assignmentData);
    }

    @PatchMapping("/flat-assignments/{id}")
    public Map<String, Object> updateFlatAssignment(
            @PathVariable String id,
            @RequestBody Map<String, Object> assignmentData) {
        return adminService.updateFlatAssignment(id, assignmentData);
    }
}
