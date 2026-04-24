package com.hpcl.colony.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Maps to the shared Oracle table workflow.empmaster.
 * This table is read-only from colony-api's perspective.
 */
@Entity
@Table(name = "empmaster", schema = "workflow")
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
}