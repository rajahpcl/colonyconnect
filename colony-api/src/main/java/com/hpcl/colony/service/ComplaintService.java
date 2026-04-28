package com.hpcl.colony.service;

import com.hpcl.colony.dto.ComplaintDto;
import com.hpcl.colony.entity.Complaint;
import com.hpcl.colony.entity.ComplaintSubcategory;
import com.hpcl.colony.entity.ComplaintCategory;
import com.hpcl.colony.entity.HousingComplex;
import com.hpcl.colony.entity.StatusCatalog;
import com.hpcl.colony.entity.Vendor;
import com.hpcl.colony.repository.ComplaintRepository;
import com.hpcl.colony.repository.ComplaintSubcategoryRepository;
import com.hpcl.colony.repository.ComplaintCategoryRepository;
import com.hpcl.colony.repository.HousingComplexRepository;
import com.hpcl.colony.repository.StatusCatalogRepository;
import com.hpcl.colony.repository.VendorRepository;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import jakarta.persistence.criteria.Predicate;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final ComplaintSubcategoryRepository subcategoryRepository;
    private final ComplaintCategoryRepository categoryRepository;
    private final StatusCatalogRepository statusRepository;
    private final VendorRepository vendorRepository;
    private final HousingComplexRepository complexRepository;

    public ComplaintService(ComplaintRepository complaintRepository,
                            ComplaintSubcategoryRepository subcategoryRepository,
                            ComplaintCategoryRepository categoryRepository,
                            StatusCatalogRepository statusRepository,
                            VendorRepository vendorRepository,
                            HousingComplexRepository complexRepository) {
        this.complaintRepository = complaintRepository;
        this.subcategoryRepository = subcategoryRepository;
        this.categoryRepository = categoryRepository;
        this.statusRepository = statusRepository;
        this.vendorRepository = vendorRepository;
        this.complexRepository = complexRepository;
    }

    public List<ComplaintDto> listComplaints(String fromDateStr, String toDateStr, List<String> complexCodes, List<Long> statuses, String isVendor, String adminEmpNo) {
        Specification<Complaint> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Dates
            if (fromDateStr != null && !fromDateStr.isEmpty() && toDateStr != null && !toDateStr.isEmpty()) {
                DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd-MMM-yyyy");
                LocalDateTime fromDate = LocalDate.parse(fromDateStr, formatter).atStartOfDay();
                LocalDateTime toDate = LocalDate.parse(toDateStr, formatter).atTime(23, 59, 59);
                predicates.add(cb.between(root.get("submitDate"), fromDate, toDate));
            }

            // Complex Codes
            if (complexCodes != null && !complexCodes.isEmpty()) {
                predicates.add(root.get("complexCode").in(complexCodes));
            }

            // Statuses
            if (statuses != null && !statuses.isEmpty()) {
                predicates.add(root.get("status").in(statuses));
            }

            // Vendor Assignment
            if ("Yes".equalsIgnoreCase(isVendor)) {
                predicates.add(cb.isNotNull(root.get("vendor")));
            } else if ("No".equalsIgnoreCase(isVendor)) {
                predicates.add(cb.isNull(root.get("vendor")));
            }

            // Role filtering (COMPLEX_ADMIN mapping)
            // Ideally we do a join with HousingComplex where complex_admin like %adminEmpNo%
            // Since JPA doesn't easily do unrelated joins without relations, we can fetch allowed complexes first
            if (adminEmpNo != null && !adminEmpNo.isEmpty()) {
                List<String> allowedComplexes = complexRepository.findAll().stream()
                    .filter(c -> c.getComplexAdmin() != null && c.getComplexAdmin().contains(adminEmpNo))
                    .map(HousingComplex::getComplexCode)
                    .collect(Collectors.toList());
                
                if (allowedComplexes.isEmpty()) {
                    predicates.add(cb.disjunction()); // false condition, return nothing
                } else {
                    predicates.add(root.get("complexCode").in(allowedComplexes));
                }
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return complaintRepository.findAll(spec).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    private ComplaintDto mapToDto(Complaint c) {
        ComplaintDto dto = new ComplaintDto();
        dto.setId(c.getId());
        dto.setEmpNo(c.getEmpNo());
        dto.setSubcategoryId(c.getSubcategoryId());
        dto.setCompDetails(c.getCompDetails());
        dto.setSubmitDate(c.getSubmitDate());
        dto.setUpdateDate(c.getUpdateDate());
        dto.setComplexCode(c.getComplexCode());
        dto.setVendor(c.getVendor());
        dto.setSubmitBy(c.getSubmitBy());
        dto.setFlatNo(c.getFlatNo());
        dto.setStatus(c.getStatus());
        dto.setUploadFile(c.getUploadFile());
        dto.setUploadFile1(c.getUploadFile1());

        // Resolve names
        if (c.getStatus() != null) {
            statusRepository.findById(c.getStatus())
                .ifPresent(s -> dto.setStatusName(s.getName()));
        }

        if (c.getSubcategoryId() != null) {
            subcategoryRepository.findById(c.getSubcategoryId()).ifPresent(sub -> {
                dto.setSubcategoryName(sub.getName());
                if (sub.getCategoryId() != null) {
                    categoryRepository.findById(sub.getCategoryId())
                        .ifPresent(cat -> dto.setCategoryName(cat.getName()));
                }
            });
        }

        if (c.getVendor() != null) {
            vendorRepository.findFirstByCodeAndActiveIsNull(c.getVendor())
                .ifPresent(v -> dto.setVendorName(v.getName()));
        }

        return dto;
    }

    public ComplaintDto createComplaint(ComplaintDto dto, String empNo) {
        Complaint c = new Complaint();
        c.setEmpNo(empNo);
        c.setSubmitBy(empNo);
        c.setSubcategoryId(dto.getSubcategoryId());
        c.setCompDetails(dto.getCompDetails());
        c.setComplexCode(dto.getComplexCode());
        c.setFlatNo(dto.getFlatNo());
        c.setStatus(10L); // 10 is usually "Submitted" or "Pending"
        
        Complaint saved = complaintRepository.save(c);
        return mapToDto(saved);
    }
}
