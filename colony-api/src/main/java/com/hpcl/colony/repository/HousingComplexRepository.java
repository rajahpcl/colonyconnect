package com.hpcl.colony.repository;

import com.hpcl.colony.entity.HousingComplex;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HousingComplexRepository extends JpaRepository<HousingComplex, String> {

    /** Find complexes where the given empNo is in the admin list */
    List<HousingComplex> findByComplexAdminContaining(String empNo);
}
