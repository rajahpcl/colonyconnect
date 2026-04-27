package com.hpcl.colony.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Maps to COLONY_COMPLAINT_SUBCATEGORY table.
 * ACTIVE column: 'A' = active, 'I' = inactive/deleted.
 */
@Entity
@Table(name = "COLONY_COMPLAINT_SUBCATEGORY", schema = "colonyconnect")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ComplaintSubcategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Long id;

    @Column(name = "CATEGORY_ID", nullable = false)
    private Long categoryId;

    @Column(name = "NAME", nullable = false)
    private String name;

    /** 'A' = active, 'I' = inactive */
    @Column(name = "ACTIVE")
    private String active;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getActive() { return active; }
    public void setActive(String active) { this.active = active; }
}
