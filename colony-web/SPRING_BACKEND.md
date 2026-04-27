# Spring Backend Implementation Guide

## Controllers & Endpoints

### 1. ElectricReadingController

```java
@RestController
@RequestMapping("/api/v1/admin")
@CrossOrigin
public class ElectricReadingController {
    
    @Autowired
    private ElectricReadingService service;
    
    // GET /api/v1/admin/complex-list
    @GetMapping("/complex-list")
    public ResponseEntity<List<Complex>> getComplexList() {
        // Query: SELECT COMPLEX_CODE, COMPLEX_NAME FROM housing_complex_list
        List<Complex> complexes = complexRepository.findAll();
        return ResponseEntity.ok(complexes);
    }
    
    // GET /api/v1/admin/buildings?complexCode={code}
    @GetMapping("/buildings")
    public ResponseEntity<List<Building>> getBuildings(@RequestParam String complexCode) {
        // Query cascading: SELECT BUILDING_ID, BUILDING_NAME FROM housing_building 
        // WHERE COMPLEX_CODE = ?
        List<Building> buildings = buildingRepository.findByComplexCode(complexCode);
        return ResponseEntity.ok(buildings);
    }
    
    // GET /api/v1/admin/flats?complexCode={code}&building={building}
    @GetMapping("/flats")
    public ResponseEntity<List<Flat>> getFlats(
        @RequestParam String complexCode, 
        @RequestParam String building) {
        // Query: SELECT FLAT_NO FROM housing_flats 
        // WHERE COMPLEX_CODE = ? AND BUILDING = ?
        List<Flat> flats = flatRepository.findByComplexCodeAndBuilding(complexCode, building);
        return ResponseEntity.ok(flats);
    }
    
    // GET /api/v1/admin/employee?flatNo={flatNo}&complexCode={code}
    @GetMapping("/employee")
    public ResponseEntity<Employee> getEmployeeByFlat(
        @RequestParam String flatNo,
        @RequestParam String complexCode) {
        // Query: SELECT EMP_NO, EMP_NAME FROM workflow.empmaster em 
        // JOIN housing_alloted ha ON em.EMP_NO = ha.EMP_NO
        // WHERE ha.FLAT_NO = ? AND ha.COMPLEX_CODE = ?
        Employee emp = employeeRepository.findByFlatAndComplex(flatNo, complexCode);
        return ResponseEntity.ok(emp);
    }
    
    // POST /api/v1/admin/electric-reading
    @PostMapping("/electric-reading")
    public ResponseEntity<ElectricReading> submitReading(@RequestBody ElectricReadingRequest req) {
        // Insert into ELECTRIC_READINGS (FLAT_NO, READING, READING_DATE, RATE_ID, AMOUNT)
        // Calculate amount = reading * rate
        ElectricReading reading = new ElectricReading();
        reading.setFlatNo(req.getFlatNo());
        reading.setReading(req.getReading());
        reading.setReadingDate(req.getReadingDate());
        reading.setRateId(req.getRateId());
        reading.setAmount(req.getReading() * getRateAmount(req.getRateId()));
        
        ElectricReading saved = readingRepository.save(reading);
        return ResponseEntity.created(null).body(saved);
    }
    
    // GET /api/v1/admin/electric-readings
    @GetMapping("/electric-readings")
    public ResponseEntity<List<ElectricReading>> listReadings(
        @RequestParam(required = false) String flatNo,
        @RequestParam(required = false) String month) {
        // Query: SELECT * FROM ELECTRIC_READINGS 
        // WHERE (FLAT_NO = ? OR ? IS NULL) AND (MONTH = ? OR ? IS NULL)
        List<ElectricReading> readings = readingRepository.findByFilters(flatNo, month);
        return ResponseEntity.ok(readings);
    }
}
```

### 2. IFMSMasterController

```java
@RestController
@RequestMapping("/api/v1/admin/ifms-master")
@CrossOrigin
public class IFMSMasterController {
    
    @Autowired
    private IFMSMasterRepository repository;
    
    // GET /api/v1/admin/ifms-master
    @GetMapping
    public ResponseEntity<List<IFMSMaster>> list() {
        // Query: SELECT * FROM COLONY_BVG_MASTER WHERE STATUS > 0
        List<IFMSMaster> masters = repository.findByStatusGreaterThan(0);
        return ResponseEntity.ok(masters);
    }
    
    // POST /api/v1/admin/ifms-master
    @PostMapping
    public ResponseEntity<IFMSMaster> create(@RequestBody IFMSMasterRequest req) {
        // Validation: Check if BVG_TEAM_MEMBER_ID already exists
        if (repository.existsByBvgTeamMemberId(req.getBvgTeamMemberId())) {
            return ResponseEntity.badRequest()
                .body(null); // or throw custom exception
        }
        
        // Insert: INSERT INTO COLONY_BVG_MASTER 
        // (BVG_TEAM_MEMBER_ID, EMAIL, PHONE_NO, STATUS, INSERTED_BY, INSERTED_ON)
        // VALUES (?, ?, ?, 10, ?, CURRENT_TIMESTAMP)
        IFMSMaster master = new IFMSMaster();
        master.setBvgTeamMemberId(req.getBvgTeamMemberId());
        master.setEmail(req.getEmail());
        master.setPhoneNo(req.getPhoneNo());
        master.setStatus(10);
        master.setInsertedBy(getCurrentUser());
        
        IFMSMaster saved = repository.save(master);
        return ResponseEntity.created(null).body(saved);
    }
    
    // DELETE /api/v1/admin/ifms-master/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        // Soft delete: UPDATE COLONY_BVG_MASTER SET STATUS = 0 WHERE ID = ?
        IFMSMaster master = repository.findById(id).orElseThrow();
        master.setStatus(0);
        master.setUpdatedBy(getCurrentUser());
        master.setUpdatedOn(LocalDateTime.now());
        repository.save(master);
        return ResponseEntity.noContent().build();
    }
}
```

