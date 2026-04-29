package com.hpcl.colony.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ElectricRateDto {
    private Long id;
    private LocalDateTime enteredDate;
    private String tariffCategory;
    private Double fixedCharge;
    private Double energyCharge;
    private Double wheelingCharge;
    private Double raCharge;
    private Double facRate;
    private String updateBy;
    private LocalDateTime updateDate;

    // For bulk save with 4 slabs
    private List<SlabRateDto> slabs;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SlabRateDto {
        private String tariffCategory; // "0-100", "101-300", "301-500", ">500"
        private Double fixedCharge;
        private Double energyCharge;
        private Double wheelingCharge;
        private Double raCharge;
        private Double facRate;
    }
}