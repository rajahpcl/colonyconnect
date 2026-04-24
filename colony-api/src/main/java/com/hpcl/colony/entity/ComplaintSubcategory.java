package com.hpcl.colony.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Maps to COLONY_COMPLAINT_SUBCATEGORY table.
 * ACTIVE column: 'A' = active, 'I' = inactive/deleted.
 */
@Entity
@Table(name = "COLONY_COMPLAINT_SUBCATEGORY")
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
}
