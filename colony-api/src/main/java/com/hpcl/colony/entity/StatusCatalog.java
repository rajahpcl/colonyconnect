package com.hpcl.colony.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Maps to COLONY_STATUS table.
 * Simple lookup table with only ID and NAME.
 */
@Entity
@Table(name = "COLONY_STATUS")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StatusCatalog {

    @Id
    @Column(name = "ID")
    private Long id;

    @Column(name = "NAME", nullable = false)
    private String name;
}
