package com.hpcl.colony.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ElectricReadingDto {
    private Long id;
    private LocalDateTime enteredDate;
    private String monthYear; // For UI - "Apr-2026"
    private String complexCode;
    private String building;
    private String flatNo;
    private String empNo;
    private String empName;
    private Double initReading;
    private Double initReading1; // Second meter
    private Double finalReading;
    private Double finalReading1; // Second meter
    private Double totalAmount;
    private String status; // null, "Approved"
    private String updatedBy;
    private LocalDateTime updatedDate;

    // For bill calculation result
    private BillCalculationResult billCalculation;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class BillCalculationResult {
        private Double unitsConsumed;
        private Double energyCharge;
        private Double raCharge;
        private Double fixedCharge;
        private Double facCharge;
        private Double wheelingCharge;
        private Double amountBeforeTax;
        private Double govtDuty; // 16%
        private Double mhTax; // 0.2604 per unit
        private Double totalAmount;
        private String slabApplied;
    }
}