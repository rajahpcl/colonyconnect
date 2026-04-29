package com.hpcl.colony.entity;

import lombok.*;
import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class BuildingMasterId implements Serializable {
    private String colonyCode;
    private String building;
}
