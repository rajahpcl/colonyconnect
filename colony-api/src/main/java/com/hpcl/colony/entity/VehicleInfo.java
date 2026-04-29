package com.hpcl.colony.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "COLONY_VEHICLEINFO", schema = "colonyconnect")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VehicleInfo {
    @Id
    @Column(name = "ID")
    private Long id;

    @Column(name = "EMP_NO")
    private String empNo;

    @Column(name = "MAKE")
    private String make;

    @Column(name = "MODEL")
    private String model;

    @Column(name = "REGISTRAION_NO") // Keeping typo for legacy compatibility
    private String registrationNo;

    @Column(name = "VEHICLE_TYPE")
    private String vehicleType;

    @Column(name = "COLOR")
    private String color;

    @Column(name = "FLAG")
    private String flag;

    @Column(name = "UPDATE_DATE")
    private LocalDateTime updateDate;
}
