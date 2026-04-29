package com.hpcl.colony.entity;

import lombok.*;
import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class HousingMasterId implements Serializable {
    private String complexCode;
    private String building;
    private String flatNo;
}
