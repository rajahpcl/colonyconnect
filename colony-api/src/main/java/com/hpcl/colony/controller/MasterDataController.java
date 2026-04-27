package com.hpcl.colony.controller;

import com.hpcl.colony.entity.ComplaintCategory;
import com.hpcl.colony.entity.ComplaintSubcategory;
import com.hpcl.colony.entity.IfmsMember;
import com.hpcl.colony.entity.PoItem;
import com.hpcl.colony.entity.StatusCatalog;
import com.hpcl.colony.entity.Vendor;
import com.hpcl.colony.entity.VendorMapping;
import com.hpcl.colony.service.MasterDataService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/masters")
public class MasterDataController {

    private final MasterDataService masterDataService;

    public MasterDataController(MasterDataService masterDataService) {
        this.masterDataService = masterDataService;
    }

    @GetMapping("/vendors")
    public List<Vendor> getVendors() {
        return masterDataService.getVendors();
    }

    @GetMapping("/vendors/by-code/{code}")
    public ResponseEntity<Vendor> getVendorByCode(@PathVariable String code) {
        return masterDataService.getVendorByCode(code)
            .map(ResponseEntity::ok)
            .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Vendor categories are now resolved via categoryId on the Vendor entity

    @PostMapping("/vendors")
    public ResponseEntity<Vendor> createVendor(@RequestBody Vendor vendor) {
        return ResponseEntity.status(HttpStatus.CREATED).body(masterDataService.createVendor(vendor));
    }

    @PatchMapping("/vendors/{id}")
    public Vendor updateVendor(@PathVariable Long id, @RequestBody Vendor vendor) {
        return masterDataService.updateVendor(id, vendor);
    }

    @DeleteMapping("/vendors/{id}")
    public ResponseEntity<Map<String, String>> deleteVendor(@PathVariable Long id) {
        masterDataService.deleteVendor(id);
        return ResponseEntity.ok(Map.of("message", "Vendor deactivated"));
    }

    @GetMapping("/vendor-mappings")
    public List<VendorMapping> getVendorMappings() {
        return masterDataService.getVendorMappings();
    }

    @PostMapping("/vendor-mappings")
    public ResponseEntity<VendorMapping> createVendorMapping(@RequestBody VendorMapping vendorMapping) {
        return ResponseEntity.status(HttpStatus.CREATED).body(masterDataService.createVendorMapping(vendorMapping));
    }

    @PatchMapping("/vendor-mappings/{id}")
    public VendorMapping updateVendorMapping(@PathVariable Long id, @RequestBody VendorMapping vendorMapping) {
        return masterDataService.updateVendorMapping(id, vendorMapping);
    }

    @DeleteMapping("/vendor-mappings/{id}")
    public ResponseEntity<Map<String, String>> deleteVendorMapping(@PathVariable Long id) {
        masterDataService.deleteVendorMapping(id);
        return ResponseEntity.ok(Map.of("message", "Vendor mapping deactivated"));
    }

    @GetMapping("/complaint-categories")
    public List<ComplaintCategory> getComplaintCategories() {
        return masterDataService.getComplaintCategories();
    }

    @PostMapping("/complaint-categories")
    public ResponseEntity<ComplaintCategory> createComplaintCategory(@RequestBody ComplaintCategory complaintCategory) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(masterDataService.createComplaintCategory(complaintCategory));
    }

    @PatchMapping("/complaint-categories/{id}")
    public ComplaintCategory updateComplaintCategory(
            @PathVariable Long id,
            @RequestBody ComplaintCategory complaintCategory) {
        return masterDataService.updateComplaintCategory(id, complaintCategory);
    }

    @DeleteMapping("/complaint-categories/{id}")
    public ResponseEntity<Map<String, String>> deleteComplaintCategory(@PathVariable Long id) {
        masterDataService.deleteComplaintCategory(id);
        return ResponseEntity.ok(Map.of("message", "Complaint category deactivated"));
    }

    @GetMapping("/complaint-subcategories")
    public List<ComplaintSubcategory> getComplaintSubcategories(@RequestParam(required = false) Long categoryId) {
        return masterDataService.getComplaintSubcategories(categoryId);
    }

    @PostMapping("/complaint-subcategories")
    public ResponseEntity<ComplaintSubcategory> createComplaintSubcategory(
            @RequestBody ComplaintSubcategory complaintSubcategory) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(masterDataService.createComplaintSubcategory(complaintSubcategory));
    }

    @PatchMapping("/complaint-subcategories/{id}")
    public ComplaintSubcategory updateComplaintSubcategory(
            @PathVariable Long id,
            @RequestBody ComplaintSubcategory complaintSubcategory) {
        return masterDataService.updateComplaintSubcategory(id, complaintSubcategory);
    }

    @DeleteMapping("/complaint-subcategories/{id}")
    public ResponseEntity<Map<String, String>> deleteComplaintSubcategory(@PathVariable Long id) {
        masterDataService.deleteComplaintSubcategory(id);
        return ResponseEntity.ok(Map.of("message", "Complaint subcategory deactivated"));
    }

    @GetMapping("/po-items")
    public List<PoItem> getPoItems() {
        return masterDataService.getPoItems();
    }

    @GetMapping("/po-items/next-number")
    public Map<String, Integer> getNextPoItemNumber(@RequestParam String poCategory) {
        return Map.of("nextNumber", masterDataService.getNextPoItemNumber(poCategory));
    }

    @PostMapping("/po-items")
    public ResponseEntity<PoItem> createPoItem(@RequestBody PoItem poItem, HttpSession session) {
        String empNo = (String) session.getAttribute("EMP_NO");
        return ResponseEntity.status(HttpStatus.CREATED).body(masterDataService.createPoItem(poItem, empNo));
    }

    @DeleteMapping("/po-items/{id}")
    public ResponseEntity<Map<String, String>> deletePoItem(@PathVariable Long id, HttpSession session) {
        String empNo = (String) session.getAttribute("EMP_NO");
        masterDataService.deletePoItem(id, empNo);
        return ResponseEntity.ok(Map.of("message", "PO item deactivated"));
    }

    @GetMapping("/ifms-members")
    public List<IfmsMember> getIfmsMembers() {
        return masterDataService.getIfmsMembers();
    }

    @PostMapping("/ifms-members")
    public ResponseEntity<IfmsMember> createIfmsMember(@RequestBody IfmsMember ifmsMember, HttpSession session) {
        String empNo = (String) session.getAttribute("EMP_NO");
        return ResponseEntity.status(HttpStatus.CREATED).body(masterDataService.createIfmsMember(ifmsMember, empNo));
    }

    @DeleteMapping("/ifms-members/{id}")
    public ResponseEntity<Map<String, String>> deleteIfmsMember(@PathVariable Long id, HttpSession session) {
        String empNo = (String) session.getAttribute("EMP_NO");
        masterDataService.deleteIfmsMember(id, empNo);
        return ResponseEntity.ok(Map.of("message", "IFMS member deactivated"));
    }

    @GetMapping("/statuses")
    public List<StatusCatalog> getStatuses() {
        return masterDataService.getStatuses();
    }

    @PostMapping("/statuses")
    public ResponseEntity<StatusCatalog> createStatus(@RequestBody StatusCatalog statusCatalog) {
        return ResponseEntity.status(HttpStatus.CREATED).body(masterDataService.createStatus(statusCatalog));
    }

    @DeleteMapping("/statuses/{id}")
    public ResponseEntity<Map<String, String>> deleteStatus(@PathVariable Long id) {
        masterDataService.deleteStatus(id);
        return ResponseEntity.ok(Map.of("message", "Status deleted"));
    }
}
