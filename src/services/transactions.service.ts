import api from '@/lib/api';

export interface Transaction {
    id: string;
    type?: 'IN' | 'OUT';
    date: string;
    masterItemId?: string;
    status?: string | null;
    code?: string | null;
    masterItem?: {
        name: string;
        code: string | null;
    };
    user?: { name: string };
    note?: string;
    account?: string;
    company?: string;
    items?: Item[];
}

export interface Item {
    id: string;
    quantity: number;
    note?: string;
    masterItem?: { name: string; code: string };
    itemUnit?: { name: string };
}

export interface CreateTransactionDto {
    masterItemId?: string;
    type?: 'IN' | 'OUT';
    code?: string;
    note?: string;
    account?: string;
    company?: string;
    items?: Item[];
}

export interface CreateItemDto {
    masterItemId: string;
    quantity: number;
    note?: string;
    itemUnitId?: string;
}

export const transactionsService = {
    findAll: async () => {
        const response = await api.get<Transaction[]>('/transactions');
        return response.data;
    },
    create: async (data: CreateTransactionDto) => {
        const response = await api.post<Transaction>('/transactions', data);
        return response.data;
    },
    update: async (id: string, data: CreateTransactionDto) => {
        const response = await api.patch<Transaction>(`/transactions/${id}`, data);
        return response.data;
    },
    remove: async (id: string) => {
        await api.delete(`/transactions/${id}`);
    },
    addItem: async (transactionId: string, data: CreateItemDto) => {
        const response = await api.post<Item>(`/transactions/${transactionId}/items`, data);
        return response.data;
    },
    updateItem: async (transactionId: string, itemId: string, data: CreateItemDto) => {
        const response = await api.patch<Item>(`/transactions/${transactionId}/items/${itemId}`, data);
        return response.data;
    },
    removeItem: async (transactionId: string, itemId: string) => {
        await api.delete(`/transactions/${transactionId}/items/${itemId}`);
    },
};
