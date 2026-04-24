package com.hpcl.colony.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.sql.Timestamp;

/**
 * Maps to COLONY_PO_MASTER table.
 * STATUS column: integer, > 0 = active, 0 = soft-deleted.
 */
@Entity
@Table(name = "COLONY_PO_MASTER")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PoItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Long id;

    @Column(name = "PO_CATEGORY")
    private String poCategory;

    @Column(name = "AGTM_ITEM")
    private String agtmItem;

    @Column(name = "MATERIAL_DESCRIPTION", length = 400)
    private String materialDescription;

    @Column(name = "CONTRACT_RATE")
    private BigDecimal contractRate;

    @Column(name = "PO_UNIT")
    private String poUnit;

    @Column(name = "ACC_ASSIGNMENT_CAT")
    private String accAssignmentCat;

    @Column(name = "COST_CENTER")
    private String costCenter;

    @Column(name = "GL_ACCOUNT")
    private String glAccount;

    @Column(name = "MATERIAL")
    private String material;

    /** Integer status: > 0 = active, 0 = deleted */
    @Column(name = "STATUS")
    private Integer status;

    @Column(name = "INSERTED_BY")
    private String insertedBy;

    @Column(name = "INSERTED_ON")
    private Timestamp insertedOn;

    @Column(name = "UPDATED_BY")
    private String updatedBy;

    @Column(name = "UPDATED_ON")
    private Timestamp updatedOn;
}
