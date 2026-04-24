package com.hpcl.colony.repository;

import com.hpcl.colony.entity.ComplaintCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComplaintCategoryRepository extends JpaRepository<ComplaintCategory, Long> {

    /** Find all active categories */
    List<ComplaintCategory> findAllByActiveOrderByIdAsc(String active);
}
