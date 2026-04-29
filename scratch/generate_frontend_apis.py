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

api_template = """import api from './client';

export const listAll = async () => {{
    const response = await api.get('/{path}');
    return response.data;
}};
"""

for name, path in clients.items():
    file_path = os.path.join(base_path, name)
    if not os.path.exists(file_path):
        with open(file_path, "w") as f:
            f.write(api_template.format(path=path))

print("Frontend API clients created.")
