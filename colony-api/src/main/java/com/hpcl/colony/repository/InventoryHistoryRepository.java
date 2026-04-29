package com.hpcl.colony.repository;

import com.hpcl.colony.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface InventoryHistoryRepository extends JpaRepository<InventoryHistory, Long> {
    List<InventoryHistory> findByMainIdOrderByUpdateDateDesc(Long mainId);
}