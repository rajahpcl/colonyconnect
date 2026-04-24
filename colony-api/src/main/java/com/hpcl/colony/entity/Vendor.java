package com.hpcl.colony.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Maps to COLONY_VENDOR_MSTR table.
 * ACTIVE column: null = active, '0' = soft-deleted.
 */
@Entity
@Table(name = "COLONY_VENDOR_MSTR")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Vendor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Long id;

    @Column(name = "CODE", nullable = false)
    private String code;

    @Column(name = "NAME")
    private String name;

    @Column(name = "EMAIL")
    private String email;

    @Column(name = "PHONE")
    private String phone;

    @Column(name = "CATEGORY_ID")
    private Long categoryId;

    /** null = active, '0' = deleted */
    @Column(name = "ACTIVE")
    private String active;
}