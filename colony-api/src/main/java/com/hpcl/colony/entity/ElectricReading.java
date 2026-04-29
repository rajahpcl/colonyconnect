package com.hpcl.colony.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "COLONY_ELECTRIC_READING", schema = "colonyconnect")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ElectricReading {
    @Id
    @Column(name = "ID")
    private Long id;

    @Column(name = "ENTERD_DATE")
    private LocalDateTime enteredDate;

    @Column(name = "INIT_READING")
    private Double initReading;

    @Column(name = "FINAL_READING")
    private Double finalReading;

    @Column(name = "FLAT_NO")
    private String flatNo;

    @Column(name = "EMP_NO")
    private String empNo;

    @Column(name = "UPDATED_BY")
    private String updatedBy;

    @Column(name = "UPDATED_DATE")
    private LocalDateTime updatedDate;

    @Column(name = "TOTAL_AMOUNT")
    private String totalAmount;

    @Column(name = "STATUS")
    private String status;
}
