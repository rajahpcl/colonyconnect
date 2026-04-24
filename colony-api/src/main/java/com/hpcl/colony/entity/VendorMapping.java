package com.hpcl.colony.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Maps to colony_vendor_mapping table.
 * ACTIVE column: 'A' = active, 'D' = deleted.
 */
@Entity
@Table(name = "colony_vendor_mapping")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VendorMapping {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Long id;

    @Column(name = "VENDOR_NUMBER", nullable = false)
    private String vendorNumber;

    @Column(name = "COMPLEX_CODE")
    private String complexCode;

    @Column(name = "BUILDING")
    private String building;

    @Column(name = "CATEGORY_ID")
    private Long categoryId;

    /** 'A' = active, 'D' = deleted */
    @Column(name = "ACTIVE")
    private String active;
}