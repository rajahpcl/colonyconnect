package com.hpcl.colony.controller;

import com.hpcl.colony.dto.ComplaintDto;
import com.hpcl.colony.entity.Complaint;
import com.hpcl.colony.service.ComplaintService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class ComplaintController {

    private final ComplaintService complaintService;

    @GetMapping("/complaints")
    public List<ComplaintDto> getMyComplaints(@RequestParam(required = false) String empNo) {
        return complaintService.listComplaints(null, null, null, null, null, null, null, empNo, null, null);
    }

    @GetMapping("/complaints/{id}")
    public ComplaintDto getComplaint(@PathVariable Long id) {
        return complaintService.getComplaintDto(id);
    }

    @GetMapping("/admin/complaints")
    public List<ComplaintDto> listAdminComplaints(
            @RequestParam(required = false) String fromDate,
            @RequestParam(required = false) String toDate,
            @RequestParam(required = false) List<String> complexCodes,
            @RequestParam(required = false) List<Long> statuses,
            @RequestParam(required = false) List<String> vendors,
            @RequestParam(required = false) List<Long> complaintTypes,
            @RequestParam(required = false) List<String> flatNos,
            @RequestParam(required = false) String isVendor,
            @RequestParam(required = false) String adminEmpNo) {
        return complaintService.listComplaints(fromDate, toDate, complexCodes, statuses, vendors,
            complaintTypes, flatNos, null, isVendor, adminEmpNo);
    }

    @PostMapping(value = "/complaints", consumes = {"multipart/form-data"})
    public ResponseEntity<ComplaintDto> createComplaint(@ModelAttribute ComplaintDto complaintDto,
                                                        @RequestParam String empNo) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(complaintService.createComplaint(complaintDto, empNo));
    }

    // Workflow actions
    @PostMapping("/admin/complaints/{id}/acknowledge")
    public ResponseEntity<String> acknowledge(@PathVariable Long id, @RequestParam String updatedBy) {
        complaintService.acknowledge(id, updatedBy);
        return ResponseEntity.ok("Acknowledged Successfully");
    }

    @PostMapping("/admin/complaints/{id}/progress")
    public ResponseEntity<String> startProgress(@PathVariable Long id, @RequestParam String updatedBy) {
        complaintService.startProgress(id, updatedBy);
        return ResponseEntity.ok("Moved to In Progress");
    }

    @PostMapping("/admin/complaints/{id}/assign-vendor")
    public ResponseEntity<String> assignVendor(@PathVariable Long id,
                                                @RequestParam String vendorCode,
                                                @RequestParam String updatedBy) {
        complaintService.assignToVendor(id, vendorCode, updatedBy);
        return ResponseEntity.ok("Assigned to Vendor");
    }

    @PostMapping("/admin/complaints/{id}/hold")
    public ResponseEntity<String> hold(@PathVariable Long id, @RequestParam String updatedBy) {
        complaintService.hold(id, updatedBy);
        return ResponseEntity.ok("Put On Hold");
    }

    @PostMapping("/admin/complaints/{id}/resolve")
    public ResponseEntity<String> resolve(@PathVariable Long id, @RequestParam String updatedBy) {
        complaintService.resolve(id, updatedBy);
        return ResponseEntity.ok("Resolved");
    }

    @PostMapping("/admin/complaints/{id}/complete")
    public ResponseEntity<String> complete(@PathVariable Long id,
                                            @RequestParam(required = false) String feedback,
                                            @RequestParam String updatedBy) {
        complaintService.complete(id, feedback, updatedBy);
        return ResponseEntity.ok("Completed");
    }

    @PostMapping("/complaints/{id}/feedback")
    public ResponseEntity<String> updateFeedback(@PathVariable Long id,
                                                  @RequestParam String feedback,
                                                  @RequestParam String updatedBy) {
        complaintService.updateFeedback(id, feedback, updatedBy);
        return ResponseEntity.ok("Feedback Updated");
    }

    @GetMapping("/complaints/statuses")
    public List<com.hpcl.colony.entity.StatusCatalog> getStatusList(
            com.hpcl.colony.repository.StatusCatalogRepository repo) {
        return repo.findAll();
    }
}