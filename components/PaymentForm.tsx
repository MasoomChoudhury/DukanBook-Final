import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import Button from './common/Button';
import Modal from './common/Modal';
import type { Payment, Invoice } from '../types';

interface PaymentFormProps {
    isOpen: boolean;
    onClose: () => void;
    payment: Payment | null;
    invoice?: Invoice | null;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ isOpen, onClose, payment, invoice }) => {
    const { clients, invoices, addPayment, updatePayment } = useData();
    const [formData, setFormData] = useState<Omit<Payment, 'id'>>({
        date: new Date().toISOString().split('T')[0],
        clientId: '',
        invoiceId: null,
        amount: 0,
        mode: 'UPI',
        notes: '',
    });
    
    useEffect(() => {
        if (payment) {
            setFormData(payment);
        } else if (invoice) {
            setFormData({
                date: new Date().toISOString().split('T')[0],
                clientId: invoice.client.id,
                invoiceId: invoice.id,
                amount: invoice.total - invoice.paidAmount,
                mode: 'UPI',
                notes: `Payment for Invoice #${invoice.invoiceNumber}`
            });
        } else {
             setFormData({
                date: new Date().toISOString().split('T')[0],
                clientId: clients[0]?.id || '',
                invoiceId: null,
                amount: 0,
                mode: 'UPI',
                notes: ''
            });
        }
    }, [payment, invoice, isOpen, clients]);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        
        let processedValue: string | number | null = value;
        if (type === 'number') {
            processedValue = parseFloat(value) || 0;
        }
        if (name === 'invoiceId' && value === 'none') {
            processedValue = null;
        }

        setFormData(prev => ({
            ...prev,
            [name]: processedValue,
        }));

        if (name === 'clientId' && !invoice) {
            // Reset invoice if client changes for a standalone payment
            setFormData(prev => ({ ...prev, invoiceId: null }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.clientId) {
            alert("Please select a client.");
            return;
        }
         if (formData.amount <= 0) {
            alert("Amount must be greater than zero.");
            return;
        }
        if (payment) {
            await updatePayment({ ...formData, id: payment.id });
        } else {
            await addPayment(formData);
        }
        onClose();
    };

    const clientInvoices = formData.clientId 
        ? invoices.filter(inv => inv.client.id === formData.clientId && inv.status !== 'Paid')
        : [];

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={payment ? 'Edit Payment' : 'Record Payment'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Date</label>
                        <input name="date" type="date" value={formData.date} onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Amount</label>
                        <input name="amount" type="number" step="0.01" value={formData.amount} onChange={handleChange} placeholder="Amount" required className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900"/>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Client</label>
                    <select name="clientId" value={formData.clientId} onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900" disabled={!!invoice}>
                        <option value="">Select a Client</option>
                        {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Link to Invoice (Optional)</label>
                    <select name="invoiceId" value={formData.invoiceId || 'none'} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900" disabled={!!invoice}>
                        <option value="none">Standalone Payment / No Invoice</option>
                        {clientInvoices.map(inv => <option key={inv.id} value={inv.id}>{inv.invoiceNumber} - Due: ₹{(inv.total - inv.paidAmount).toFixed(2)}</option>)}
                    </select>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Payment Mode</label>
                    <select name="mode" value={formData.mode} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900">
                        <option>UPI</option>
                        <option>Bank Transfer</option>
                        <option>Cash</option>
                        <option>Other</option>
                    </select>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Notes</label>
                    <textarea name="notes" value={formData.notes} onChange={handleChange} rows={2} placeholder="Add any transaction details..." className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900"/>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit">{payment ? 'Update Payment' : 'Save Payment'}</Button>
                </div>
            </form>
        </Modal>
    );
};

export default PaymentForm;