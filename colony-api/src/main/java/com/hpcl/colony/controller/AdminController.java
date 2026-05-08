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
    private final HousingComplexRepository complexRepository;
    private final HousingAllotmentRepository allotmentRepository;

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

    /**
     * Create flat assignment — mirrors colonyassign.jsp Submit1 action.
     * INSERT INTO housing_alloted (COMPLEX_CODE, EMP_NO, FLAT_NO)
     */
    @PostMapping("/flat-assignments")
    public ResponseEntity<Map<String, Object>> createFlatAssignment(@RequestBody Map<String, Object> assignmentData) {
        HousingAllotment allotment = new HousingAllotment();
        allotment.setComplexCode((String) assignmentData.get("complexCode"));
        allotment.setEmpNo((String) assignmentData.get("empNo"));
        allotment.setFlatNo((String) assignmentData.get("flatNo"));
        HousingAllotment saved = allotmentRepository.save(allotment);
        return ResponseEntity.ok(Map.of(
            "complexCode", saved.getComplexCode(),
            "empNo", saved.getEmpNo(),
            "flatNo", saved.getFlatNo()
        ));
    }

    /**
     * Update flat assignment — mirrors colonyassign.jsp Update action.
     * Deletes old record and inserts updated one (composite PK table).
     */
    @PostMapping("/flat-assignments/update")
    public ResponseEntity<Map<String, Object>> updateFlatAssignmentByKey(@RequestBody Map<String, Object> body) {
        String oldComplexCode = (String) body.get("oldComplexCode");
        String oldEmpNo = (String) body.get("oldEmpNo");
        String oldFlatNo = (String) body.get("oldFlatNo");
        String newComplexCode = (String) body.get("complexCode");
        String newEmpNo = (String) body.get("empNo");
        String newFlatNo = (String) body.get("flatNo");

        HousingAllotmentId oldId = new HousingAllotmentId(oldComplexCode, oldEmpNo, oldFlatNo);
        allotmentRepository.findById(oldId).ifPresent(old -> {
            allotmentRepository.delete(old);
            HousingAllotment updated = new HousingAllotment();
            updated.setComplexCode(newComplexCode);
            updated.setEmpNo(newEmpNo);
            updated.setFlatNo(newFlatNo);
            allotmentRepository.save(updated);
        });

        return ResponseEntity.ok(Map.of(
            "complexCode", newComplexCode,
            "empNo", newEmpNo,
            "flatNo", newFlatNo
        ));
    }

    @PatchMapping("/flat-assignments/{id}")
    public Map<String, Object> updateFlatAssignmentLegacyId(
            @PathVariable String id,
            @RequestBody Map<String, Object> assignmentData) {
        return adminService.updateFlatAssignment(id, assignmentData);
    }

    /**
     * List admin roles — returns all complexes with their complex_admin field.
     * Called by AdminRolesPage to render the table.
     */
    @GetMapping("/roles")
    public List<Map<String, Object>> listAdminRoles() {
        return complexRepository.findAll().stream()
            .map(c -> {
                java.util.Map<String, Object> m = new java.util.LinkedHashMap<>();
                m.put("complexCode", c.getComplexCode());
                m.put("complexName", c.getComplexName());
                m.put("complexAdmin", c.getComplexAdmin());
                return m;
            })
            .collect(java.util.stream.Collectors.toList());
    }

    /**
     * Add admin role — mirrors admin_role.jsp ?action=add.
     * Appends empNo to the COMPLEX_ADMIN comma-separated field in housing_complex_list.
     */
    @PostMapping("/roles/add")
    public ResponseEntity<Map<String, Object>> addAdminRole(@RequestBody Map<String, String> body) {
        String complexCode = body.get("complexCode");
        String empNo = body.get("empNo");

        if (complexCode == null || complexCode.isBlank() || empNo == null || empNo.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "complexCode and empNo are required"));
        }

        HousingComplex complex = complexRepository.findById(complexCode)
            .orElseThrow(() -> new RuntimeException("Complex not found: " + complexCode));

        String current = complex.getComplexAdmin();
        String updated;
        if (current == null || current.isBlank()) {
            updated = empNo + ",";
        } else {
            String trimmed = current.trim();
            updated = trimmed.endsWith(",") ? trimmed + empNo : trimmed + "," + empNo;
        }

        complex.setComplexAdmin(updated);
        complexRepository.save(complex);

        return ResponseEntity.ok(Map.of(
            "message", "Admin Role Added Successfully",
            "complexAdmin", updated
        ));
    }
}
