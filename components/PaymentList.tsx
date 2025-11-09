import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import Button from './common/Button';
import type { Payment } from '../types';
import PaymentForm from './PaymentForm';

const PaymentList: React.FC = () => {
    const { payments, invoices, clients, deletePayment } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const handleNewPayment = () => {
        setSelectedPayment(null);
        setIsModalOpen(true);
    };

    const handleEditPayment = (payment: Payment) => {
        setSelectedPayment(payment);
        setIsModalOpen(true);
    };

    const handleDeletePayment = (id: string) => {
        if (window.confirm('Are you sure you want to delete this payment record? This will affect the linked invoice status.')) {
            const executeDelete = async () => {
                try {
                    await deletePayment(id);
                } catch (error: any) {
                    console.error("Failed to delete payment:", error);
                    alert(`Error: ${error.message}` || "An unknown error occurred while deleting the payment record.");
                }
            };
            executeDelete();
        }
    };

    const getInvoiceNumber = (invoiceId: string | null) => {
        if (!invoiceId) return 'N/A';
        return invoices.find(inv => inv.id === invoiceId)?.invoiceNumber || 'Deleted Invoice';
    };
    
    const getClientName = (clientId: string) => {
        return clients.find(c => c.id === clientId)?.name || 'Deleted Client';
    };
    
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
    };

    const filteredPayments = useMemo(() => {
        return payments.filter(payment => {
            const term = searchTerm.toLowerCase().trim();
            if (!term) return true;

            const clientName = getClientName(payment.clientId).toLowerCase();
            const invoiceNumber = getInvoiceNumber(payment.invoiceId).toLowerCase();
            const mode = payment.mode.toLowerCase();

            return clientName.includes(term) || invoiceNumber.includes(term) || mode.includes(term);
        });
    }, [payments, searchTerm, clients, invoices]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-4">
                <h2 className="text-2xl font-bold text-gray-800">Payments Received</h2>
                <Button onClick={handleNewPayment}>Record New Payment</Button>
            </div>

            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                     <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                </div>
                <input
                    type="text"
                    placeholder="Search by client, invoice #, or mode..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 p-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-primary-500 focus:border-primary-500"
                    aria-label="Search payments"
                />
            </div>

            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3">Date</th>
                                <th scope="col" className="px-6 py-3">Client</th>
                                <th scope="col" className="px-6 py-3">Invoice #</th>
                                <th scope="col" className="px-6 py-3">Mode</th>
                                <th scope="col" className="px-6 py-3 text-right">Amount</th>
                                <th scope="col" className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPayments.map((payment) => (
                                <tr key={payment.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4">{new Date(payment.date).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 font-medium text-gray-900">{getClientName(payment.clientId)}</td>
                                    <td className="px-6 py-4">{getInvoiceNumber(payment.invoiceId)}</td>
                                    <td className="px-6 py-4">{payment.mode}</td>
                                    <td className="px-6 py-4 text-right font-semibold">{formatCurrency(payment.amount)}</td>
                                    <td className="px-6 py-4 flex items-center space-x-2">
                                        <Button variant="secondary" onClick={() => handleEditPayment(payment)} className="p-2" aria-label="Edit Payment">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z"></path></svg>
                                        </Button>
                                        <Button variant="secondary" onClick={() => handleDeletePayment(payment.id)} className="p-2" aria-label="Delete Payment">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {payments.length > 0 && filteredPayments.length === 0 && (
                    <p className="p-6 text-center text-gray-500">No payments match your search for "{searchTerm}".</p>
                )}
                {payments.length === 0 && <p className="p-6 text-center text-gray-500">No payments recorded yet.</p>}
            </div>

            <PaymentForm
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                payment={selectedPayment}
            />
        </div>
    );
};

export default PaymentList;