package com.hpcl.colony.repository;

import com.hpcl.colony.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface InventoryEntryRepository extends JpaRepository<InventoryEntry, Long> {
    List<InventoryEntry> findByMainId(Long mainId);
    List<InventoryEntry> findByMainIdOrderById(Long mainId);
}