package com.hpcl.colony.service;

import com.hpcl.colony.dto.ElectricReadingDto;
import com.hpcl.colony.dto.ElectricReadingDto.BillCalculationResult;
import com.hpcl.colony.entity.*;
import com.hpcl.colony.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ElectricReadingService {
    private final ElectricReadingRepository repository;
    private final ElectricRateRepository rateRepository;
    private final HousingAllotmentRepository housingAllotmentRepository;

    public List<ElectricReading> findAll() {
        return repository.findAll();
    }

    public ElectricReading findById(Long id) {
        return repository.findById(id).orElseThrow(() -> new RuntimeException("ElectricReading not found: " + id));
    }

    public List<ElectricReading> findByMonth(LocalDateTime monthYear) {
        String searchMonth = String.format("%02d-%04d", monthYear.getMonthValue(), monthYear.getYear());
        return repository.findAll().stream()
            .filter(r -> r.getEnteredDate() != null)
            .filter(r -> {
                String rd = String.format("%02d-%Y", r.getEnteredDate().getMonthValue(), r.getEnteredDate().getYear());
                return rd.equals(searchMonth);
            })
            .collect(Collectors.toList());
    }

    @Transactional
    public ElectricReading save(ElectricReading reading) {
        reading.setUpdatedDate(LocalDateTime.now());
        return repository.save(reading);
    }

    public BillCalculationResult calculateBill(Double initReading, Double finalReading, LocalDateTime monthYear) {
        if (finalReading < initReading) {
            throw new RuntimeException("Final reading must be greater than initial reading");
        }

        double unitsConsumed = finalReading - initReading;

        // Get rates for the month
        String searchMonth = "01-" + String.format("%02d-%04d", monthYear.getMonthValue(), monthYear.getYear());
        List<ElectricRate> rates = rateRepository.findAll().stream()
            .filter(r -> r.getEnteredDate() != null)
            .filter(r -> {
                String rd = String.format("01-%02d-%04d", r.getEnteredDate().getMonthValue(), r.getEnteredDate().getYear());
                return rd.equals(searchMonth);
            })
            .collect(Collectors.toList());

        if (rates.isEmpty()) {
            throw new RuntimeException("No Electric Rate saved for this month");
        }

        // Map rates by tariff category
        Map<String, ElectricRate> rateMap = rates.stream()
            .collect(Collectors.toMap(ElectricRate::getTariffCategory, r -> r, (a, b) -> a));

        double energyCharge = 0, raCharge = 0, fixedCharge = 0, facCharge = 0, wheelingCharge = 0;
        String slabApplied = "";

        if (unitsConsumed <= 100 && rateMap.containsKey("0-100")) {
            ElectricRate r = rateMap.get("0-100");
            energyCharge = unitsConsumed * r.getEnergyCharge();
            raCharge = unitsConsumed * r.getRaCharge();
            fixedCharge = r.getFixedCharge();
            facCharge = unitsConsumed * r.getFacRate();
            wheelingCharge = unitsConsumed * r.getWheelingCharge();
            slabApplied = "0-100";
        } else if (unitsConsumed <= 300) {
            ElectricRate r100 = rateMap.get("0-100");
            ElectricRate r300 = rateMap.getOrDefault("101-300", r100);
            energyCharge = (100 * r100.getEnergyCharge()) + ((unitsConsumed - 100) * r300.getEnergyCharge());
            raCharge = (100 * r100.getRaCharge()) + ((unitsConsumed - 100) * r300.getRaCharge());
            fixedCharge = r300.getFixedCharge();
            facCharge = (100 * r100.getFacRate()) + ((unitsConsumed - 100) * r300.getFacRate());
            wheelingCharge = unitsConsumed * r100.getWheelingCharge();
            slabApplied = "101-300";
        } else if (unitsConsumed <= 500) {
            ElectricRate r100 = rateMap.get("0-100");
            ElectricRate r300 = rateMap.getOrDefault("101-300", r100);
            ElectricRate r500 = rateMap.getOrDefault("301-500", r300);
            energyCharge = (100 * r100.getEnergyCharge()) + (200 * r300.getEnergyCharge()) +
                          ((unitsConsumed - 300) * r500.getEnergyCharge());
            raCharge = (100 * r100.getRaCharge()) + (200 * r300.getRaCharge()) +
                      ((unitsConsumed - 300) * r500.getRaCharge());
            fixedCharge = r500.getFixedCharge();
            facCharge = (100 * r100.getFacRate()) + (200 * r300.getFacRate()) +
                       ((unitsConsumed - 300) * r500.getFacRate());
            wheelingCharge = unitsConsumed * r100.getWheelingCharge();
            slabApplied = "301-500";
        } else {
            ElectricRate r100 = rateMap.get("0-100");
            ElectricRate r300 = rateMap.getOrDefault("101-300", r100);
            ElectricRate r500 = rateMap.getOrDefault("301-500", r300);
            ElectricRate rAbove500 = rateMap.getOrDefault(">500", r500);
            energyCharge = (100 * r100.getEnergyCharge()) + (200 * r300.getEnergyCharge()) +
                          (200 * r500.getEnergyCharge()) + ((unitsConsumed - 500) * rAbove500.getEnergyCharge());
            raCharge = (100 * r100.getRaCharge()) + (200 * r300.getRaCharge()) +
                      (200 * r500.getRaCharge()) + ((unitsConsumed - 500) * rAbove500.getRaCharge());
            fixedCharge = rAbove500.getFixedCharge();
            facCharge = (100 * r100.getFacRate()) + (200 * r300.getFacRate()) +
                       (200 * r500.getFacRate()) + ((unitsConsumed - 500) * rAbove500.getFacRate());
            wheelingCharge = unitsConsumed * r100.getWheelingCharge();
            slabApplied = ">500";
        }

        // Round to 2 decimals
        energyCharge = Math.round(energyCharge * 100.0) / 100.0;
        raCharge = Math.round(raCharge * 100.0) / 100.0;
        fixedCharge = Math.round(fixedCharge * 100.0) / 100.0;
        facCharge = Math.round(facCharge / 100.0 * 100.0) / 100.0;
        wheelingCharge = Math.round(wheelingCharge * 100.0) / 100.0;

        double amountBeforeTax = energyCharge + raCharge + fixedCharge + facCharge + wheelingCharge;
        amountBeforeTax = Math.round(amountBeforeTax * 100.0) / 100.0;

        double govtDuty = Math.round((amountBeforeTax * 16.0 / 100.0) * 100.0) / 100.0;
        double mhTax = Math.round(unitsConsumed * 0.2604 * 100.0) / 100.0;

        double totalAmount = Math.round((amountBeforeTax + govtDuty + mhTax) * 100.0) / 100.0;

        return BillCalculationResult.builder()
            .unitsConsumed(unitsConsumed)
            .energyCharge(energyCharge)
            .raCharge(raCharge)
            .fixedCharge(fixedCharge)
            .facCharge(facCharge)
            .wheelingCharge(wheelingCharge)
            .amountBeforeTax(amountBeforeTax)
            .govtDuty(govtDuty)
            .mhTax(mhTax)
            .totalAmount(totalAmount)
            .slabApplied(slabApplied)
            .build();
    }

    public BillCalculationResult calculateBillDual(Double initReading, Double initReading1,
                                                    Double finalReading, Double finalReading1,
                                                    LocalDateTime monthYear) {
        double totalUnits = (finalReading - initReading) + (finalReading1 - initReading1);
        return calculateBill(0.0, totalUnits, monthYear);
    }

    @Transactional
    public void approveReadings(List<Long> ids, String approvedBy) {
        for (Long id : ids) {
            ElectricReading reading = findById(id);
            reading.setStatus("Approved");
            reading.setUpdatedBy(approvedBy);
            reading.setUpdatedDate(LocalDateTime.now());
            repository.save(reading);
        }
    }

    @Transactional
    public void delete(Long id) {
        repository.deleteById(id);
    }
}