package com.hpcl.colony.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Maps to the shared Oracle table workflow.empmaster.
 * This table is read-only from colony-api's perspective.
 */
@Entity
@Table(name = "empmaster", schema = "colonyconnect")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @Column(name = "EMP_NO")
    private String empNo;

    @Column(name = "EMP_NAME")
    private String name;

    @Column(name = "GRADE")
    private String grade;

    @Column(name = "EMP_DESIGNATION")
    private String designation;

    @Column(name = "BUDESC")
    private String buDesc;

    @Column(name = "STATUSCD")
    private String statusCd;

    @Column(name = "EMAIL")
    private String email;

    @Column(name = "EMP_URL")
    private String empUrl;

    // --- Transient fields resolved at login time, not from this table ---

    @Transient
    private String role;

    @Transient
    private String complexCode;

    @Transient
    private Boolean isActive;

    @Transient
    private String passwordHash;

    public String getEmpNo() { return empNo; }
    public void setEmpNo(String empNo) { this.empNo = empNo; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getGrade() { return grade; }
    public void setGrade(String grade) { this.grade = grade; }
    public String getDesignation() { return designation; }
    public void setDesignation(String designation) { this.designation = designation; }
    public String getBuDesc() { return buDesc; }
    public void setBuDesc(String buDesc) { this.buDesc = buDesc; }
    public String getStatusCd() { return statusCd; }
    public void setStatusCd(String statusCd) { this.statusCd = statusCd; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getEmpUrl() { return empUrl; }
    public void setEmpUrl(String empUrl) { this.empUrl = empUrl; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public String getComplexCode() { return complexCode; }
    public void setComplexCode(String complexCode) { this.complexCode = complexCode; }
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
}