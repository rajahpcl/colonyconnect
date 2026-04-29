package com.hpcl.colony.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "COLONY_ELECTRIC_RATE", schema = "colonyconnect")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ElectricRate {
    @Id
    @Column(name = "ID")
    private Long id;

    @Column(name = "ENTERD_DATE")
    private LocalDateTime enteredDate;

    @Column(name = "TARRIF_CATEGORY")
    private String tariffCategory;

    @Column(name = "FIXED_CHARGE")
    private Double fixedCharge;

    @Column(name = "ENERGY_CHARGE")
    private Double energyCharge;

    @Column(name = "WHEELING_CHARGE")
    private Double wheelingCharge;

    @Column(name = "RA_CHARGE")
    private Double raCharge;

    @Column(name = "FAC_RATE")
    private Double facRate;

    @Column(name = "UPDATE_BY")
    private String updateBy;

    @Column(name = "UPDATE_DATE")
    private LocalDateTime updateDate;
}
