package com.hpcl.colony.controller;

import com.hpcl.colony.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
public class ReportController {
    private final ReportService reportService;

    @GetMapping("/complaints")
    public List<Map<String, Object>> getComplaintReport(
            @RequestParam(required = false) String fromDate,
            @RequestParam(required = false) String toDate,
            @RequestParam(required = false) List<String> complexCodes,
            @RequestParam(required = false) List<Long> statuses,
            @RequestParam(required = false) List<String> vendors,
            @RequestParam(required = false) List<Long> complaintTypes,
            @RequestParam(required = false) List<String> flatNos,
            @RequestParam(required = false) String empNo) {
        return reportService.getComplaintReport(fromDate, toDate, complexCodes, statuses, vendors,
            complaintTypes, flatNos, empNo);
    }

    @GetMapping("/vehicles")
    public List<Map<String, Object>> getVehicleReport(
            @RequestParam(required = false) String complexCode) {
        return reportService.getVehicleReport(complexCode);
    }

    @GetMapping("/occupancy")
    public ResponseEntity<ReportService.OccupancyReportResult> getOccupancyReport(
            @RequestParam(required = false) String complexCode,
            @RequestParam(required = false) String empNo) {
        return ResponseEntity.ok(reportService.getOccupancyReport(complexCode, empNo));
    }

    @GetMapping("/matrix")
    public List<Map<String, Object>> getMatrixReport() {
        return reportService.getMatrixReport();
    }

    @GetMapping("/po-quantity")
    public List<Map<String, Object>> getPoQuantityReport() {
        return reportService.getPoQuantityReport();
    }

    @GetMapping("/dashboard")
    public Map<String, Long> getDashboardStats() {
        return reportService.getDashboardStats();
    }
}