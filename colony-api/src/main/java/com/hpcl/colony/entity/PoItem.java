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
@Table(name = "COLONY_PO_MASTER", schema = "colonyconnect")
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

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getPoCategory() { return poCategory; }
    public void setPoCategory(String poCategory) { this.poCategory = poCategory; }
    public String getAgtmItem() { return agtmItem; }
    public void setAgtmItem(String agtmItem) { this.agtmItem = agtmItem; }
    public String getMaterialDescription() { return materialDescription; }
    public void setMaterialDescription(String materialDescription) { this.materialDescription = materialDescription; }
    public BigDecimal getContractRate() { return contractRate; }
    public void setContractRate(BigDecimal contractRate) { this.contractRate = contractRate; }
    public String getPoUnit() { return poUnit; }
    public void setPoUnit(String poUnit) { this.poUnit = poUnit; }
    public String getAccAssignmentCat() { return accAssignmentCat; }
    public void setAccAssignmentCat(String accAssignmentCat) { this.accAssignmentCat = accAssignmentCat; }
    public String getCostCenter() { return costCenter; }
    public void setCostCenter(String costCenter) { this.costCenter = costCenter; }
    public String getGlAccount() { return glAccount; }
    public void setGlAccount(String glAccount) { this.glAccount = glAccount; }
    public String getMaterial() { return material; }
    public void setMaterial(String material) { this.material = material; }
    public Integer getStatus() { return status; }
    public void setStatus(Integer status) { this.status = status; }
    public String getInsertedBy() { return insertedBy; }
    public void setInsertedBy(String insertedBy) { this.insertedBy = insertedBy; }
    public Timestamp getInsertedOn() { return insertedOn; }
    public void setInsertedOn(Timestamp insertedOn) { this.insertedOn = insertedOn; }
    public String getUpdatedBy() { return updatedBy; }
    public void setUpdatedBy(String updatedBy) { this.updatedBy = updatedBy; }
    public Timestamp getUpdatedOn() { return updatedOn; }
    public void setUpdatedOn(Timestamp updatedOn) { this.updatedOn = updatedOn; }
}
