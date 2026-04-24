package com.hpcl.colony.repository;

import com.hpcl.colony.entity.VendorMapping;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VendorMappingRepository extends JpaRepository<VendorMapping, Long> {

    /** Find all active mappings */
    List<VendorMapping> findAllByActiveOrderByIdDesc(String active);

    /** Find mappings for a specific complex and category */
    List<VendorMapping> findByComplexCodeAndCategoryIdAndActive(String complexCode, Long categoryId, String active);

    /** Find mappings for a specific complex, building, and category */
    List<VendorMapping> findByComplexCodeAndBuildingAndCategoryIdAndActive(
            String complexCode, String building, Long categoryId, String active);
}
