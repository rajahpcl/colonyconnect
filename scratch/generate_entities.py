import os

package_path = r"d:\HPCL\PH-Dev\ColonyManagement\revamp_colony\Intern\colonyconnect\colony-api\src\main\java\com\hpcl\colony\entity"
package_name = "com.hpcl.colony.entity"

entities = {
    "VehicleInfo": """package {package_name};

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "COLONY_VEHICLEINFO", schema = "colonyconnect")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VehicleInfo {{
    @Id
    @Column(name = "ID")
    private Long id;

    @Column(name = "EMP_NO")
    private String empNo;

    @Column(name = "MAKE")
    private String make;

    @Column(name = "MODEL")
    private String model;

    @Column(name = "REGISTRAION_NO") // Keeping typo for legacy compatibility
    private String registrationNo;

    @Column(name = "VEHICLE_TYPE")
    private String vehicleType;

    @Column(name = "COLOR")
    private String color;

    @Column(name = "FLAG")
    private String flag;

    @Column(name = "UPDATE_DATE")
    private LocalDateTime updateDate;
}}
""",
    "ElectricRate": """package {package_name};

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "COLONY_ELECTRIC_RATE", schema = "colonyconnect")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ElectricRate {{
    @Id
    @Column(name = "ID")
    private Long id;

    @Column(name = "ENTERD_DATE")
    private LocalDateTime enteredDate;

    @Column(name = "TARRIF_CATEGORY")
    private String tariffCategory;

    @Column(name = "FIXED_CHARGE")
    private Double fixedCharge;

    @Column(name = "ENERGY_CHARGE")
    private Double energyCharge;

    @Column(name = "WHEELING_CHARGE")
    private Double wheelingCharge;

    @Column(name = "RA_CHARGE")
    private Double raCharge;

    @Column(name = "FAC_RATE")
    private Double facRate;

    @Column(name = "UPDATE_BY")
    private String updateBy;

    @Column(name = "UPDATE_DATE")
    private LocalDateTime updateDate;
}}
""",
    "ElectricReading": """package {package_name};

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "COLONY_ELECTRIC_READING", schema = "colonyconnect")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ElectricReading {{
    @Id
    @Column(name = "ID")
    private Long id;

    @Column(name = "ENTERD_DATE")
    private LocalDateTime enteredDate;

    @Column(name = "INIT_READING")
    private Double initReading;

    @Column(name = "FINAL_READING")
    private Double finalReading;

    @Column(name = "FLAT_NO")
    private String flatNo;

    @Column(name = "EMP_NO")
    private String empNo;

    @Column(name = "UPDATED_BY")
    private String updatedBy;

    @Column(name = "UPDATED_DATE")
    private LocalDateTime updatedDate;

    @Column(name = "TOTAL_AMOUNT")
    private String totalAmount;

    @Column(name = "STATUS")
    private String status;
}}
""",
    "BuildingMaster": """package {package_name};

import jakarta.persistence.*;
import lombok.*;
import java.io.Serializable;

@Entity
@Table(name = "COLONY_BUILDING_MSTR", schema = "colonyconnect")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@IdClass(BuildingMasterId.class)
public class BuildingMaster {{
    @Id
    @Column(name = "COLONY_CODE")
    private String colonyCode;

    @Id
    @Column(name = "BUILDING")
    private String building;

    @Column(name = "ADMIN")
    private String admin;

    @Column(name = "ESCALATION")
    private String escalation;

    @Column(name = "VENDOR_CODE")
    private String vendorCode;
}}
""",
    "BuildingMasterId": """package {package_name};

import lombok.*;
import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class BuildingMasterId implements Serializable {{
    private String colonyCode;
    private String building;
}}
""",
    "HousingMaster": """package {package_name};

import jakarta.persistence.*;
import lombok.*;
import java.io.Serializable;

@Entity
@Table(name = "HOUSING_MASTER", schema = "colonyconnect")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@IdClass(HousingMasterId.class)
public class HousingMaster {{
    @Id
    @Column(name = "COMPLEX_CODE")
    private String complexCode;

    @Id
    @Column(name = "BUILDING")
    private String building;

    @Id
    @Column(name = "FLAT_NO")
    private String flatNo;

    @Column(name = "AREA")
    private Double area;

    @Column(name = "BATHROOM_NO")
    private Integer bathroomNo;

    @Column(name = "MD_FACING")
    private String mdFacing;

    @Column(name = "BEDROOM_NO")
    private Integer bedroomNo;

    @Column(name = "FLOOR")
    private String floor;
}}
""",
    "HousingMasterId": """package {package_name};

import lombok.*;
import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class HousingMasterId implements Serializable {{
    private String complexCode;
    private String building;
    private String flatNo;
}}
""",
    "InventoryMain": """package {package_name};

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "COLONY_INVENTORY_MAIN", schema = "colonyconnect")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryMain {{
    @Id
    @Column(name = "ID")
    private Long id;

    @Column(name = "EMP_NO")
    private String empNo;

    @Column(name = "CONTACT_NO")
    private String contactNo;

    @Column(name = "COMPLEX_CODE")
    private String complexCode;

    @Column(name = "FLAT_NO")
    private String flatNo;

    @Column(name = "INVENTORY_TAKEN_ON")
    private LocalDateTime inventoryTakenOn;

    @Column(name = "ELECTRICITY_READING")
    private String electricityReading;

    @Column(name = "REASON")
    private String reason;

    @Column(name = "STATUS")
    private String status;

    @Column(name = "UPDATE_BY")
    private String updateBy;

    @Column(name = "UPDATE_DATE")
    private LocalDateTime updateDate;
}}
""",
    "InventoryEntry": """package {package_name};

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "COLONY_INVENTORY_ENTRY", schema = "colonyconnect")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryEntry {{
    @Id
    @Column(name = "ID")
    private Long id;

    @Column(name = "MASTER_ID")
    private String masterId;

    @Column(name = "HANDING_QTY")
    private String handingQty;

    @Column(name = "TAKING_QTY")
    private String takingQty;

    @Column(name = "REMARKS")
    private String remarks;

    @Column(name = "MAIN_ID")
    private String mainId;
}}
""",
    "InventoryHistory": """package {package_name};

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "COLONY_INVENTORY_HISTORY", schema = "colonyconnect")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryHistory {{
    @Id
    @Column(name = "ID")
    private Long id;

    @Column(name = "UPDATE_DATE")
    private String updateDate;

    @Column(name = "UPDATE_BY")
    private String updateBy;

    @Column(name = "STATUS")
    private String status;

    @Column(name = "REMARKS")
    private String remarks;

    @Column(name = "MAIN_ID")
    private String mainId;
}}
""",
    "PoSubmitted": """package {package_name};

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "COLONY_PO_SUBMITTED", schema = "colonyconnect")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PoSubmitted {{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Long id;

    @Column(name = "REQ_ID")
    private String reqId;

    @Column(name = "PO")
    private String po;

    @Column(name = "PO_NAME")
    private String poName;

    @Column(name = "GL_CODE")
    private String glCode;

    @Column(name = "PO_RATE")
    private String poRate;

    @Column(name = "QUANTITY")
    private String quantity;

    @Column(name = "TOTAL")
    private String total;

    @Column(name = "STATUS")
    private Integer status;

    @Column(name = "INSERTED_BY")
    private String insertedBy;

    @Column(name = "INSERTED_ON")
    private LocalDateTime insertedOn;
}}
""",
    "ActionHistory": """package {package_name};

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.io.Serializable;

@Entity
@Table(name = "COLONY_ACTION_HISTORY", schema = "colonyconnect")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@IdClass(ActionHistoryId.class)
public class ActionHistory {{
    @Id
    @Column(name = "REQ_ID")
    private String reqId;

    @Id
    @Column(name = "UPDATE_DATE")
    private LocalDateTime updateDate;

    @Column(name = "STATUS")
    private Integer status;

    @Column(name = "UPDATE_BY")
    private String updateBy;

    @Column(name = "REMARK")
    private String remark;
}}
""",
    "ActionHistoryId": """package {package_name};

import lombok.*;
import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class ActionHistoryId implements Serializable {{
    private String reqId;
    private LocalDateTime updateDate;
}}
""",
    "FamilyMemberLogin": """package {package_name};

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "COLONY_FAMILY_MEMBER_LOGIN", schema = "colonyconnect")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FamilyMemberLogin {{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Long id;

    @Column(name = "EMP_NO")
    private String empNo;

    @Column(name = "DEPENDENT_ID")
    private String dependentId;

    @Column(name = "DEPENDENT_NAME")
    private String dependentName;

    @Column(name = "STATUS")
    private Integer status;

    @Column(name = "EMAIL")
    private String email;

    @Column(name = "PHONE_NO")
    private String phoneNo;
}}
"""
}

for entity_name, content in entities.items():
    file_path = os.path.join(package_path, f"{entity_name}.java")
    if not os.path.exists(file_path):
        with open(file_path, "w") as f:
            f.write(content.format(package_name=package_name))
        print(f"Created {entity_name}.java")
    else:
        print(f"Skipped {entity_name}.java (already exists)")
