import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useData } from '../context/DataContext';
import Button from './common/Button';
import type { Invoice, InvoiceItem, Client, Product, ProductVariant } from '../types';
import { calculateInvoiceTaxes } from '../utils/gstCalculator';
import { generateDescription } from '../services/geminiService';
import { INDIAN_STATES } from '../constants';

interface InvoiceFormProps {
    isOpen: boolean;
    onClose: () => void;
    invoice: Invoice | null;
}

const InvoiceForm: React.FC<InvoiceFormProps> = ({ isOpen, onClose, invoice }) => {
    const { clients, products, addInvoice, updateInvoice, addClient, getNextInvoiceNumber, businessProfile } = useData();
    const [formData, setFormData] = useState<Omit<Invoice, 'id'> & { id?: string }>(getInitialFormData());
    const [isGenerating, setIsGenerating] = useState<Record<string, boolean>>({});
    
    // State for barcode scanning
    const [barcode, setBarcode] = useState('');
    const barcodeInputRef = useRef<HTMLInputElement>(null);
    
    // State for new client workflow
    const [clientSearchText, setClientSearchText] = useState('');
    const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false);
    const [isAddingNewClient, setIsAddingNewClient] = useState(false);
    const [newClientPhoneNumber, setNewClientPhoneNumber] = useState('');
    const clientInputRef = useRef<HTMLDivElement>(null);

    function getInitialFormData(): Omit<Invoice, 'id'> & { id?: string } {
        if (invoice) return invoice;

        const today = new Date().toISOString().split('T')[0];
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 15);

        return {
            invoiceNumber: getNextInvoiceNumber(),
            client: null,
            items: [],
            issueDate: today,
            dueDate: dueDate.toISOString().split('T')[0],
            status: 'Unpaid',
            subtotal: 0,
            cgst: 0,
            sgst: 0,
            igst: 0,
            total: 0,
            paidAmount: 0,
        };
    }

    const updateTotals = useCallback((items: InvoiceItem[], client: Client | null) => {
        if (!client || !businessProfile) {
            const subtotal = items.reduce((sum, item) => sum + item.quantity * item.price, 0);
            setFormData(prev => ({ ...prev, subtotal, total: subtotal, cgst: 0, sgst: 0, igst: 0 }));
            return;
        }
        
        const { subtotal, cgst, sgst, igst, total } = calculateInvoiceTaxes(items, businessProfile.state, client.state);
        setFormData(prev => ({ ...prev, subtotal, cgst, sgst, igst, total }));
    }, [businessProfile]);
    
    useEffect(() => {
        if(isOpen) {
            const initialData = getInitialFormData();
            setFormData(initialData);
            setClientSearchText(invoice?.client?.name || '');
            setIsAddingNewClient(false);
            setNewClientPhoneNumber('');
            setIsClientDropdownOpen(false);
            setTimeout(() => barcodeInputRef.current?.focus(), 100);
        }
    }, [invoice, isOpen, clients, products]);

    useEffect(() => {
        updateTotals(formData.items, formData.client);
    }, [formData.items, formData.client, updateTotals]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (clientInputRef.current && !clientInputRef.current.contains(event.target as Node)) {
                setIsClientDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    
    const handleBarcodeScan = () => {
        if (!barcode.trim()) return;

        const scannedCode = barcode.trim();
        let productFound: Product | undefined;
        let variantFound: ProductVariant | undefined;

        for (const p of products) {
            if (p.hsnSacCode === scannedCode) {
                productFound = p;
                variantFound = p.variants[0];
                break;
            }
        }

        if (productFound && variantFound) {
            const existingItemIndex = formData.items.findIndex(
                item => item.product.id === productFound!.id && item.variant.id === variantFound!.id
            );

            if (existingItemIndex > -1) {
                const newItems = [...formData.items];
                const currentItem = newItems[existingItemIndex];
                const newQuantity = currentItem.quantity + 1;
                
                const availableStock = variantFound.quantity + (invoice?.items.find(i => i.id === currentItem.id)?.quantity || 0);
                if (newQuantity > availableStock) {
                    alert(`Not enough stock for ${productFound.name} (${variantFound.name}). Only ${availableStock} available.`);
                } else {
                    currentItem.quantity = newQuantity;
                    setFormData(prev => ({ ...prev, items: newItems }));
                }
            } else {
                 if (variantFound.quantity <= 0) {
                     alert(`Product ${productFound.name} (${variantFound.name}) is out of stock.`);
                     setBarcode('');
                     return;
                 }
                const newItem: InvoiceItem = {
                    id: new Date().toISOString(),
                    product: productFound,
                    variant: variantFound,
                    description: productFound.description,
                    quantity: 1,
                    price: variantFound.sellingPrice,
                    gstRate: productFound.gstRate,
                };
                setFormData(prev => ({ ...prev, items: [...prev.items, newItem] }));
            }
        } else {
            alert(`Product with HSN/SAC code "${scannedCode}" not found.`);
        }
        setBarcode('');
    };

    const handleItemChange = (index: number, field: keyof InvoiceItem | 'product', value: any) => {
        const newItems = [...formData.items];
        const currentItem = newItems[index];
        
        if (field === 'product') {
            const product = products.find(p => p.id === value) as Product;
            const firstVariant = product.variants[0];
            newItems[index] = { 
                ...newItems[index], 
                product, 
                variant: firstVariant,
                description: product.description, 
                price: firstVariant.sellingPrice,
                gstRate: product.gstRate,
            };
        } else {
            if (field === 'quantity') {
                const variantInStock = currentItem.variant;
                if (variantInStock) {
                     const originalItem = invoice?.items.find(i => i.id === currentItem.id);
                     const originalQuantity = originalItem ? originalItem.quantity : 0;
                     const availableStock = variantInStock.quantity + originalQuantity;
                    if (value > availableStock) {
                        alert(`Warning: You've entered a quantity of ${value}, but only ${availableStock} are available in stock for "${currentItem.product.name} (${variantInStock.name})".`);
                    }
                }
            }
            (newItems[index] as any)[field] = value;
        }
        setFormData({ ...formData, items: newItems });
    };

    const handleVariantChange = (itemIndex: number, variantId: string) => {
        const newItems = [...formData.items];
        const item = newItems[itemIndex];
        const selectedVariant = item.product.variants.find(v => v.id === variantId);
        
        if (selectedVariant) {
            item.variant = selectedVariant;
            item.price = selectedVariant.sellingPrice;
        }
        setFormData({ ...formData, items: newItems });
    };
    
    const handleGenerateDescription = async (index: number) => {
        const item = formData.items[index];
        if (!item.product?.name) return;

        setIsGenerating(prev => ({ ...prev, [item.id]: true }));
        try {
            const description = await generateDescription(`${item.product.name} ${item.variant.name}`);
            handleItemChange(index, 'description', description);
        } finally {
            setIsGenerating(prev => ({ ...prev, [item.id]: false }));
        }
    };

    const addItem = () => {
        if (!products.length) {
            alert("Please add a product first.");
            return;
        }
        const firstProductWithStock = products.find(p => p.variants.some(v => v.quantity > 0));
        if (!firstProductWithStock) {
            alert("All products are out of stock.");
            return;
        }
        const firstVariantWithStock = firstProductWithStock.variants.find(v => v.quantity > 0)!;
        
        const newItem: InvoiceItem = {
            id: new Date().toISOString(),
            product: firstProductWithStock,
            variant: firstVariantWithStock,
            description: firstProductWithStock.description,
            quantity: 1,
            price: firstVariantWithStock.sellingPrice,
            gstRate: firstProductWithStock.gstRate,
        };
        setFormData({ ...formData, items: [...formData.items, newItem] });
    };

    const removeItem = (index: number) => {
        const newItems = formData.items.filter((_, i) => i !== index);
        setFormData({ ...formData, items: newItems });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        let finalClient = formData.client;

        if (isAddingNewClient) {
            const newClientName = clientSearchText.trim();
            if (!newClientName) {
                alert('Please enter a name for the new client.');
                return;
            }
            try {
                finalClient = await addClient({
                    name: newClientName,
                    contact: newClientPhoneNumber.trim(),
                    gstin: '',
                    address: '',
                    state: businessProfile?.state || INDIAN_STATES[0],
                });
            } catch (error) {
                console.error("Failed to add new client:", error);
                alert("Could not create new client. Please try again.");
                return;
            }
        }
        
        if (!finalClient) {
            alert('Please select a client or add a new one.');
            return;
        }
        if (formData.items.length === 0) {
            alert('Please add at least one item.');
            return;
        }
        const invoiceData = { ...formData, client: finalClient };

        try {
            if (invoice) {
                await updateInvoice(invoiceData as Invoice);
            } else {
                await addInvoice(invoiceData);
            }
            onClose();
        } catch (error) {
            console.error("Failed to save invoice:", error);
            alert("There was an error saving the invoice: " + (error as Error).message);
        }
    };

    const handleClientSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setClientSearchText(value);
        setIsAddingNewClient(false);
        if (value) setIsClientDropdownOpen(true); else setIsClientDropdownOpen(false);
        if (formData.client) setFormData(prev => ({ ...prev, client: null }));
    };
    
    const handleSelectClient = (client: Client) => {
        setFormData(prev => ({...prev, client}));
        setClientSearchText(client.name);
        setIsClientDropdownOpen(false);
        setIsAddingNewClient(false);
    };

    const handleAddNewClient = () => {
        setIsAddingNewClient(true);
        setFormData(prev => ({ ...prev, client: null }));
        setNewClientPhoneNumber('');
        setIsClientDropdownOpen(false);
    };

    const filteredClients = useMemo(() => {
        if (!clientSearchText) return [];
        return clients.filter(c => c.name.toLowerCase().includes(clientSearchText.toLowerCase()));
    }, [clientSearchText, clients]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-end">
            <div className="bg-white w-full max-w-3xl h-full shadow-xl p-6 overflow-y-auto">
                <div className="flex justify-between items-center pb-4 border-b">
                    <h2 className="text-xl font-semibold text-gray-900">{invoice ? 'Edit Invoice' : 'Create Invoice'}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                         <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div ref={clientInputRef} className="relative">
                            <label className="block text-sm font-medium text-gray-700">Client</label>
                            <input 
                                type="text" 
                                value={clientSearchText}
                                onChange={handleClientSearchChange}
                                onFocus={() => clientSearchText && setIsClientDropdownOpen(true)}
                                placeholder="Type to search or add new client"
                                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-900" 
                                required={!isAddingNewClient}
                            />
                            {isClientDropdownOpen && (
                                <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-60 overflow-auto shadow-lg">
                                    {filteredClients.map(c => (
                                        <li key={c.id} onClick={() => handleSelectClient(c)} className="px-3 py-2 cursor-pointer hover:bg-primary-100">{c.name}</li>
                                    ))}
                                    <li onClick={handleAddNewClient} className="px-3 py-2 cursor-pointer hover:bg-primary-100 font-semibold text-primary-600 border-t">
                                        + Add New Client "{clientSearchText}"
                                    </li>
                                </ul>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Invoice Number</label>
                            <input type="text" value={formData.invoiceNumber} readOnly className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700"/>
                        </div>
                        {isAddingNewClient && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700">New Client Phone (Optional)</label>
                                <input 
                                    type="text" 
                                    value={newClientPhoneNumber}
                                    onChange={e => setNewClientPhoneNumber(e.target.value)}
                                    placeholder="Enter phone number"
                                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-900"
                                />
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Issue Date</label>
                            <input type="date" value={formData.issueDate} onChange={e => setFormData({...formData, issueDate: e.target.value})} className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Due Date</label>
                            <input type="date" value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})} className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900"/>
                        </div>
                    </div>

                    <div className="relative">
                        <label className="block text-sm font-medium text-gray-700">Scan Barcode (HSN/SAC)</label>
                        <div className="absolute inset-y-0 left-0 pl-3 pt-6 flex items-center pointer-events-none">
                             <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0z"/></svg>
                        </div>
                        <input
                            ref={barcodeInputRef}
                            type="text"
                            value={barcode}
                            onChange={(e) => setBarcode(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleBarcodeScan(); } }}
                            placeholder="Ready to scan..."
                            className="mt-1 block w-full pl-10 p-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-900 focus:ring-primary-500 focus:border-primary-500"
                        />
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-lg font-medium text-gray-900">Items</h3>
                        {formData.items.map((item, index) => (
                            <div key={item.id} className="p-4 border rounded-md space-y-2 bg-gray-50">
                                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                    <div className="md:col-span-2">
                                        <label className="text-xs text-gray-600">Product/Service</label>
                                        <select value={item.product.id} onChange={e => handleItemChange(index, 'product', e.target.value)} className="w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900">
                                            {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                        </select>
                                    </div>
                                     <div className="md:col-span-2">
                                        <label className="text-xs text-gray-600">Variant</label>
                                        <select value={item.variant.id} onChange={e => handleVariantChange(index, e.target.value)} className="w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900">
                                            {item.product.variants.map(v => <option key={v.id} value={v.id}>{v.name} (Stock: {v.quantity})</option>)}
                                        </select>
                                    </div>
                                    <div className="flex items-end">
                                        <Button type="button" variant="danger" onClick={() => removeItem(index)}>Remove</Button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs text-gray-600">Quantity</label>
                                        <input type="number" value={item.quantity} onChange={e => handleItemChange(index, 'quantity', parseFloat(e.target.value))} className="w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900" min="1"/>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-600">Price</label>
                                        <input type="number" value={item.price} onChange={e => handleItemChange(index, 'price', parseFloat(e.target.value))} className="w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900"/>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-600">Description</label>
                                     <div className="flex items-center gap-2">
                                        <input type="text" value={item.description} onChange={e => handleItemChange(index, 'description', e.target.value)} className="w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900" />
                                        <Button type="button" variant="secondary" onClick={() => handleGenerateDescription(index)} disabled={isGenerating[item.id]}>
                                            {isGenerating[item.id] ? '...' : 'AI'}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        <Button type="button" variant="secondary" onClick={addItem}>Add Item Manually</Button>
                    </div>

                    <div className="flex justify-end">
                        <div className="w-full max-w-sm space-y-2 text-right">
                            <div className="flex justify-between"><span className="text-gray-600">Subtotal:</span><span>₹{formData.subtotal.toFixed(2)}</span></div>
                            {formData.sgst > 0 && <div className="flex justify-between"><span className="text-gray-600">SGST:</span><span>₹{formData.sgst.toFixed(2)}</span></div>}
                            {formData.cgst > 0 && <div className="flex justify-between"><span className="text-gray-600">CGST:</span><span>₹{formData.cgst.toFixed(2)}</span></div>}
                            <div className="flex justify-between text-xl font-semibold"><span className="text-gray-800">Total:</span><span className="text-primary-600">₹{formData.total.toFixed(2)}</span></div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t">
                        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                        <Button type="submit">{invoice ? 'Update Invoice' : 'Save Invoice'}</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default InvoiceForm;
