import api from '@/lib/api';

export interface MasterItem {
    id: string;
    name: string;
    code: string | null;
    description: string | null;
    quantity: number;
    price: number;
    isActive: boolean;
    company: string | null;
    itemTypeId: string | null;
    itemGroupId: string | null;
    itemUnitId: string | null;
    itemAccountGroupId: string | null;
    itemGroup?: { name: string };
    itemType?: { name: string };
    itemUnit?: { name: string };
    itemAccountGroup?: { name: string };
}

export interface CreateMasterItemDto {
    name: string;
    description?: string;
    quantity: number;
    price: number;
    code?: string;
    isActive?: boolean;
    company?: string;
    itemTypeId?: string;
    itemGroupId?: string;
    itemUnitId?: string;
    itemAccountGroupId?: string;
}

export interface UpdateMasterItemDto {
    name?: string;
    description?: string;
    quantity?: number;
    price?: number;
    code?: string;
    isActive?: boolean;
    company?: string;
    itemTypeId?: string;
    itemGroupId?: string;
    itemUnitId?: string;
    itemAccountGroupId?: string;
}

export const masterItemsService = {
    findAll: async () => {
        const response = await api.get<MasterItem[]>('/master-items');
        return response.data;
    },
    create: async (data: CreateMasterItemDto) => {
        const response = await api.post<MasterItem>('/master-items', data);
        return response.data;
    },
    update: async (id: string, data: UpdateMasterItemDto) => {
        const response = await api.patch<MasterItem>(`/master-items/${id}`, data);
        return response.data;
    },
    remove: async (id: string) => {
        await api.delete(`/master-items/${id}`);
    },
};
