import api from '@/lib/api';

export interface ItemType {
    id: string;
    name: string;
    description: string | null;
}

export interface ItemGroup {
    id: string;
    name: string;
    description: string | null;
    itemTypeId: string;
}

export interface ItemUnit {
    id: string;
    name: string;
    description: string | null;
}

export interface ItemAccountGroup {
    id: string;
    name: string;
    description: string | null;
}

export const referenceService = {
    getItemTypes: async () => {
        const response = await api.get<ItemType[]>('/item-types');
        return response.data;
    },
    getItemGroups: async () => {
        const response = await api.get<ItemGroup[]>('/item-groups');
        return response.data;
    },
    getItemUnits: async () => {
        const response = await api.get<ItemUnit[]>('/item-units');
        return response.data;
    },
    getItemAccountGroups: async () => {
        const response = await api.get<ItemAccountGroup[]>('/item-account-groups');
        return response.data;
    },
};
