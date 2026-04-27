package com.hpcl.colony.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Maps to housing_complex_list table.
 * Stores colony/complex info and admin assignments.
 * COMPLEX_ADMIN is a comma-separated list of employee numbers.
 */
@Entity
@Table(name = "housing_complex_list", schema = "colonyconnect")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HousingComplex {

    @Id
    @Column(name = "COMPLEX_CODE")
    private String complexCode;

    @Column(name = "COMPLEX_NAME")
    private String complexName;

    /** Comma-separated list of admin employee numbers */
    @Column(name = "COMPLEX_ADMIN")
    private String complexAdmin;

    public String getComplexCode() { return complexCode; }
    public void setComplexCode(String complexCode) { this.complexCode = complexCode; }
    public String getComplexName() { return complexName; }
    public void setComplexName(String complexName) { this.complexName = complexName; }
    public String getComplexAdmin() { return complexAdmin; }
    public void setComplexAdmin(String complexAdmin) { this.complexAdmin = complexAdmin; }
}
