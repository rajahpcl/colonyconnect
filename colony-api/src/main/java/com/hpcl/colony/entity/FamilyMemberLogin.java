package com.hpcl.colony.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "COLONY_FAMILY_MEMBER_LOGIN", schema = "colonyconnect")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FamilyMemberLogin {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Long id;

    @Column(name = "EMP_NO")
    private String empNo;

    @Column(name = "DEPENDENT_ID")
    private String dependentId;

    @Column(name = "DEPENDENT_NAME")
    private String dependentName;

    @Column(name = "STATUS")
    private Integer status;

    @Column(name = "EMAIL")
    private String email;

    @Column(name = "PHONE_NO")
    private String phoneNo;
}
