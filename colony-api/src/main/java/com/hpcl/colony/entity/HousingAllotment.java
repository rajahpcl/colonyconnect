package com.hpcl.colony.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Maps to housing_alloted table.
 * Stores flat assignment for employees in a colony complex.
 */
@Entity
@Table(name = "housing_alloted", schema = "colonyconnect")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@IdClass(HousingAllotmentId.class)
public class HousingAllotment {

    @Id
    @Column(name = "COMPLEX_CODE")
    private String complexCode;

    @Id
    @Column(name = "EMP_NO")
    private String empNo;

    @Id
    @Column(name = "FLAT_NO")
    private String flatNo;

    public String getComplexCode() { return complexCode; }
    public void setComplexCode(String complexCode) { this.complexCode = complexCode; }
    public String getEmpNo() { return empNo; }
    public void setEmpNo(String empNo) { this.empNo = empNo; }
    public String getFlatNo() { return flatNo; }
    public void setFlatNo(String flatNo) { this.flatNo = flatNo; }
}
