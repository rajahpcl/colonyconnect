package com.hpcl.colony.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.io.Serializable;

@Entity
@Table(name = "COLONY_ACTION_HISTORY", schema = "colonyconnect")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@IdClass(ActionHistoryId.class)
public class ActionHistory {
    @Id
    @Column(name = "REQ_ID")
    private String reqId;

    @Id
    @Column(name = "UPDATE_DATE")
    private LocalDateTime updateDate;

    @Column(name = "STATUS")
    private Integer status;

    @Column(name = "UPDATE_BY")
    private String updateBy;

    @Column(name = "REMARK")
    private String remark;
}
