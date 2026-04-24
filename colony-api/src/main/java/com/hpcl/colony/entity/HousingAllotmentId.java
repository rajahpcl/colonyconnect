package com.hpcl.colony.entity;

import java.io.Serializable;
import java.util.Objects;

/**
 * Composite key for housing_alloted table.
 */
public class HousingAllotmentId implements Serializable {

    private String complexCode;
    private String empNo;
    private String flatNo;

    public HousingAllotmentId() {}

    public HousingAllotmentId(String complexCode, String empNo, String flatNo) {
        this.complexCode = complexCode;
        this.empNo = empNo;
        this.flatNo = flatNo;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        HousingAllotmentId that = (HousingAllotmentId) o;
        return Objects.equals(complexCode, that.complexCode)
                && Objects.equals(empNo, that.empNo)
                && Objects.equals(flatNo, that.flatNo);
    }

    @Override
    public int hashCode() {
        return Objects.hash(complexCode, empNo, flatNo);
    }
}
