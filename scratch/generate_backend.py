import os

base_path = r"d:\HPCL\PH-Dev\ColonyManagement\revamp_colony\Intern\colonyconnect\colony-api\src\main\java\com\hpcl\colony"

repositories = {
    "VehicleInfoRepository": "VehicleInfo, Long",
    "ElectricRateRepository": "ElectricRate, Long",
    "ElectricReadingRepository": "ElectricReading, Long",
    "BuildingMasterRepository": "BuildingMaster, BuildingMasterId",
    "HousingMasterRepository": "HousingMaster, HousingMasterId",
    "InventoryMainRepository": "InventoryMain, Long",
    "PoSubmittedRepository": "PoSubmitted, Long",
    "ActionHistoryRepository": "ActionHistory, ActionHistoryId",
    "FamilyMemberLoginRepository": "FamilyMemberLogin, Long"
}

services = {
    "VehicleService": "VehicleInfo",
    "ElectricRateService": "ElectricRate",
    "ElectricReadingService": "ElectricReading",
    "BuildingMasterService": "BuildingMaster",
    "InventoryService": "InventoryMain",
    "PoSubmittedService": "PoSubmitted"
}

controllers = {
    "VehicleController": "VehicleService",
    "ElectricRateController": "ElectricRateService",
    "ElectricReadingController": "ElectricReadingService",
    "BuildingMasterController": "BuildingMasterService",
    "InventoryController": "InventoryService",
    "PoSubmittedController": "PoSubmittedService"
}

repo_template = """package com.hpcl.colony.repository;

import com.hpcl.colony.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface {name} extends JpaRepository<{entity_type}> {{
}}
"""

service_template = """package com.hpcl.colony.service;

import com.hpcl.colony.entity.*;
import com.hpcl.colony.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class {name} {{
    private final {entity}Repository repository;

    public List<{entity}> findAll() {{
        return repository.findAll();
    }}
}}
"""

controller_template = """package com.hpcl.colony.controller;

import com.hpcl.colony.entity.*;
import com.hpcl.colony.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/{path}")
@RequiredArgsConstructor
public class {name} {{
    private final {service} service;

    @GetMapping
    public List<?> getAll() {{
        return service.findAll();
    }}
}}
"""

for name, entity_type in repositories.items():
    file_path = os.path.join(base_path, "repository", f"{name}.java")
    if not os.path.exists(file_path):
        with open(file_path, "w") as f:
            f.write(repo_template.format(name=name, entity_type=entity_type))

for name, entity in services.items():
    file_path = os.path.join(base_path, "service", f"{name}.java")
    if not os.path.exists(file_path):
        with open(file_path, "w") as f:
            f.write(service_template.format(name=name, entity=entity))

for name, service in controllers.items():
    file_path = os.path.join(base_path, "controller", f"{name}.java")
    path = name.replace("Controller", "").lower() + "s"
    if path.endswith("ys"):
        path = path[:-2] + "ies"
    if not os.path.exists(file_path):
        with open(file_path, "w") as f:
            f.write(controller_template.format(name=name, service=service, path=path))

print("Backend scaffolding complete.")
