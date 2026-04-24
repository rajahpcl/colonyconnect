package com.hpcl.colony.repository;

import com.hpcl.colony.entity.Vendor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VendorRepository extends JpaRepository<Vendor, Long> {

    /** Find all active vendors (ACTIVE is null = active) */
    List<Vendor> findAllByActiveIsNullOrderByNameAsc();

    /** Find a vendor by code */
    Optional<Vendor> findFirstByCodeAndActiveIsNull(String code);

    /** Find all vendor entries for a given code (one per category) */
    List<Vendor> findAllByCodeAndActiveIsNullOrderByCategoryIdAsc(String code);

    /** Find distinct vendor codes */
    List<Vendor> findAllByActiveIsNull();
}
