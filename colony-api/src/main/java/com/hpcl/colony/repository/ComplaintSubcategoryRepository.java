package com.hpcl.colony.repository;

import com.hpcl.colony.entity.ComplaintSubcategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComplaintSubcategoryRepository extends JpaRepository<ComplaintSubcategory, Long> {

    /** Find all active subcategories */
    List<ComplaintSubcategory> findAllByActiveOrderByIdAsc(String active);

    /** Find active subcategories for a specific category */
    List<ComplaintSubcategory> findAllByCategoryIdAndActiveOrderByIdAsc(Long categoryId, String active);
}
