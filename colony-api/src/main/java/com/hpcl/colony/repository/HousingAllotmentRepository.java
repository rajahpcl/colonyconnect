package com.hpcl.colony.repository;

import com.hpcl.colony.entity.HousingAllotment;
import com.hpcl.colony.entity.HousingAllotmentId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HousingAllotmentRepository extends JpaRepository<HousingAllotment, HousingAllotmentId> {

    List<HousingAllotment> findByComplexCode(String complexCode);

    List<HousingAllotment> findByEmpNo(String empNo);
}
