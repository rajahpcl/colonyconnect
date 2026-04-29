package com.hpcl.colony.entity;

import jakarta.persistence.*;
import lombok.*;
import java.io.Serializable;

@Entity
@Table(name = "COLONY_BUILDING_MSTR", schema = "colonyconnect")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@IdClass(BuildingMasterId.class)
public class BuildingMaster {
    @Id
    @Column(name = "COLONY_CODE")
    private String colonyCode;

    @Id
    @Column(name = "BUILDING")
    private String building;

    @Column(name = "ADMIN")
    private String admin;

    @Column(name = "ESCALATION")
    private String escalation;

    @Column(name = "VENDOR_CODE")
    private String vendorCode;
}
