package com.hpcl.colony.service;

import com.hpcl.colony.dto.ComplaintDto;
import com.hpcl.colony.dto.ComplaintDto.PoItemDto;
import com.hpcl.colony.entity.*;
import com.hpcl.colony.repository.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
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
    private final com.hpcl.colony.repository.HousingAllotmentRepository housingAllotmentRepository;
    private final PoSubmittedRepository poSubmittedRepository;

    public ComplaintService(ComplaintRepository complaintRepository,
                            ComplaintSubcategoryRepository subcategoryRepository,
                            ComplaintCategoryRepository categoryRepository,
                            StatusCatalogRepository statusRepository,
                            VendorRepository vendorRepository,
                            HousingComplexRepository complexRepository,
                            com.hpcl.colony.repository.HousingAllotmentRepository housingAllotmentRepository,
                            PoSubmittedRepository poSubmittedRepository) {
        this.complaintRepository = complaintRepository;
        this.subcategoryRepository = subcategoryRepository;
        this.categoryRepository = categoryRepository;
        this.statusRepository = statusRepository;
        this.vendorRepository = vendorRepository;
        this.complexRepository = complexRepository;
        this.housingAllotmentRepository = housingAllotmentRepository;
        this.poSubmittedRepository = poSubmittedRepository;
    }

    public List<ComplaintDto> findAll() {
        return complaintRepository.findAll().stream()
            .map(this::mapToDto)
            .collect(Collectors.toList());
    }

    public Complaint findById(Long id) {
        return complaintRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Complaint not found: " + id));
    }

    public ComplaintDto getComplaintDto(Long id) {
        return mapToDto(findById(id));
    }

    public List<ComplaintDto> listComplaints(String fromDateStr, String toDateStr, List<String> complexCodes,
                                              List<Long> statuses, List<String> vendors, List<Long> complaintTypes,
                                              List<String> flatNos, String empNo, String isVendor, String adminEmpNo) {
        Specification<Complaint> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // User filter (non-admin sees only own complaints)
            if (empNo != null && !empNo.isEmpty() && adminEmpNo == null) {
                predicates.add(cb.equal(root.get("empNo"), empNo));
            }

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

            // Vendors
            if (vendors != null && !vendors.isEmpty()) {
                predicates.add(root.get("vendor").in(vendors));
            }

            // Complaint Types (category)
            if (complaintTypes != null && !complaintTypes.isEmpty()) {
                List<Long> subcategoryIds = subcategoryRepository.findAll().stream()
                    .filter(s -> complaintTypes.contains(s.getCategoryId()))
                    .map(ComplaintSubcategory::getId)
                    .collect(Collectors.toList());
                if (!subcategoryIds.isEmpty()) {
                    predicates.add(root.get("subcategoryId").in(subcategoryIds));
                }
            }

            // Flat Nos
            if (flatNos != null && !flatNos.isEmpty() && !flatNos.contains("All")) {
                predicates.add(root.get("flatNo").in(flatNos));
            }

            // Vendor Assignment
            if ("Yes".equalsIgnoreCase(isVendor)) {
                predicates.add(cb.isNotNull(root.get("vendor")));
            } else if ("No".equalsIgnoreCase(isVendor)) {
                predicates.add(cb.isNull(root.get("vendor")));
            }

            // Role filtering (COMPLEX_ADMIN mapping)
            if (adminEmpNo != null && !adminEmpNo.isEmpty()) {
                List<String> allowedComplexes = complexRepository.findAll().stream()
                    .filter(c -> c.getComplexAdmin() != null && c.getComplexAdmin().contains(adminEmpNo))
                    .map(HousingComplex::getComplexCode)
                    .collect(Collectors.toList());

                if (allowedComplexes.isEmpty()) {
                    predicates.add(cb.disjunction());
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

    @Transactional
    public ComplaintDto createComplaint(ComplaintDto dto, String empNo) {
        Complaint c = new Complaint();
        c.setEmpNo(empNo);
        c.setSubmitBy(empNo);
        c.setSubcategoryId(dto.getSubcategoryId());
        c.setCompDetails(dto.getCompDetails());
        c.setStatus(20L); // Submitted status

        List<com.hpcl.colony.entity.HousingAllotment> allotments = housingAllotmentRepository.findByEmpNo(empNo);
        if (!allotments.isEmpty()) {
            c.setComplexCode(allotments.get(0).getComplexCode());
            c.setFlatNo(allotments.get(0).getFlatNo());
        } else {
            c.setComplexCode(dto.getComplexCode());
            c.setFlatNo(dto.getFlatNo());
        }

        Complaint saved = complaintRepository.save(c);
        return mapToDto(saved);
    }

    @Transactional
    public void acknowledge(Long id, String updatedBy) {
        Complaint c = findById(id);
        c.setStatus(25L); // Acknowledged
        c.setUpdatedBy(updatedBy);
        c.setUpdateDate(LocalDateTime.now());
        complaintRepository.save(c);
    }

    @Transactional
    public void startProgress(Long id, String updatedBy) {
        Complaint c = findById(id);
        c.setStatus(30L); // In Progress
        c.setUpdatedBy(updatedBy);
        c.setUpdateDate(LocalDateTime.now());
        complaintRepository.save(c);
    }

    @Transactional
    public void assignToVendor(Long id, String vendorCode, String updatedBy) {
        Complaint c = findById(id);
        c.setVendor(vendorCode);
        c.setStatus(50L); // Sent to Vendor
        c.setUpdatedBy(updatedBy);
        c.setUpdateDate(LocalDateTime.now());
        complaintRepository.save(c);
    }

    @Transactional
    public void hold(Long id, String updatedBy) {
        Complaint c = findById(id);
        c.setStatus(40L); // On Hold
        c.setUpdatedBy(updatedBy);
        c.setUpdateDate(LocalDateTime.now());
        complaintRepository.save(c);
    }

    @Transactional
    public void resolve(Long id, String updatedBy) {
        Complaint c = findById(id);
        c.setStatus(55L); // Resolved
        c.setUpdatedBy(updatedBy);
        c.setUpdateDate(LocalDateTime.now());
        complaintRepository.save(c);
    }

    @Transactional
    public void complete(Long id, String feedback, String updatedBy) {
        Complaint c = findById(id);
        c.setStatus(60L); // Completed
        c.setFeedback(feedback);
        c.setUpdatedBy(updatedBy);
        c.setUpdateDate(LocalDateTime.now());
        complaintRepository.save(c);
    }

    @Transactional
    public void updateFeedback(Long id, String feedback, String updatedBy) {
        Complaint c = findById(id);
        c.setFeedback(feedback);
        c.setUpdatedBy(updatedBy);
        c.setUpdateDate(LocalDateTime.now());
        complaintRepository.save(c);
    }

    private ComplaintDto mapToDto(Complaint c) {
        ComplaintDto dto = ComplaintDto.builder()
            .id(c.getId())
            .empNo(c.getEmpNo())
            .subcategoryId(c.getSubcategoryId())
            .compDetails(c.getCompDetails())
            .submitDate(c.getSubmitDate())
            .updateDate(c.getUpdateDate())
            .complexCode(c.getComplexCode())
            .vendor(c.getVendor())
            .submitBy(c.getSubmitBy())
            .flatNo(c.getFlatNo())
            .status(c.getStatus())
            .uploadFile(c.getUploadFile())
            .uploadFile1(c.getUploadFile1())
            .feedback(c.getFeedback())
            .build();

        // Resolve subcategory and category names
        if (c.getSubcategoryId() != null) {
            subcategoryRepository.findById(c.getSubcategoryId()).ifPresent(sub -> {
                dto.setSubcategoryName(sub.getName());
                if (sub.getCategoryId() != null) {
                    categoryRepository.findById(sub.getCategoryId())
                        .ifPresent(cat -> dto.setCategoryName(cat.getName()));
                }
            });
        }

        // Resolve status name
        if (c.getStatus() != null) {
            statusRepository.findById(c.getStatus())
                .ifPresent(s -> dto.setStatusName(s.getName()));
        }

        // Resolve vendor name
        if (c.getVendor() != null) {
            vendorRepository.findFirstByCodeAndActiveIsNull(c.getVendor())
                .ifPresent(v -> dto.setVendorName(v.getName()));
        }

        // Resolve complex name
        if (c.getComplexCode() != null) {
            complexRepository.findById(c.getComplexCode())
                .ifPresent(complex -> dto.setComplexName(complex.getComplexName()));
        }

        // Get PO items for job voucher
        List<PoSubmitted> poItems = poSubmittedRepository.findAll().stream()
            .filter(p -> p.getReqId() != null && p.getReqId().equals(String.valueOf(c.getId())))
            .filter(p -> !"0".equals(p.getStatus()))
            .collect(Collectors.toList());

        if (!poItems.isEmpty()) {
            dto.setPoItems(poItems.stream()
                .map(p -> PoItemDto.builder()
                    .id(p.getId())
                    .po(p.getPo())
                    .poName(p.getPoName())
                    .quantity(p.getQuantity())
                    .poRate(p.getPoRate())
                    .total(p.getTotal())
                    .status(String.valueOf(p.getStatus()))
                    .build())
                .collect(Collectors.toList()));

            double total = poItems.stream()
                .filter(p -> p.getTotal() != null)
                .mapToDouble(p -> Double.parseDouble(p.getTotal()))
                .sum();
            dto.setPoTotalAmount(total);
        }

        return dto;
    }
}