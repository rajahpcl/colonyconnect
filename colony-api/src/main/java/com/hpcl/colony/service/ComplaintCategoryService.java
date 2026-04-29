package com.hpcl.colony.service;

import com.hpcl.colony.entity.*;
import com.hpcl.colony.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ComplaintCategoryService {
    private final ComplaintCategoryRepository repository;

    public List<ComplaintCategory> findAll() {
        return repository.findAllByActiveOrderByIdAsc("A");
    }

    public ComplaintCategory findById(Long id) {
        return repository.findById(id)
            .orElseThrow(() -> new RuntimeException("Category not found: " + id));
    }

    @Transactional
    public ComplaintCategory save(ComplaintCategory category) {
        category.setActive("A");
        return repository.save(category);
    }

    @Transactional
    public void delete(Long id) {
        ComplaintCategory category = findById(id);
        category.setActive("I");
        repository.save(category);
    }
}