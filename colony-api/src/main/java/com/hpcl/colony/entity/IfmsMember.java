package com.hpcl.colony.entity;

import jakarta.persistence.*;
import lombok.*;

import java.sql.Timestamp;

/**
 * Maps to COLONY_BVG_MASTER table (IFMS / BVG team members).
 * STATUS column: integer, > 0 = active, 0 = soft-deleted.
 */
@Entity
@Table(name = "COLONY_BVG_MASTER", schema = "colonyconnect")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IfmsMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Long id;

    @Column(name = "BVG_TEAM_MEMBER_ID", nullable = false)
    private String bvgTeamMemberId;

    @Column(name = "EMAIL")
    private String email;

    @Column(name = "PHONE_NO")
    private String phoneNo;

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
    public String getBvgTeamMemberId() { return bvgTeamMemberId; }
    public void setBvgTeamMemberId(String bvgTeamMemberId) { this.bvgTeamMemberId = bvgTeamMemberId; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPhoneNo() { return phoneNo; }
    public void setPhoneNo(String phoneNo) { this.phoneNo = phoneNo; }
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
