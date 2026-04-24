package com.hpcl.colony.service;

import com.hpcl.colony.entity.*;
import com.hpcl.colony.exception.ResourceNotFoundException;
import com.hpcl.colony.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class MasterDataService {

    private final VendorRepository vendorRepository;
    private final VendorMappingRepository vendorMappingRepository;
    private final ComplaintCategoryRepository complaintCategoryRepository;
    private final ComplaintSubcategoryRepository complaintSubcategoryRepository;
    private final PoItemRepository poItemRepository;
    private final IfmsMemberRepository ifmsMemberRepository;
    private final StatusCatalogRepository statusCatalogRepository;

    // ---- Vendors ----

    public List<Vendor> getVendors() {
        return vendorRepository.findAllByActiveIsNullOrderByNameAsc();
    }

    public Optional<Vendor> getVendorByCode(String code) {
        return vendorRepository.findFirstByCodeAndActiveIsNull(code);
    }

    public Vendor createVendor(Vendor vendor) {
        // active = null means active in legacy schema
        vendor.setActive(null);
        return vendorRepository.save(vendor);
    }

    public Vendor updateVendor(Long id, Vendor vendor) {
        Vendor existing = vendorRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Vendor not found"));
        existing.setCode(vendor.getCode());
        existing.setName(vendor.getName());
        existing.setEmail(vendor.getEmail());
        existing.setPhone(vendor.getPhone());
        existing.setCategoryId(vendor.getCategoryId());
        return vendorRepository.save(existing);
    }

    public void deleteVendor(Long id) {
        Vendor vendor = vendorRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Vendor not found"));
        vendor.setActive("0");
        vendorRepository.save(vendor);
    }

    // ---- Vendor Mappings ----

    public List<VendorMapping> getVendorMappings() {
        return vendorMappingRepository.findAllByActiveOrderByIdDesc("A");
    }

    public VendorMapping createVendorMapping(VendorMapping vendorMapping) {
        vendorMapping.setActive("A");
        return vendorMappingRepository.save(vendorMapping);
    }

    public VendorMapping updateVendorMapping(Long id, VendorMapping vendorMapping) {
        VendorMapping existing = vendorMappingRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Vendor mapping not found"));
        existing.setVendorNumber(vendorMapping.getVendorNumber());
        existing.setComplexCode(vendorMapping.getComplexCode());
        existing.setBuilding(vendorMapping.getBuilding());
        existing.setCategoryId(vendorMapping.getCategoryId());
        return vendorMappingRepository.save(existing);
    }

    public void deleteVendorMapping(Long id) {
        VendorMapping vendorMapping = vendorMappingRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Vendor mapping not found"));
        vendorMapping.setActive("D");
        vendorMappingRepository.save(vendorMapping);
    }

    // ---- Complaint Categories ----

    public List<ComplaintCategory> getComplaintCategories() {
        return complaintCategoryRepository.findAllByActiveOrderByIdAsc("A");
    }

    public ComplaintCategory createComplaintCategory(ComplaintCategory category) {
        category.setActive("A");
        return complaintCategoryRepository.save(category);
    }

    public ComplaintCategory updateComplaintCategory(Long id, ComplaintCategory category) {
        ComplaintCategory existing = complaintCategoryRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Complaint category not found"));
        existing.setName(category.getName());
        return complaintCategoryRepository.save(existing);
    }

    public void deleteComplaintCategory(Long id) {
        ComplaintCategory category = complaintCategoryRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Complaint category not found"));
        category.setActive("I");
        complaintCategoryRepository.save(category);
    }

    // ---- Complaint Subcategories ----

    public List<ComplaintSubcategory> getComplaintSubcategories(Long categoryId) {
        return categoryId == null
            ? complaintSubcategoryRepository.findAllByActiveOrderByIdAsc("A")
            : complaintSubcategoryRepository.findAllByCategoryIdAndActiveOrderByIdAsc(categoryId, "A");
    }

    public ComplaintSubcategory createComplaintSubcategory(ComplaintSubcategory subcategory) {
        subcategory.setActive("A");
        return complaintSubcategoryRepository.save(subcategory);
    }

    public ComplaintSubcategory updateComplaintSubcategory(Long id, ComplaintSubcategory subcategory) {
        ComplaintSubcategory existing = complaintSubcategoryRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Complaint subcategory not found"));
        existing.setCategoryId(subcategory.getCategoryId());
        existing.setName(subcategory.getName());
        return complaintSubcategoryRepository.save(existing);
    }

    public void deleteComplaintSubcategory(Long id) {
        ComplaintSubcategory subcategory = complaintSubcategoryRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Complaint subcategory not found"));
        subcategory.setActive("I");
        complaintSubcategoryRepository.save(subcategory);
    }

    // ---- PO Items ----

    public List<PoItem> getPoItems() {
        return poItemRepository.findAllActiveOrderByAgtmItemAsc();
    }

    public List<PoItem> getPoItemsByCategory(String poCategory) {
        return poItemRepository.findAllActiveByPoCategoryOrderByAgtmItemAsc(poCategory);
    }

    public List<String> getPoCategories() {
        return poItemRepository.findDistinctActivePoCategories();
    }

    public int getNextPoItemNumber(String poCategory) {
        Integer maxNumber = poItemRepository.findMaxAgtmItemByPoCategory(poCategory);
        return maxNumber == null ? 10 : maxNumber + 10;
    }

    public PoItem createPoItem(PoItem poItem, String empNo) {
        if (poItem.getAgtmItem() == null) {
            poItem.setAgtmItem(String.valueOf(getNextPoItemNumber(poItem.getPoCategory())));
        }
        poItem.setStatus(10);
        poItem.setInsertedBy(empNo);
        poItem.setInsertedOn(new Timestamp(System.currentTimeMillis()));
        return poItemRepository.save(poItem);
    }

    public void deletePoItem(Long id, String empNo) {
        PoItem poItem = poItemRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("PO item not found"));
        poItem.setStatus(0);
        poItem.setUpdatedBy(empNo);
        poItem.setUpdatedOn(new Timestamp(System.currentTimeMillis()));
        poItemRepository.save(poItem);
    }

    // ---- IFMS Members ----

    public List<IfmsMember> getIfmsMembers() {
        return ifmsMemberRepository.findAllByStatusGreaterThan(0);
    }

    public IfmsMember createIfmsMember(IfmsMember ifmsMember, String empNo) {
        if (ifmsMemberRepository.existsByBvgTeamMemberIdAndStatusGreaterThan(ifmsMember.getBvgTeamMemberId(), 0)) {
            throw new IllegalArgumentException("IFMS Team Member ID already exists");
        }
        ifmsMember.setStatus(10);
        ifmsMember.setInsertedBy(empNo);
        ifmsMember.setInsertedOn(new Timestamp(System.currentTimeMillis()));
        return ifmsMemberRepository.save(ifmsMember);
    }

    public void deleteIfmsMember(Long id, String empNo) {
        IfmsMember ifmsMember = ifmsMemberRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("IFMS member not found"));
        ifmsMember.setStatus(0);
        ifmsMember.setUpdatedBy(empNo);
        ifmsMember.setUpdatedOn(new Timestamp(System.currentTimeMillis()));
        ifmsMemberRepository.save(ifmsMember);
    }

    // ---- Status Catalog ----

    public List<StatusCatalog> getStatuses() {
        return statusCatalogRepository.findAllByOrderByIdAsc();
    }

    public StatusCatalog createStatus(StatusCatalog statusCatalog) {
        if (statusCatalogRepository.existsById(statusCatalog.getId())) {
            throw new IllegalArgumentException("Status with this ID already exists");
        }
        return statusCatalogRepository.save(statusCatalog);
    }

    public void deleteStatus(Long id) {
        if (!statusCatalogRepository.existsById(id)) {
            throw new ResourceNotFoundException("Status not found");
        }
        statusCatalogRepository.deleteById(id);
    }
}
