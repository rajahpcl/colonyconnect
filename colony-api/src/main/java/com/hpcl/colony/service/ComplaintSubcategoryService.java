package com.hpcl.colony.service;

import com.hpcl.colony.entity.*;
import com.hpcl.colony.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ComplaintSubcategoryService {
    private final ComplaintSubcategoryRepository repository;

    public List<ComplaintSubcategory> findAll() {
        return repository.findAllByActiveOrderByIdAsc("A");
    }

    public ComplaintSubcategory findById(Long id) {
        return repository.findById(id)
            .orElseThrow(() -> new RuntimeException("Subcategory not found: " + id));
    }

    public List<ComplaintSubcategory> findByCategoryId(Long categoryId) {
        return repository.findAllByCategoryIdAndActiveOrderByIdAsc(categoryId, "A");
    }

    @Transactional
    public ComplaintSubcategory save(ComplaintSubcategory subcategory) {
        subcategory.setActive("A");
        return repository.save(subcategory);
    }

    @Transactional
    public void delete(Long id) {
        ComplaintSubcategory subcategory = findById(id);
        subcategory.setActive("I");
        repository.save(subcategory);
    }
}