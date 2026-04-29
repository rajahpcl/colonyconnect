package com.hpcl.colony.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "COLONY_INVENTORY_MASTER", schema = "colonyconnect")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryMaster {
    @Id
    @Column(name = "ID")
    private Long id;

    @Column(name = "DESCRIPTION")
    private String description;

    @Column(name = "CATEGORY")
    private String category; // Electricals, Furnitures, Keys, Phone/Cable, Others
}