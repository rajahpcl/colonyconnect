package com.hpcl.colony.entity;

import lombok.*;
import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class ActionHistoryId implements Serializable {
    private String reqId;
    private LocalDateTime updateDate;
}
