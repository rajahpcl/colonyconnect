package com.hpcl.colony.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "COLONY_INVENTORY_HISTORY", schema = "colonyconnect")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryHistory {
    @Id
    @Column(name = "ID")
    private Long id;

    @Column(name = "UPDATE_DATE")
    private String updateDate;

    @Column(name = "UPDATE_BY")
    private String updateBy;

    @Column(name = "STATUS")
    private String status;

    @Column(name = "REMARKS")
    private String remarks;

    @Column(name = "MAIN_ID")
    private String mainId;
}
