package com.hpcl.colony.service;

import com.hpcl.colony.dto.ElectricRateDto;
import com.hpcl.colony.entity.*;
import com.hpcl.colony.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ElectricRateService {
    private final ElectricRateRepository repository;

    public List<ElectricRate> findAll() {
        return repository.findAll();
    }

    public ElectricRate findById(Long id) {
        return repository.findById(id).orElseThrow(() -> new RuntimeException("ElectricRate not found: " + id));
    }

    public List<ElectricRate> findByMonth(LocalDateTime monthYear) {
        return repository.findAll().stream()
            .filter(r -> r.getEnteredDate() != null &&
                        r.getEnteredDate().getYear() == monthYear.getYear() &&
                        r.getEnteredDate().getMonth() == monthYear.getMonth())
            .collect(Collectors.toList());
    }

    public boolean existsRatesForMonth(LocalDateTime monthYear) {
        String searchDate = "01-" + String.format("%02d-%04d", monthYear.getMonthValue(), monthYear.getYear());
        return repository.findAll().stream()
            .anyMatch(r -> r.getEnteredDate() != null &&
                String.format("%02d-%tY", 1, r.getEnteredDate())
                    .equals(searchDate.substring(0, 8) + String.format("%04d", r.getEnteredDate().getYear())));
    }

    @Transactional
    public ElectricRate save(ElectricRate rate) {
        rate.setUpdateDate(LocalDateTime.now());
        return repository.save(rate);
    }

    @Transactional
    public void saveSlabRates(ElectricRateDto.SlabRateDto[] slabs, String updateBy) {
        for (ElectricRateDto.SlabRateDto slab : slabs) {
            ElectricRate rate = ElectricRate.builder()
                .enteredDate(LocalDateTime.now().withDayOfMonth(1))
                .tariffCategory(slab.getTariffCategory())
                .fixedCharge(slab.getFixedCharge())
                .energyCharge(slab.getEnergyCharge())
                .wheelingCharge(slab.getWheelingCharge())
                .raCharge(slab.getRaCharge())
                .facRate(slab.getFacRate())
                .updateBy(updateBy)
                .updateDate(LocalDateTime.now())
                .build();
            repository.save(rate);
        }
    }

    @Transactional
    public void delete(Long id) {
        repository.deleteById(id);
    }
}
