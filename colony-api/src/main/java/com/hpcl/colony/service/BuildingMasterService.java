package com.hpcl.colony.service;

import com.hpcl.colony.entity.*;
import com.hpcl.colony.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BuildingMasterService {
    private final BuildingMasterRepository repository;

    public List<BuildingMaster> findAll() {
        return repository.findAll();
    }

    public BuildingMaster findById(String colonyCode, String building) {
        return repository.findById(new BuildingMasterId(colonyCode, building))
            .orElseThrow(() -> new RuntimeException("BuildingMaster not found"));
    }

    public List<BuildingMaster> findByColonyCode(String colonyCode) {
        return repository.findAll().stream()
            .filter(b -> colonyCode.equals(b.getColonyCode()))
            .toList();
    }

    @Transactional
    public BuildingMaster save(BuildingMaster building) {
        return repository.save(building);
    }

    @Transactional
    public void delete(String colonyCode, String building) {
        repository.deleteById(new BuildingMasterId(colonyCode, building));
    }
}