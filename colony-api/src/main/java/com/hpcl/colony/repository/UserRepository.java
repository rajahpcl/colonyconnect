package com.hpcl.colony.repository;

import com.hpcl.colony.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {

    Optional<User> findByEmpNo(String empNo);

    boolean existsByEmpNo(String empNo);
}