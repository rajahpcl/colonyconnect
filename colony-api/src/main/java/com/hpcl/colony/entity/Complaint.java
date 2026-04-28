package com.hpcl.colony.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "COLONY_REQUEST", schema = "COLONYCONNECT")
@Data
public class Complaint {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "request_seq")
    @SequenceGenerator(name = "request_seq", sequenceName = "COLONYCONNECT.REQUEST_SEQ", allocationSize = 1)
    @Column(name = "ID")
    private Long id;

    @Column(name = "EMP_NO")
    private String empNo;

    @Column(name = "SUBCATEGORY_ID")
    private Long subcategoryId;

    @Column(name = "COMP_DETAILS")
    private String compDetails;

    @Column(name = "SUBMIT_DATE")
    private LocalDateTime submitDate;

    @Column(name = "UPDATE_DATE")
    private LocalDateTime updateDate;

    @Column(name = "COMPLEX_CODE")
    private String complexCode;

    @Column(name = "VENDOR")
    private String vendor;

    @Column(name = "SUBMIT_BY")
    private String submitBy;

    @Column(name = "FLAT_NO")
    private String flatNo;

    @Column(name = "STATUS")
    private Long status;

    @Column(name = "UPLOAD_FILE")
    private String uploadFile;

    @Column(name = "UPLOAD_FILE1")
    private String uploadFile1;

    // Additional fields mapped from old JSP but not critical for creation
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

    @Column(name = "FEEDBACK")
    private String feedback;

    @PrePersist
    protected void onCreate() {
        if (submitDate == null) {
            submitDate = LocalDateTime.now();
        }
        if (updateDate == null) {
            updateDate = LocalDateTime.now();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updateDate = LocalDateTime.now();
    }
}
