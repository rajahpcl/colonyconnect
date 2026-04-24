package com.hpcl.colony.repository;

import com.hpcl.colony.entity.StatusCatalog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StatusCatalogRepository extends JpaRepository<StatusCatalog, Long> {

    List<StatusCatalog> findAllByOrderByIdAsc();
}
