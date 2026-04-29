import os

base_path = r"d:\HPCL\PH-Dev\ColonyManagement\revamp_colony\Intern\colonyconnect\colony-web\src\lib\api"

clients = {
    "vehicles.ts": "vehicles",
    "electricRates.ts": "electricrates",
    "electricReadings.ts": "electricreadings",
    "buildings.ts": "buildingmasters",
    "housing.ts": "housing",
    "poSubmitted.ts": "posubmitteds"
}

api_template = """import { apiRequest } from './client';

export const listAll = async () => {
    return await apiRequest<any[]>('/api/v1/%s');
};
"""

for name, path in clients.items():
    file_path = os.path.join(base_path, name)
    # Rewrite the ones generated earlier
    if "vehicles.ts" != name: # vehicle has createVehicle, getVehicle already? wait, did I overwrite vehicles.ts earlier?
        with open(file_path, "w") as f:
            f.write(api_template % path)
