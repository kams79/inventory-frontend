import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Transaction } from '@/services/transactions.service';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from "react";
import { transactionsService } from "@/services/transactions.service";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { masterItemsService, MasterItem } from '@/services/master-items.service';
import { referenceService, ItemUnit } from '@/services/reference.service';

interface TransactionDetailsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    transaction?: Transaction;
    onUpdate?: () => void;
}

export function TransactionDetailsDialog({ open, onOpenChange, transaction, onUpdate }: TransactionDetailsDialogProps) {
    const [loading, setLoading] = useState(false);
    const [masterItems, setMasterItems] = useState<MasterItem[]>([]);
    const [units, setUnits] = useState<ItemUnit[]>([]);
    const [editingItemId, setEditingItemId] = useState<string | null>(null);

    // Simple state for new item form
    const [newItem, setNewItem] = useState({
        masterItemId: '',
        quantity: 1,
        note: '',
        itemUnitId: '',
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [itemsData, unitsData] = await Promise.all([
                    masterItemsService.findAll(),
                    referenceService.getItemUnits(),
                ]);
                setMasterItems(itemsData);
                setUnits(unitsData);
            } catch (error) {
                console.error("Failed to fetch reference data", error);
            }
        };

        if (open) {
            fetchData();
        }
    }, [open]);

    // Reset form when dialog closes or transaction changes
    useEffect(() => {
        if (!open) {
            setEditingItemId(null);
            setNewItem({ masterItemId: '', quantity: 1, note: '', itemUnitId: '' });
        }
    }, [open]);


    const handleAddItem = async () => {
        if (!transaction || !newItem.masterItemId || newItem.quantity <= 0) return;
        setLoading(true);
        try {
            const selectedMasterItem = masterItems.find(i => i.id === newItem.masterItemId);
            const itemPayload = {
                ...newItem,
                itemUnitId: newItem.itemUnitId || selectedMasterItem?.itemUnitId || undefined
            };

            if (editingItemId) {
                await transactionsService.updateItem(transaction.id, editingItemId, itemPayload);
            } else {
                await transactionsService.addItem(transaction.id, itemPayload);
            }

            setNewItem({ masterItemId: '', quantity: 1, note: '', itemUnitId: '' });
            setEditingItemId(null);
            onUpdate?.();
        } catch (error) {
            console.error('Failed to save item', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEditItem = (item: any) => {
        setEditingItemId(item.id);
        setNewItem({
            masterItemId: item.masterItemId,
            quantity: item.quantity,
            note: item.note || '',
            itemUnitId: item.itemUnitId || '',
        });
    };

    const handleDeleteItem = async (itemId: string) => {
        if (!transaction || !confirm('Are you sure you want to delete this item?')) return;
        setLoading(true);
        try {
            await transactionsService.removeItem(transaction.id, itemId);
            onUpdate?.();
        } catch (error) {
            console.error('Failed to delete item', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelEdit = () => {
        setEditingItemId(null);
        setNewItem({ masterItemId: '', quantity: 1, note: '', itemUnitId: '' });
    };

    if (!transaction) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Transaction Details</DialogTitle>
                    <DialogDescription>
                        {transaction.code || 'No Code'} - {new Date(transaction.date).toLocaleDateString()}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-2 gap-4 py-4">
                    <div>
                        <h4 className="font-semibold text-sm text-gray-500">Company</h4>
                        <p>{transaction.company || '-'}</p>
                    </div>
                    <div>
                        <h4 className="font-semibold text-sm text-gray-500">Account</h4>
                        <p>{transaction.account || '-'}</p>
                    </div>
                    <div className="col-span-2">
                        <h4 className="font-semibold text-sm text-gray-500">Note</h4>
                        <p className="whitespace-pre-wrap">{transaction.note || '-'}</p>
                    </div>
                </div>

                <div className="mt-6 border-t pt-4">
                    <h3 className="font-semibold mb-4">{editingItemId ? 'Edit Item' : 'Add Item'}</h3>
                    <div className="grid grid-cols-12 gap-2 items-end">
                        <div className="col-span-4">
                            <label className="text-xs font-medium">Item</label>
                            <Select
                                value={newItem.masterItemId}
                                onValueChange={(value) => {
                                    const selectedItem = masterItems.find(i => i.id === value);
                                    setNewItem({
                                        ...newItem,
                                        masterItemId: value,
                                        itemUnitId: selectedItem?.itemUnitId || newItem.itemUnitId
                                    });
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Item" />
                                </SelectTrigger>
                                <SelectContent>
                                    {masterItems.map((item) => (
                                        <SelectItem key={item.id} value={item.id}>
                                            {item.name} {item.code ? `(${item.code})` : ''}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="col-span-3">
                            <label className="text-xs font-medium">Unit</label>
                            <Select
                                value={newItem.itemUnitId}
                                onValueChange={(value) => setNewItem({ ...newItem, itemUnitId: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Unit" />
                                </SelectTrigger>
                                <SelectContent>
                                    {units.map((unit) => (
                                        <SelectItem key={unit.id} value={unit.id}>
                                            {unit.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="col-span-2">
                            <label className="text-xs font-medium">Quantity</label>
                            <Input
                                type="number"
                                min={1}
                                value={newItem.quantity}
                                onChange={(e) => {
                                    const val = parseInt(e.target.value);
                                    setNewItem({ ...newItem, quantity: isNaN(val) ? 0 : val });
                                }}
                            />
                        </div>
                        <div className="col-span-3">
                            <label className="text-xs font-medium">Note</label>
                            <Input
                                value={newItem.note}
                                onChange={(e) => setNewItem({ ...newItem, note: e.target.value })}
                            />
                        </div>
                        <div className="col-span-12 mt-2 flex gap-2">
                            <Button onClick={handleAddItem} disabled={loading || !newItem.masterItemId || newItem.quantity <= 0} className="w-full">
                                {loading ? 'Saving...' : (editingItemId ? 'Update Item' : 'Add Item')}
                            </Button>
                            {editingItemId && (
                                <Button variant="outline" onClick={handleCancelEdit} disabled={loading}>
                                    Cancel
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mt-6">
                    <h3 className="font-semibold mb-2">Items</h3>
                    <div className="border rounded-md">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Item</TableHead>
                                    <TableHead>Unit</TableHead>
                                    <TableHead className="text-right">Quantity</TableHead>
                                    <TableHead>Note</TableHead>
                                    <TableHead className="w-[100px]">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {transaction.items && transaction.items.length > 0 ? (
                                    transaction.items.map((item: any) => (
                                        <TableRow key={item.id}>
                                            <TableCell>
                                                <div className="font-medium">{item.masterItem?.name || '-'}</div>
                                                <div className="text-xs text-gray-500">{item.masterItem?.code}</div>
                                            </TableCell>
                                            <TableCell>{item.itemUnit?.name || '-'}</TableCell>
                                            <TableCell className="text-right font-medium">
                                                {item.quantity}
                                            </TableCell>
                                            <TableCell>{item.note || '-'}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditItem(item)}>
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg>
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600" onClick={() => handleDeleteItem(item.id)}>
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center h-24 text-gray-500">
                                            No items in this transaction.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
