package com.hpcl.colony.service;

import com.hpcl.colony.entity.*;
import com.hpcl.colony.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class VendorService {
    private final VendorRepository repository;

    public List<Vendor> findAll() {
        return repository.findAllByActiveIsNullOrderByNameAsc();
    }

    public Vendor findById(Long id) {
        return repository.findById(id)
            .orElseThrow(() -> new RuntimeException("Vendor not found: " + id));
    }

    public Vendor findByCode(String code) {
        return repository.findFirstByCodeAndActiveIsNull(code)
            .orElseThrow(() -> new RuntimeException("Vendor not found: " + code));
    }

    public List<Vendor> findByCodeAll(String code) {
        return repository.findAllByCodeAndActiveIsNullOrderByCategoryIdAsc(code);
    }

    @Transactional
    public Vendor save(Vendor vendor) {
        return repository.save(vendor);
    }

    @Transactional
    public void delete(Long id) {
        Vendor vendor = findById(id);
        vendor.setActive("0"); // Soft delete
        repository.save(vendor);
    }
}