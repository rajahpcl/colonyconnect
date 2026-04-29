package com.hpcl.colony.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ComplaintDto {
    private Long id;
    private String empNo;
    private String empName;
    private String empEmail;
    private Long subcategoryId;
    private String subcategoryName;
    private String categoryId;
    private String categoryName;
    private String compDetails;
    private LocalDateTime submitDate;
    private LocalDateTime updateDate;
    private String complexCode;
    private String complexName;
    private String building;
    private String flatNo;
    private String vendor;
    private String vendorName;
    private Long status;
    private String statusName;
    private String uploadFile;
    private String uploadFile1;
    private String submitBy;

    // PO Items for job voucher
    private List<PoItemDto> poItems;
    private Double poTotalAmount;

    // Feedback
    private String feedback;

    // For filters
    private LocalDateTime fromDate;
    private LocalDateTime toDate;
    private List<String> complexCodes;
    private List<Long> statusList;
    private List<Long> complaintTypes;
    private List<String> flatNos;
    private List<String> vendors;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PoItemDto {
        private Long id;
        private String po;
        private String poName;
        private String quantity;
        private String poRate;
        private String total;
        private String status;
    }
}