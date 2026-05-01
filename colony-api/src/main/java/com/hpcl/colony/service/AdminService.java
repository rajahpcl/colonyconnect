package com.hpcl.colony.service;

import com.hpcl.colony.entity.*;
import com.hpcl.colony.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {
    private final ComplaintRepository complaintRepository;
    private final VehicleInfoRepository vehicleRepository;
    private final HousingAllotmentRepository housingAllotmentRepository;
    private final HousingMasterRepository housingMasterRepository;
    private final HousingComplexRepository complexRepository;
    private final PoSubmittedRepository poSubmittedRepository;
    private final InventoryMainRepository inventoryRepository;
    private final PoSubmittedRepository purchaseOrderRepository;

    public Map<String, Object> getAdminDashboard() {
        Map<String, Object> dashboard = new HashMap<>();

        // Complaint stats
        List<Complaint> complaints = complaintRepository.findAll();
        dashboard.put("totalComplaints", (long) complaints.size());

        long pendingCount = complaints.stream()
            .filter(c -> c.getStatus() != null && (c.getStatus() == 20L || c.getStatus() == 25L || c.getStatus() == 30L || c.getStatus() == 40L))
            .count();
        dashboard.put("pendingComplaints", pendingCount);

        long resolvedCount = complaints.stream()
            .filter(c -> c.getStatus() != null && (c.getStatus() == 55L || c.getStatus() == 60L))
            .count();
        dashboard.put("resolvedComplaints", resolvedCount);

        // Calculate average resolution time (in days)
        long resolvedWithDates = complaints.stream()
            .filter(c -> c.getStatus() != null && (c.getStatus() == 55L || c.getStatus() == 60L)
                && c.getSubmitDate() != null && c.getUpdateDate() != null)
            .count();

        long totalDays = complaints.stream()
            .filter(c -> c.getStatus() != null && (c.getStatus() == 55L || c.getStatus() == 60L)
                && c.getSubmitDate() != null && c.getUpdateDate() != null)
            .mapToLong(c -> ChronoUnit.DAYS.between(
                c.getSubmitDate().toLocalDate(),
                c.getUpdateDate().toLocalDate()
            ))
            .sum();

        long avgResolutionTime = resolvedWithDates > 0 ? totalDays / resolvedWithDates : 0;
        dashboard.put("averageResolutionTime", avgResolutionTime);

        // Inventory count
        List<InventoryMain> inventoryItems = inventoryRepository.findAll();
        dashboard.put("totalInventory", (long) inventoryItems.size());

        // Vehicle count
        List<VehicleInfo> vehicles = vehicleRepository.findAll().stream()
            .filter(v -> "0".equals(v.getFlag()))
            .collect(Collectors.toList());
        dashboard.put("totalVehicles", (long) vehicles.size());

        // Pending POs
        List<PoSubmitted> pendingPOs = purchaseOrderRepository.findAll().stream()
            .filter(po -> po.getStatus() != null && po.getStatus() > 0)
            .collect(Collectors.toList());
        dashboard.put("pendingPOs", (long) pendingPOs.size());

        return dashboard;
    }

    public List<Map<String, Object>> getComplexList() {
        return complexRepository.findAll().stream()
            .map(c -> {
                Map<String, Object> map = new LinkedHashMap<>();
                map.put("code", c.getComplexCode());
                map.put("name", c.getComplexName());
                return map;
            })
            .collect(Collectors.toList());
    }

    public List<Map<String, Object>> getBuildingsByComplex(String complexCode) {
        return housingMasterRepository.findAll().stream()
            .filter(h -> complexCode.equals(h.getComplexCode()))
            .map(HousingMaster::getBuilding)
            .distinct()
            .sorted()
            .map(b -> {
                Map<String, Object> map = new LinkedHashMap<>();
                map.put("building", b);
                return map;
            })
            .collect(Collectors.toList());
    }

    public List<Map<String, Object>> getFlatsByComplexBuilding(String complexCode, String building) {
        return housingMasterRepository.findAll().stream()
            .filter(h -> complexCode.equals(h.getComplexCode()) && building.equals(h.getBuilding()))
            .map(h -> {
                Map<String, Object> map = new LinkedHashMap<>();
                map.put("flatNo", h.getFlatNo());
                return map;
            })
            .collect(Collectors.toList());
    }

    public Map<String, Object> getEmployeeByFlatComplex(String flatNo, String complexCode) {
        return housingAllotmentRepository.findAll().stream()
            .filter(h -> flatNo.equals(h.getFlatNo()) && complexCode.equals(h.getComplexCode()))
            .findFirst()
            .map(h -> {
                Map<String, Object> map = new LinkedHashMap<>();
                map.put("empNo", h.getEmpNo());
                map.put("empName", getEmpName(h.getEmpNo()));
                return map;
            })
            .orElse(Collections.emptyMap());
    }

    public List<Map<String, Object>> getEmployeeListByComplex(String complexCode) {
        List<String> empNos = housingAllotmentRepository.findAll().stream()
            .filter(h -> complexCode.equals(h.getComplexCode()))
            .map(HousingAllotment::getEmpNo)
            .collect(Collectors.toList());

        return empNos.stream()
            .map(empNo -> {
                Map<String, Object> map = new LinkedHashMap<>();
                map.put("empNo", empNo);
                map.put("empName", getEmpName(empNo));
                return map;
            })
            .collect(Collectors.toList());
    }

    public List<Map<String, Object>> getAvailableFlats(String complexCode) {
        List<String> occupiedFlatNos = housingAllotmentRepository.findAll().stream()
            .filter(h -> complexCode.equals(h.getComplexCode()))
            .map(HousingAllotment::getFlatNo)
            .collect(Collectors.toList());

        return housingMasterRepository.findAll().stream()
            .filter(h -> complexCode.equals(h.getComplexCode()) && !occupiedFlatNos.contains(h.getFlatNo()))
            .map(h -> {
                Map<String, Object> map = new LinkedHashMap<>();
                map.put("flatNo", h.getFlatNo());
                return map;
            })
            .collect(Collectors.toList());
    }

    public List<Map<String, Object>> listFlatAssignments(String complexCode) {
        return housingAllotmentRepository.findAll().stream()
            .filter(h -> complexCode == null || complexCode.equals(h.getComplexCode()))
            .map(h -> {
                Map<String, Object> map = new LinkedHashMap<>();
                map.put("id", h.getComplexCode() + "_" + h.getEmpNo() + "_" + h.getFlatNo());
                map.put("complexCode", h.getComplexCode());
                map.put("empNo", h.getEmpNo());
                map.put("empName", getEmpName(h.getEmpNo()));
                map.put("flatNo", h.getFlatNo());
                return map;
            })
            .collect(Collectors.toList());
    }

    public Map<String, Object> createFlatAssignment(Map<String, Object> assignmentData) {
        HousingAllotment allotment = new HousingAllotment();
        allotment.setComplexCode((String) assignmentData.get("complexCode"));
        allotment.setEmpNo((String) assignmentData.get("empNo"));
        allotment.setFlatNo((String) assignmentData.get("flatNo"));
        HousingAllotment saved = housingAllotmentRepository.save(allotment);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("id", saved.getComplexCode() + "_" + saved.getEmpNo() + "_" + saved.getFlatNo());
        result.put("complexCode", saved.getComplexCode());
        result.put("empNo", saved.getEmpNo());
        result.put("empName", getEmpName(saved.getEmpNo()));
        result.put("flatNo", saved.getFlatNo());
        return result;
    }

    public Map<String, Object> updateFlatAssignment(String id, Map<String, Object> assignmentData) {
        String[] parts = id.split("_");
        if (parts.length != 3) {
            throw new RuntimeException("Invalid ID format");
        }
        HousingAllotmentId existingId = new HousingAllotmentId(parts[0], parts[1], parts[2]);

        return housingAllotmentRepository.findById(existingId)
            .map(existing -> {
                HousingAllotment current = existing;
                if (assignmentData.containsKey("flatNo")) {
                    String newFlatNo = (String) assignmentData.get("flatNo");
                    if (!current.getFlatNo().equals(newFlatNo)) {
                        HousingAllotment newAllotment = new HousingAllotment();
                        newAllotment.setComplexCode(current.getComplexCode());
                        newAllotment.setEmpNo(current.getEmpNo());
                        newAllotment.setFlatNo(newFlatNo);
                        housingAllotmentRepository.delete(current);
                        current = housingAllotmentRepository.save(newAllotment);
                    }
                }

                Map<String, Object> result = new LinkedHashMap<>();
                result.put("id", current.getComplexCode() + "_" + current.getEmpNo() + "_" + current.getFlatNo());
                result.put("complexCode", current.getComplexCode());
                result.put("empNo", current.getEmpNo());
                result.put("empName", getEmpName(current.getEmpNo()));
                result.put("flatNo", current.getFlatNo());
                return result;
            })
            .orElseThrow(() -> new RuntimeException("Assignment not found"));
    }

    // Helper methods
    private String getEmpName(String empNo) {
        // In a real implementation, this would fetch from employee master
        // For now, return a placeholder
        return "Employee " + empNo;
    }
}