### 3. FlatAssignmentController

```java
@RestController
@RequestMapping("/api/v1/admin")
@CrossOrigin
public class FlatAssignmentController {
    
    @Autowired
    private FlatAssignmentRepository repository;
    @Autowired
    private EmployeeRepository employeeRepository;
    @Autowired
    private FlatRepository flatRepository;
    
    // GET /api/v1/admin/flat-assignments
    @GetMapping("/flat-assignments")
    public ResponseEntity<List<FlatAssignment>> list(
        @RequestParam(required = false) String complexCode) {
        // Query: SELECT * FROM housing_alloted 
        // WHERE COMPLEX_CODE = ? OR ? IS NULL
        List<FlatAssignment> assignments = 
            complexCode != null 
                ? repository.findByComplexCode(complexCode)
                : repository.findAll();
        return ResponseEntity.ok(assignments);
    }
    
    // GET /api/v1/admin/employees?complexCode={code}
    @GetMapping("/employees")
    public ResponseEntity<List<Employee>> getEmployeesByComplex(
        @RequestParam String complexCode) {
        // Query: SELECT DISTINCT em.EMP_NO, em.EMP_NAME FROM workflow.empmaster em
        // LEFT JOIN housing_alloted ha ON em.EMP_NO = ha.EMP_NO AND ha.COMPLEX_CODE = ?
        List<Employee> employees = employeeRepository.findByComplex(complexCode);
        return ResponseEntity.ok(employees);
    }
    
    // GET /api/v1/admin/available-flats?complexCode={code}
    @GetMapping("/available-flats")
    public ResponseEntity<List<Flat>> getAvailableFlats(
        @RequestParam String complexCode) {
        // Query: SELECT * FROM housing_flats hf
        // WHERE hf.COMPLEX_CODE = ? AND hf.FLAT_NO NOT IN (
        //   SELECT FLAT_NO FROM housing_alloted WHERE COMPLEX_CODE = ?
        // )
        List<Flat> flats = flatRepository.findAvailableByComplex(complexCode);
        return ResponseEntity.ok(flats);
    }
    
    // POST /api/v1/admin/flat-assignments
    @PostMapping("/flat-assignments")
    public ResponseEntity<FlatAssignment> assignFlat(@RequestBody FlatAssignmentRequest req) {
        // Insert: INSERT INTO housing_alloted 
        // (COMPLEX_CODE, EMP_NO, FLAT_NO) VALUES (?, ?, ?)
        FlatAssignment assignment = new FlatAssignment();
        assignment.setComplexCode(req.getComplexCode());
        assignment.setEmpNo(req.getEmpNo());
        assignment.setFlatNo(req.getFlatNo());
        assignment.setAllotmentDate(LocalDate.now());
        
        FlatAssignment saved = repository.save(assignment);
        return ResponseEntity.created(null).body(saved);
    }
    
    // PATCH /api/v1/admin/flat-assignments/{id}
    @PatchMapping("/flat-assignments/{id}")
    public ResponseEntity<FlatAssignment> update(
        @PathVariable Long id,
        @RequestBody FlatAssignmentRequest req) {
        // Update: UPDATE housing_alloted 
        // SET COMPLEX_CODE = ?, EMP_NO = ?, FLAT_NO = ?
        // WHERE ID = ?
        FlatAssignment assignment = repository.findById(id).orElseThrow();
        assignment.setComplexCode(req.getComplexCode());
        assignment.setEmpNo(req.getEmpNo());
        assignment.setFlatNo(req.getFlatNo());
        
        FlatAssignment updated = repository.save(assignment);
        return ResponseEntity.ok(updated);
    }
}
```

## Database Entities

### ElectricReading
- id, flatNo, reading, readingDate, rateId, amount

### IFMSMaster
- id, bvgTeamMemberId (unique), email, phoneNo, status, insertedBy, insertedOn, updatedBy, updatedOn

### FlatAssignment
- id, complexCode, empNo, flatNo, allotmentDate

## Repositories

```java
public interface ElectricReadingRepository extends JpaRepository<ElectricReading, Long> {
    List<ElectricReading> findByFlatNo(String flatNo);
    List<ElectricReading> findByFilters(String flatNo, String month);
}

public interface IFMSMasterRepository extends JpaRepository<IFMSMaster, Long> {
    List<IFMSMaster> findByStatusGreaterThan(int status);
    boolean existsByBvgTeamMemberId(String id);
}

public interface FlatAssignmentRepository extends JpaRepository<FlatAssignment, Long> {
    List<FlatAssignment> findByComplexCode(String complexCode);
    Optional<FlatAssignment> findByFlatNoAndComplexCode(String flatNo, String complexCode);
}
```

## Key Points

1. **Cascading Selectors:** Load data progressively based on parent selections
2. **Soft Deletes:** Use status field instead of actual deletion
3. **Validation:** Check duplicates before insert (BVG_TEAM_MEMBER_ID uniqueness)
4. **Auto Fields:** insertedBy, insertedOn, updatedBy, updatedOn from session/request
5. **Calculations:** Electric amount = reading * rate (from rate master)
6. **Filtering:** Support optional query parameters for list endpoints
