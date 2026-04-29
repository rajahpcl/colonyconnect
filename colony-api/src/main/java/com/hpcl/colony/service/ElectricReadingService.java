package com.hpcl.colony.service;

import com.hpcl.colony.entity.*;
import com.hpcl.colony.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ElectricReadingService {
    private final ElectricReadingRepository repository;

    public List<ElectricReading> findAll() {
        return repository.findAll();
    }
}
