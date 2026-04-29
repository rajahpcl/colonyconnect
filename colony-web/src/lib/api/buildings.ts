import { apiRequest } from './client';

export const listAll = async () => {
    return await apiRequest<any[]>('/api/v1/buildingmasters');
};
