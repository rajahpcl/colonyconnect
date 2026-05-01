package com.hpcl.colony.service;

import com.hpcl.colony.entity.*;
import com.hpcl.colony.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportService {
    private final ComplaintRepository complaintRepository;
    private final VehicleInfoRepository vehicleRepository;
    private final HousingAllotmentRepository housingAllotmentRepository;
    private final HousingMasterRepository housingMasterRepository;
    private final HousingComplexRepository complexRepository;
    private final PoSubmittedRepository poSubmittedRepository;

    // ========== COMPLAINT REPORT ==========
    public List<Map<String, Object>> getComplaintReport(String fromDate, String toDate,
                                                         List<String> complexCodes,
                                                         List<Long> statuses,
                                                         List<String> vendors,
                                                         List<Long> complaintTypes,
                                                         List<String> flatNos,
                                                         String empNo) {

        List<Complaint> complaints = complaintRepository.findAll();

        // Apply filters
        if (fromDate != null && !fromDate.isEmpty() && toDate != null && !toDate.isEmpty()) {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd-MMM-yyyy");
            LocalDateTime from = LocalDate.parse(fromDate, formatter).atStartOfDay();
            LocalDateTime to = LocalDate.parse(toDate, formatter).atTime(23, 59, 59);
            complaints = complaints.stream()
                .filter(c -> c.getSubmitDate() != null &&
                    !c.getSubmitDate().isBefore(from) && !c.getSubmitDate().isAfter(to))
                .collect(Collectors.toList());
        }

        if (complexCodes != null && !complexCodes.isEmpty()) {
            complaints = complaints.stream()
                .filter(c -> complexCodes.contains(c.getComplexCode()))
                .collect(Collectors.toList());
        }

        if (statuses != null && !statuses.isEmpty()) {
            complaints = complaints.stream()
                .filter(c -> c.getStatus() != null && statuses.contains(c.getStatus()))
                .collect(Collectors.toList());
        }

        if (vendors != null && !vendors.isEmpty()) {
            complaints = complaints.stream()
                .filter(c -> vendors.contains(c.getVendor()))
                .collect(Collectors.toList());
        }

        if (empNo != null && !empNo.isEmpty()) {
            complaints = complaints.stream()
                .filter(c -> empNo.equals(c.getEmpNo()))
                .collect(Collectors.toList());
        }

        return complaints.stream().map(c -> {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("id", c.getId());
            row.put("flatNo", c.getFlatNo());
            row.put("complaintType", getCategoryName(c.getSubcategoryId()));
            row.put("subCategory", getSubcategoryName(c.getSubcategoryId()));
            row.put("compDetails", c.getCompDetails());
            row.put("vendorName", getVendorName(c.getVendor()));
            row.put("status", getStatusName(c.getStatus()));
            row.put("submitDate", c.getSubmitDate());
            return row;
        }).collect(Collectors.toList());
    }

    // ========== VEHICLE REPORT ==========
    public List<Map<String, Object>> getVehicleReport(String complexCode) {
        List<VehicleInfo> vehicles = vehicleRepository.findAll().stream()
            .filter(v -> "0".equals(v.getFlag())) // Active vehicles
            .collect(Collectors.toList());

        if (complexCode != null && !complexCode.isEmpty()) {
            // Filter by complex through housing_allotment
            List<String> empNosInComplex = housingAllotmentRepository.findAll().stream()
                .filter(h -> complexCode.equals(h.getComplexCode()))
                .map(HousingAllotment::getEmpNo)
                .collect(Collectors.toList());
            vehicles = vehicles.stream()
                .filter(v -> empNosInComplex.contains(v.getEmpNo()))
                .collect(Collectors.toList());
        }

        return vehicles.stream().map(v -> {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("empNo", v.getEmpNo());
            row.put("empName", getEmpName(v.getEmpNo()));
            row.put("building", getBuilding(v.getEmpNo()));
            row.put("flatNo", getFlatNo(v.getEmpNo()));
            row.put("make", v.getMake());
            row.put("model", v.getModel());
            row.put("registrationNo", v.getRegistrationNo());
            row.put("color", v.getColor());
            row.put("vehicleType", v.getVehicleType());
            return row;
        }).collect(Collectors.toList());
    }

    // ========== OCCUPANCY REPORT ==========
    public OccupancyReportResult getOccupancyReport(String complexCode, String empNo) {
        List<Map<String, Object>> occupiedFlats = new ArrayList<>();
        List<Map<String, Object>> vacantFlats = new ArrayList<>();

        // Get occupied flats
        List<HousingAllotment> allotments = housingAllotmentRepository.findAll();
        if (complexCode != null && !complexCode.isEmpty()) {
            allotments = allotments.stream()
                .filter(a -> complexCode.equals(a.getComplexCode()))
                .collect(Collectors.toList());
        }
        if (empNo != null && !empNo.isEmpty()) {
            allotments = allotments.stream()
                .filter(a -> empNo.equals(a.getEmpNo()))
                .collect(Collectors.toList());
        }

        for (HousingAllotment a : allotments) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("empNo", a.getEmpNo());
            row.put("empName", getEmpName(a.getEmpNo()));
            row.put("designation", getDesignation(a.getEmpNo()));
            row.put("location", getLocation(a.getEmpNo()));
            row.put("building", getBuildingByFlat(a.getComplexCode(), a.getFlatNo()));
            row.put("flatNo", a.getFlatNo());
            row.put("area", getArea(a.getComplexCode(), a.getFlatNo()));
            row.put("grade", getGrade(a.getEmpNo()));
            row.put("email", getEmail(a.getEmpNo()));
            row.put("contactNo", getContactNo(a.getEmpNo()));
            occupiedFlats.add(row);
        }

        // Get vacant flats for the complex
        if (complexCode != null && !complexCode.isEmpty()) {
            List<HousingMaster> allFlats = housingMasterRepository.findAll().stream()
                .filter(h -> complexCode.equals(h.getComplexCode()))
                .collect(Collectors.toList());

            List<String> occupiedFlatNos = allotments.stream()
                .map(HousingAllotment::getFlatNo)
                .collect(Collectors.toList());

            vacantFlats = allFlats.stream()
                .filter(f -> !occupiedFlatNos.contains(f.getFlatNo()))
                .map(f -> {
                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("building", f.getBuilding());
                    row.put("flatNo", f.getFlatNo());
                    row.put("area", f.getArea());
                    return row;
                })
                .collect(Collectors.toList());
        }

        return new OccupancyReportResult(occupiedFlats, vacantFlats);
    }

    // ========== MATRIX REPORT (PO Items vs Complaints) ==========
    public List<Map<String, Object>> getMatrixReport() {
        List<PoSubmitted> poItems = poSubmittedRepository.findAll().stream()
            .filter(p -> p.getStatus() != null && p.getStatus() > 0)
            .collect(Collectors.toList());

        Map<String, Long> poCountMap = new HashMap<>();
        Map<String, Double> poAmountMap = new HashMap<>();

        for (PoSubmitted po : poItems) {
            String key = po.getPoName() != null ? po.getPoName() : "Unknown";
            poCountMap.merge(key, 1L, Long::sum);

            try {
                double amount = po.getTotal() != null ? Double.parseDouble(po.getTotal()) : 0.0;
                poAmountMap.merge(key, amount, Double::sum);
            } catch (NumberFormatException e) {
                // ignore
            }
        }

        List<Map<String, Object>> result = new ArrayList<>();
        for (String poName : poCountMap.keySet()) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("poName", poName);
            row.put("count", poCountMap.get(poName));
            row.put("totalAmount", poAmountMap.getOrDefault(poName, 0.0));
            result.add(row);
        }

        return result;
    }

    // ========== PO ITEMS VS QUANTITY REPORT ==========
    public List<Map<String, Object>> getPoQuantityReport() {
        List<PoSubmitted> poItems = poSubmittedRepository.findAll().stream()
            .filter(p -> p.getStatus() != null && p.getStatus() > 0)
            .collect(Collectors.toList());

        return poItems.stream().map(po -> {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("poName", po.getPoName());
            row.put("po", po.getPo());
            row.put("quantity", po.getQuantity());
            row.put("rate", po.getPoRate());
            row.put("total", po.getTotal());
            row.put("reqId", po.getReqId());
            return row;
        }).collect(Collectors.toList());
    }

    // ========== ADMIN DASHBOARD STATS ==========
    public Map<String, Long> getDashboardStats() {
        List<Complaint> complaints = complaintRepository.findAll();
        Map<String, Long> stats = new HashMap<>();

        stats.put("total", (long) complaints.size());
        stats.put("submitted", complaints.stream().filter(c -> c.getStatus() != null && c.getStatus() == 20L).count());
        stats.put("inProgress", complaints.stream().filter(c -> c.getStatus() != null && c.getStatus() == 30L).count());
        stats.put("sentToVendor", complaints.stream().filter(c -> c.getStatus() != null && c.getStatus() == 50L).count());
        stats.put("resolved", complaints.stream().filter(c -> c.getStatus() != null && c.getStatus() == 55L).count());
        stats.put("completed", complaints.stream().filter(c -> c.getStatus() != null && c.getStatus() == 60L).count());

        return stats;
    }

    // Helper methods
    private String getCategoryName(Long subcategoryId) {
        if (subcategoryId == null) return "";
        // This would need proper repository injection
        return "";
    }

    private String getSubcategoryName(Long subcategoryId) {
        if (subcategoryId == null) return "";
        return "";
    }

    private String getVendorName(String vendorCode) {
        if (vendorCode == null) return "";
        return "";
    }

    private String getStatusName(Long status) {
        if (status == null) return "";
        switch (status.intValue()) {
            case 20: return "Submitted";
            case 25: return "Acknowledged";
            case 30: return "In Progress";
            case 40: return "On Hold";
            case 50: return "Sent to Vendor";
            case 55: return "Resolved";
            case 60: return "Completed";
            default: return "";
        }
    }

    private String getEmpName(String empNo) { return "Employee " + empNo; }
    private String getDesignation(String empNo) { return "Designation " + empNo; }
    private String getLocation(String empNo) { return "Location " + empNo; }
    private String getBuilding(String empNo) { return "Building " + empNo; }
    private String getFlatNo(String empNo) { return "Flat " + empNo; }
    private String getBuildingByFlat(String complexCode, String flatNo) { return "Building " + flatNo; }
    private String getArea(String complexCode, String flatNo) { return "Area " + flatNo; }
    private String getGrade(String empNo) { return "Grade " + empNo; }
    private String getEmail(String empNo) { return "email@" + empNo + ".com"; }
    private String getContactNo(String empNo) { return "987654321" + empNo.substring(Math.max(0, empNo.length() - 1)); }

    public record OccupancyReportResult(
        List<Map<String, Object>> occupiedFlats,
        List<Map<String, Object>> vacantFlats
    ) {}
}