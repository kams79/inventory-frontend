'use client';

import { useEffect, useState } from 'react';
import { MasterItem, masterItemsService } from '@/services/master-items.service';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { AuthGuard } from '@/components/AuthGuard';
import { MasterItemDialog } from '@/components/master-items/MasterItemDialog';
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Trash } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function MasterItemsPage() {
    const [data, setData] = useState<MasterItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<MasterItem | undefined>(undefined);

    const fetchData = async () => {
        setLoading(true);
        try {
            const items = await masterItemsService.findAll();
            setData(items);
        } catch (error) {
            console.error('Failed to fetch items:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreate = () => {
        setSelectedItem(undefined);
        setIsDialogOpen(true);
    };

    const handleEdit = (item: MasterItem) => {
        setSelectedItem(item);
        setIsDialogOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this item?')) {
            try {
                await masterItemsService.remove(id);
                fetchData();
            } catch (error) {
                console.error('Failed to delete item:', error);
            }
        }
    };

    const columns: ColumnDef<MasterItem>[] = [
        {
            accessorKey: "code",
            header: "Code",
        },
        {
            accessorKey: "company",
            header: "Company",
        },
        {
            accessorKey: "name",
            header: "Title",
        },
        {
            accessorKey: "itemGroup.name",
            header: "Group",
            cell: ({ row }) => {
                return row.original.itemGroup?.name || '-';
            }
        },
        {
            accessorKey: "itemAccountGroup.name",
            header: "Account Group",
            cell: ({ row }) => {
                return row.original.itemAccountGroup?.name || '-';
            }
        },
        {
            accessorKey: "price",
            header: "Price",
            cell: ({ row }) => {
                const amount = parseFloat(row.getValue("price"));
                const formatted = new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                }).format(amount);
                return <div className="font-medium">{formatted}</div>;
            },
        },
        {
            accessorKey: "isActive",
            header: "Status",
            cell: ({ row }) => {
                return (
                    <div className={`font-medium ${row.getValue("isActive") ? "text-green-600" : "text-red-600"}`}>
                        {row.getValue("isActive") ? "Active" : "Inactive"}
                    </div>
                );
            },
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
                    <h1 className="text-3xl font-bold">Master Items</h1>
                    <div className="space-x-4">
                        <Button onClick={handleCreate}>Add Master Item</Button>
                    </div>
                </div>
                {loading ? (
                    <div>Loading...</div>
                ) : (
                    <DataTable columns={columns} data={data} />
                )}
                <MasterItemDialog
                    open={isDialogOpen}
                    onOpenChange={setIsDialogOpen}
                    item={selectedItem}
                    onSuccess={fetchData}
                />
            </div>
        </AuthGuard>
    );
}
