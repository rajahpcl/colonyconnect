package com.hpcl.colony.controller;

import com.hpcl.colony.entity.*;
import com.hpcl.colony.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/buildingmasters")
@RequiredArgsConstructor
public class BuildingMasterController {
    private final BuildingMasterService service;

    @GetMapping
    public List<?> getAll() {
        return service.findAll();
    }
}
