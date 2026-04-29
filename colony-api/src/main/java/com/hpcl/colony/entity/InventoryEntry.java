package com.hpcl.colony.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "COLONY_INVENTORY_ENTRY", schema = "colonyconnect")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryEntry {
    @Id
    @Column(name = "ID")
    private Long id;

    @Column(name = "MASTER_ID")
    private Long masterId;

    @Column(name = "HANDING_QTY")
    private String handingQty;

    @Column(name = "TAKING_QTY")
    private String takingQty;

    @Column(name = "REMARKS")
    private String remarks;

    @Column(name = "MAIN_ID")
    private Long mainId;
}