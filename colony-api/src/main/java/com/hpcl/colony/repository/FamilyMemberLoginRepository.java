package com.hpcl.colony.repository;

import com.hpcl.colony.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FamilyMemberLoginRepository extends JpaRepository<FamilyMemberLogin, Long> {
}
