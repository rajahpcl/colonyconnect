package com.hpcl.colony.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Maps to colony_vendor_mapping table.
 * ACTIVE column: 'A' = active, 'D' = deleted.
 */
@Entity
@Table(name = "colony_vendor_mapping", schema = "colonyconnect")
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

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getVendorNumber() { return vendorNumber; }
    public void setVendorNumber(String vendorNumber) { this.vendorNumber = vendorNumber; }
    public String getComplexCode() { return complexCode; }
    public void setComplexCode(String complexCode) { this.complexCode = complexCode; }
    public String getBuilding() { return building; }
    public void setBuilding(String building) { this.building = building; }
    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }
    public String getActive() { return active; }
    public void setActive(String active) { this.active = active; }
}