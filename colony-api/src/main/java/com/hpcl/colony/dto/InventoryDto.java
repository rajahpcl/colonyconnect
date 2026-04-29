package com.hpcl.colony.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryDto {
    private Long id;
    private String empNo;
    private String empName;
    private String contactNo;
    private String complexCode;
    private String complexName;
    private String flatNo;
    private String flatInfo;
    private String occupyDate;
    private String location;
    private LocalDateTime inventoryTakenOn;
    private String reason;
    private String status; // null/10=Draft, 20=Submitted, 30=Approved
    private String updatedBy;
    private LocalDateTime updatedDate;

    // Entry details grouped by category
    private List<InventoryEntryDto> electricals;
    private List<InventoryEntryDto> furnitures;
    private List<InventoryEntryDto> keys;
    private List<InventoryEntryDto> phoneCable;
    private List<InventoryEntryDto> others;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class InventoryEntryDto {
        private Long id;
        private String masterId;
        private String description;
        private String handingQty;
        private String takingQty;
        private String remarks;
        private String mainId;
        private String category;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class InventoryMasterDto {
        private Long id;
        private String description;
        private String category; // Electricals, Furnitures, Keys, Phone/Cable, Others
    }
}