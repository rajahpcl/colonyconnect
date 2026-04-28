package com.hpcl.colony.controller;

import com.hpcl.colony.dto.ComplaintDto;
import com.hpcl.colony.service.ComplaintService;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
public class ComplaintController {

    private final ComplaintService complaintService;

    public ComplaintController(ComplaintService complaintService) {
        this.complaintService = complaintService;
    }

    // --- Admin Endpoints ---
    @GetMapping("/admin/complaints")
    public List<ComplaintDto> listAdminComplaints(
            @RequestParam(required = false) String fromDate,
            @RequestParam(required = false) String toDate,
            @RequestParam(required = false) List<String> complexCodes,
            @RequestParam(required = false) List<Long> statuses,
            @RequestParam(required = false) String isVendor,
            HttpSession session) {
        
        String adminEmpNo = (String) session.getAttribute("EMP_NO");
        return complaintService.listComplaints(fromDate, toDate, complexCodes, statuses, isVendor, adminEmpNo);
    }

    // --- User Endpoints ---
    @PostMapping(value = "/complaints", consumes = {"multipart/form-data"})
    public ResponseEntity<ComplaintDto> createComplaint(
            @ModelAttribute ComplaintDto complaintDto,
            HttpSession session) {
        String empNo = (String) session.getAttribute("EMP_NO");
        return ResponseEntity.status(HttpStatus.CREATED).body(complaintService.createComplaint(complaintDto, empNo));
    }

    @GetMapping("/complaints/statuses")
    public List<com.hpcl.colony.entity.StatusCatalog> getStatusList(com.hpcl.colony.repository.StatusCatalogRepository repo) {
        return repo.findAll();
    }
}
