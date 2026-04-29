package com.hpcl.colony.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "COLONY_PO_SUBMITTED", schema = "colonyconnect")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PoSubmitted {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Long id;

    @Column(name = "REQ_ID")
    private String reqId;

    @Column(name = "PO")
    private String po;

    @Column(name = "PO_NAME")
    private String poName;

    @Column(name = "GL_CODE")
    private String glCode;

    @Column(name = "PO_RATE")
    private String poRate;

    @Column(name = "QUANTITY")
    private String quantity;

    @Column(name = "TOTAL")
    private String total;

    @Column(name = "STATUS")
    private Integer status;

    @Column(name = "INSERTED_BY")
    private String insertedBy;

    @Column(name = "INSERTED_ON")
    private LocalDateTime insertedOn;
}
