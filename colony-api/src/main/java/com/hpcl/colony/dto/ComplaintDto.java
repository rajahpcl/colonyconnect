package com.hpcl.colony.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ComplaintDto {
    private Long id;
    private String empNo;
    private Long subcategoryId;
    private String compDetails;
    private LocalDateTime submitDate;
    private LocalDateTime updateDate;
    private String complexCode;
    private String vendor;
    private String submitBy;
    private String flatNo;
    private Long status;
    private String uploadFile;
    private String uploadFile1;

    // Derived names
    private String statusName;
    private String categoryName;
    private String subcategoryName;
    private String vendorName;
}
