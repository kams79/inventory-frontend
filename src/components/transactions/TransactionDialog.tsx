'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Transaction, transactionsService } from '@/services/transactions.service';
import { referenceService, ItemAccountGroup } from '@/services/reference.service';

import { ulid } from 'ulid';

const formSchema = z.object({
    company: z.string().optional(),
    code: z.string().optional(),
    date: z.string().optional(), // Using string for date input
    account: z.string().optional(),
    note: z.string().optional(),
});

interface TransactionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    item?: Transaction;
    onSuccess: () => void;
}

export function TransactionDialog({ open, onOpenChange, item, onSuccess }: TransactionDialogProps) {
    const [loading, setLoading] = useState(false);
    const [accountGroups, setAccountGroups] = useState<ItemAccountGroup[]>([]);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            company: '',
            code: '',
            date: new Date().toISOString().split('T')[0],
            account: '',
            note: '',
        },
    });

    useEffect(() => {
        const fetchReferences = async () => {
            try {
                const groups = await referenceService.getItemAccountGroups();
                setAccountGroups(groups);
            } catch (error) {
                console.error("Failed to fetch account groups", error);
            }
        };

        if (open) {
            fetchReferences();
            const storedCompany = localStorage.getItem('company') || '';
            form.reset({
                company: item?.company || storedCompany,
                code: item?.code || ulid(),
                date: item?.date ? new Date(item.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                account: item?.account || '',
                note: item?.note || '',
            });
        }
    }, [open, item, form]);

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setLoading(true);
        try {
            if (item) {
                await transactionsService.update(item.id, values);
            } else {
                await transactionsService.create(values);
            }
            onSuccess();
            onOpenChange(false);
            form.reset();
        } catch (error) {
            console.error('Failed to save transaction:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>{item ? 'Edit Transaction' : 'Add Transaction'}</DialogTitle>
                    <DialogDescription>
                        {item ? 'Edit the transaction header.' : 'Create a new transaction header.'}
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
                                            <Input placeholder="Company" {...field} disabled />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="code"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Code</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Transaction Code" {...field} disabled />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="date"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Date</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="account"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Account</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Account" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {accountGroups.map((group) => (
                                                    <SelectItem key={group.id} value={group.name}>
                                                        {group.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="note"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Note</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Add a note..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

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
