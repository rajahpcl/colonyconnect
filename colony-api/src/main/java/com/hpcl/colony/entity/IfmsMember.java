package com.hpcl.colony.entity;

import jakarta.persistence.*;
import lombok.*;

import java.sql.Timestamp;

/**
 * Maps to COLONY_BVG_MASTER table (IFMS / BVG team members).
 * STATUS column: integer, > 0 = active, 0 = soft-deleted.
 */
@Entity
@Table(name = "COLONY_BVG_MASTER")
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
}
