'use client';

import { useEffect, useState } from 'react';
import { Transaction, transactionsService } from '@/services/transactions.service';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { AuthGuard } from '@/components/AuthGuard';
import { TransactionDialog } from '@/components/transactions/TransactionDialog';
import { ColumnDef } from "@tanstack/react-table";
import { TransactionDetailsDialog } from '@/components/transactions/TransactionDetailsDialog';
import { Eye, MoreHorizontal, Pencil, Trash } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function TransactionsPage() {
    const [data, setData] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<Transaction | undefined>(undefined);

    const fetchData = async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const items = await transactionsService.findAll();
            setData(items);
            if (selectedItem) {
                const updatedItem = items.find(i => i.id === selectedItem.id);
                if (updatedItem) {
                    setSelectedItem(updatedItem);
                }
            }
        } catch (error) {
            console.error('Failed to fetch transactions:', error);
        } finally {
            if (!silent) setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreate = () => {
        setSelectedItem(undefined);
        setIsDialogOpen(true);
    };

    const handleEdit = (item: Transaction) => {
        setSelectedItem(item);
        setIsDialogOpen(true);
    };

    const handleViewDetails = (item: Transaction) => {
        setSelectedItem(item);
        setIsDetailsOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this transaction? This will likely revert stock changes.')) {
            try {
                await transactionsService.remove(id);
                fetchData();
            } catch (error) {
                console.error('Failed to delete transaction:', error);
            }
        }
    };

    const columns: ColumnDef<Transaction>[] = [
        {
            accessorKey: "date",
            header: "Date",
            cell: ({ row }) => {
                return new Date(row.getValue("date")).toLocaleDateString();
            }
        },
        {
            accessorKey: "code",
            header: "Code",
            cell: ({ row }) => row.original.code || '-',
        },
        {
            accessorKey: "company",
            header: "Company",
            cell: ({ row }) => row.original.company || '-',
        },
        {
            accessorKey: "account",
            header: "Account",
            cell: ({ row }) => row.original.account || '-',
        },
        {
            accessorKey: "note",
            header: "Note",
            cell: ({ row }) => <span className="truncate max-w-[200px] block" title={row.original.note}>{row.original.note || '-'}</span>,
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const item = row.original;
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleViewDetails(item)}>
                                <Eye className="mr-2 h-4 w-4" /> View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(item)}>
                                <Pencil className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleDelete(item.id)} className="text-red-600">
                                <Trash className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];

    return (
        <AuthGuard>
            <div className="container mx-auto py-10">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">Transactions</h1>
                    <div className="space-x-4">
                        <Button onClick={handleCreate}>Add Transaction</Button>
                    </div>
                </div>
                {loading ? (
                    <div>Loading...</div>
                ) : (
                    <DataTable columns={columns} data={data} />
                )}
                <TransactionDialog
                    open={isDialogOpen}
                    onOpenChange={setIsDialogOpen}
                    item={selectedItem}
                    onSuccess={fetchData}
                />
                <TransactionDetailsDialog
                    open={isDetailsOpen}
                    onOpenChange={setIsDetailsOpen}
                    transaction={selectedItem}
                    onUpdate={() => fetchData(true)}
                />
            </div>
        </AuthGuard>
    );
}
