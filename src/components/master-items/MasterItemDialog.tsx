'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ulid } from 'ulid';
import * as z from 'zod';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MasterItem, masterItemsService } from '@/services/master-items.service';
import {
    referenceService,
    ItemType,
    ItemGroup,
    ItemUnit,
    ItemAccountGroup
} from '@/services/reference.service';

const formSchema = z.object({
    company: z.string().optional(),
    itemTypeId: z.string().optional(),
    code: z.string().optional(),
    name: z.string().min(1, 'Name is required'),
    itemGroupId: z.string().optional(),
    itemAccountGroupId: z.string().optional(),
    itemUnitId: z.string().optional(),
    isActive: z.boolean().default(true),
    price: z.coerce.number().default(0),
    quantity: z.coerce.number().default(0),
    description: z.string().optional(),
});

interface MasterItemDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    item?: MasterItem;
    onSuccess: () => void;
}

export function MasterItemDialog({ open, onOpenChange, item, onSuccess }: MasterItemDialogProps) {
    const [loading, setLoading] = useState(false);

    // Reference Data State
    const [itemTypes, setItemTypes] = useState<ItemType[]>([]);
    const [itemGroups, setItemGroups] = useState<ItemGroup[]>([]);
    const [itemUnits, setItemUnits] = useState<ItemUnit[]>([]);
    const [itemAccountGroups, setItemAccountGroups] = useState<ItemAccountGroup[]>([]);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            name: '',
            code: '',
            description: '',
            price: 0,
            quantity: 0,
            isActive: true,
            company: '',
            itemTypeId: '',
            itemGroupId: '',
            itemUnitId: '',
            itemAccountGroupId: '',
        },
    });

    useEffect(() => {
        const fetchReferences = async () => {
            try {
                const [types, groups, units, accountGroups] = await Promise.all([
                    referenceService.getItemTypes(),
                    referenceService.getItemGroups(),
                    referenceService.getItemUnits(),
                    referenceService.getItemAccountGroups(),
                ]);
                setItemTypes(types);
                setItemGroups(groups);
                setItemUnits(units);
                setItemAccountGroups(accountGroups);
            } catch (error) {
                console.error("Failed to fetch reference data", error);
            }
        };

        if (open) {
            fetchReferences();
            const storedCompany = localStorage.getItem('company') || '';
            form.reset({
                name: item?.name || '',
                code: item?.code || ulid(),
                description: item?.description || '',
                price: item?.price || 0,
                quantity: item?.quantity || 0,
                isActive: item ? item.isActive : true,
                company: item?.company || storedCompany,
                itemTypeId: item?.itemTypeId || '',
                itemGroupId: item?.itemGroupId || '',
                itemUnitId: item?.itemUnitId || '',
                itemAccountGroupId: item?.itemAccountGroupId || '',
            });
        }
    }, [open, item, form]);

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setLoading(true);
        try {
            if (item) {
                await masterItemsService.update(item.id, values);
            } else {
                await masterItemsService.create(values);
            }
            onSuccess();
            onOpenChange(false);
            form.reset();
        } catch (error) {
            console.error('Failed to save item:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{item ? 'Edit Master Item' : 'Add Master Item'}</DialogTitle>
                    <DialogDescription>
                        {item ? 'Edit the details of the master item.' : 'Create a new master item in your inventory.'}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="company"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Company</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Company Name" {...field} disabled />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="itemTypeId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Item Type</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {itemTypes.map((t) => (
                                                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="code"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Code</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Item Code" {...field} disabled />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Title / Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Item Name" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="itemGroupId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Item Group</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Group" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {itemGroups.map((g) => (
                                                    <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="itemAccountGroupId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Item Account Group</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Account Group" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {itemAccountGroups.map((g) => (
                                                    <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="itemUnitId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Item Unit</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Unit" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {itemUnits.map((u) => (
                                                    <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="isActive"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 mt-8">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel>
                                                Active Status
                                            </FormLabel>
                                        </div>
                                    </FormItem>
                                )}
                            />
                        </div>
                        <DialogFooter>
                            <Button type="submit" disabled={loading}>
                                {loading ? 'Saving...' : 'Save'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
