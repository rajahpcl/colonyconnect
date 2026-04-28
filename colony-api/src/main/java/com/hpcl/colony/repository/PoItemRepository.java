package com.hpcl.colony.repository;

import com.hpcl.colony.entity.PoItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PoItemRepository extends JpaRepository<PoItem, Long> {

    /** Find max AGTM_ITEM for a given PO category */
    @Query("select max(cast(p.agtmItem as integer)) from PoItem p where p.poCategory = :poCategory and p.status > 0")
    Integer findMaxAgtmItemByPoCategory(@Param("poCategory") String poCategory);

    /** Find all active PO items ordered by AGTM_ITEM */
    @Query("select p from PoItem p where p.status > 0 order by p.agtmItem asc")
    List<PoItem> findAllActiveOrderByAgtmItemAsc();

    /** Find active PO items by category */
    @Query("select p from PoItem p where p.status > 0 and p.poCategory = :poCategory order by p.agtmItem asc")
    List<PoItem> findAllActiveByPoCategoryOrderByAgtmItemAsc(@Param("poCategory") String poCategory);

    /** Find distinct active PO categories */
    @Query("select distinct p.poCategory from PoItem p where p.status > 0 order by p.poCategory asc")
    List<String> findDistinctActivePoCategories();
}
