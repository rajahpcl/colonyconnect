package com.hpcl.colony.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Maps to COLONY_VENDOR_MSTR table.
 * ACTIVE column: null = active, '0' = soft-deleted.
 */
@Entity
@Table(name = "COLONY_VENDOR_MSTR", schema = "colonyconnect")
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

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }
    public String getActive() { return active; }
    public void setActive(String active) { this.active = active; }
}