package com.hpcl.colony.service;

import com.hpcl.colony.entity.*;
import com.hpcl.colony.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ElectricRateService {
    private final ElectricRateRepository repository;

    public List<ElectricRate> findAll() {
        return repository.findAll();
    }
}
