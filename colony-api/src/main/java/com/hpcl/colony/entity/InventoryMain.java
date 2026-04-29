package com.hpcl.colony.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "COLONY_INVENTORY_MAIN", schema = "colonyconnect")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryMain {
    @Id
    @Column(name = "ID")
    private Long id;

    @Column(name = "EMP_NO")
    private String empNo;

    @Column(name = "CONTACT_NO")
    private String contactNo;

    @Column(name = "COMPLEX_CODE")
    private String complexCode;

    @Column(name = "FLAT_NO")
    private String flatNo;

    @Column(name = "INVENTORY_TAKEN_ON")
    private LocalDateTime inventoryTakenOn;

    @Column(name = "ELECTRICITY_READING")
    private String electricityReading;

    @Column(name = "REASON")
    private String reason;

    @Column(name = "STATUS")
    private String status;

    @Column(name = "UPDATE_BY")
    private String updateBy;

    @Column(name = "UPDATE_DATE")
    private LocalDateTime updateDate;
}
