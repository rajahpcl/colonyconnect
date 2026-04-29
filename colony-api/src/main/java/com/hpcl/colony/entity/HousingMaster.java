package com.hpcl.colony.entity;

import jakarta.persistence.*;
import lombok.*;
import java.io.Serializable;

@Entity
@Table(name = "HOUSING_MASTER", schema = "colonyconnect")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@IdClass(HousingMasterId.class)
public class HousingMaster {
    @Id
    @Column(name = "COMPLEX_CODE")
    private String complexCode;

    @Id
    @Column(name = "BUILDING")
    private String building;

    @Id
    @Column(name = "FLAT_NO")
    private String flatNo;

    @Column(name = "AREA")
    private Double area;

    @Column(name = "BATHROOM_NO")
    private Integer bathroomNo;

    @Column(name = "MD_FACING")
    private String mdFacing;

    @Column(name = "BEDROOM_NO")
    private Integer bedroomNo;

    @Column(name = "FLOOR")
    private String floor;
}
