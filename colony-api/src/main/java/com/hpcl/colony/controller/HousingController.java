package com.hpcl.colony.controller;

import com.hpcl.colony.entity.HousingComplex;
import com.hpcl.colony.repository.HousingComplexRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/housing")
public class HousingController {

    private final HousingComplexRepository complexRepository;

    public HousingController(HousingComplexRepository complexRepository) {
        this.complexRepository = complexRepository;
    }

    @GetMapping("/complexes")
    public List<HousingComplex> getAllComplexes() {
        return complexRepository.findAll();
    }
}
