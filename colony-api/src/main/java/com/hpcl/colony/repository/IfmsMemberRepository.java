package com.hpcl.colony.repository;

import com.hpcl.colony.entity.IfmsMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface IfmsMemberRepository extends JpaRepository<IfmsMember, Long> {

    /** Find all active IFMS members */
    List<IfmsMember> findAllByStatusGreaterThan(Integer status);

    /** Check if an employee is an IFMS/BVG member */
    Optional<IfmsMember> findByBvgTeamMemberIdAndStatusGreaterThan(String bvgTeamMemberId, Integer status);

    /** Check if member ID already exists (active) */
    boolean existsByBvgTeamMemberIdAndStatusGreaterThan(String bvgTeamMemberId, Integer status);
}
