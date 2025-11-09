import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import Button from './common/Button';
import InvoiceForm from './InvoiceForm';
import PaymentForm from './PaymentForm';
import type { Invoice, BusinessProfile } from '../types';
import { generateInvoicePDF } from '../utils/pdfGenerator';

const InvoiceList: React.FC = () => {
    const { invoices, deleteInvoice, businessProfile } = useData();
    const [isInvoiceFormOpen, setIsInvoiceFormOpen] = useState(false);
    const [isPaymentFormOpen, setIsPaymentFormOpen] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const handleNewInvoice = () => {
        setSelectedInvoice(null);
        setIsInvoiceFormOpen(true);
    };

    const handleEditInvoice = (invoice: Invoice) => {
        setSelectedInvoice(invoice);
        setIsInvoiceFormOpen(true);
    };
    
    const handleAddPayment = (invoice: Invoice) => {
        setSelectedInvoice(invoice);
        setIsPaymentFormOpen(true);
    };

    const handleDeleteInvoice = (id: string) => {
        if (window.confirm('Are you sure you want to delete this invoice and all associated payments? This action cannot be undone.')) {
            const executeDelete = async () => {
                try {
                    await deleteInvoice(id);
                } catch (error: any) {
                    console.error("Failed to delete invoice:", error);
                    alert(`Error: ${error.message}` || "An unknown error occurred while deleting the invoice.");
                }
            };
            executeDelete();
        }
    };

    const handleGeneratePDF = (invoice: Invoice, profile: BusinessProfile | null) => {
        if (!profile) {
            alert("Business profile is not loaded yet. Please wait.");
            return;
        }
        try {
            generateInvoicePDF(invoice, profile);
        } catch (error) {
            console.error("Failed to generate PDF:", error);
            alert("An error occurred while generating the PDF. This may be due to special characters not being supported. Please check the console for details.");
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
    };

    const getStatusChip = (status: Invoice['status']) => {
         switch (status) {
            case 'Paid': return 'bg-green-100 text-green-800';
            case 'Overdue': return 'bg-red-100 text-red-800';
            case 'Partially Paid': return 'bg-primary-100 text-primary-800';
            case 'Unpaid': default: return 'bg-yellow-100 text-yellow-800';
        }
    };

    const filteredInvoices = useMemo(() => {
        return invoices.filter(invoice => {
            const term = searchTerm.toLowerCase().trim();
            if (!term) return true;

            const clientNameMatch = invoice.client?.name?.toLowerCase().includes(term);
            const invoiceNumberMatch = invoice.invoiceNumber.toLowerCase().includes(term);
            const statusMatch = invoice.status.toLowerCase().includes(term);
            
            return clientNameMatch || invoiceNumberMatch || statusMatch;
        });
    }, [invoices, searchTerm]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-4">
                <h2 className="text-2xl font-bold text-gray-800">Invoices</h2>
                <Button onClick={handleNewInvoice}>Create New Invoice</Button>
            </div>
            
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                     <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                </div>
                <input
                    type="text"
                    placeholder="Search by Invoice #, client name, or status..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 p-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-primary-500 focus:border-primary-500"
                    aria-label="Search invoices"
                />
            </div>

            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3">Status</th>
                                <th scope="col" className="px-6 py-3">Invoice #</th>
                                <th scope="col" className="px-6 py-3">Client</th>
                                <th scope="col" className="px-6 py-3">Total / Due</th>
                                <th scope="col" className="px-6 py-3">Issue Date</th>
                                <th scope="col" className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredInvoices.map((invoice) => (
                                <tr key={invoice.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusChip(invoice.status)}`}>
                                            {invoice.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-900">{invoice.invoiceNumber}</td>
                                    <td className="px-6 py-4">{invoice.client?.name || 'N/A'}</td>
                                    <td className="px-6 py-4">
                                        <div>{formatCurrency(invoice.total)}</div>
                                        {invoice.status !== 'Paid' && <div className="text-red-500 text-xs">{formatCurrency(invoice.total - invoice.paidAmount)} Due</div>}
                                    </td>
                                    <td className="px-6 py-4">{new Date(invoice.issueDate).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 flex items-center space-x-2">
                                        {invoice.status !== 'Paid' && <Button variant="primary" onClick={() => handleAddPayment(invoice)} className="text-xs px-3 py-1">Add Payment</Button>}
                                        <Button variant="secondary" onClick={() => handleGeneratePDF(invoice, businessProfile)} disabled={!businessProfile} className="text-xs px-3 py-1">PDF</Button>
                                        <Button variant="secondary" onClick={() => handleEditInvoice(invoice)} className="p-2" aria-label="Edit Invoice">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z"></path></svg>
                                        </Button>
                                        <Button variant="secondary" onClick={() => handleDeleteInvoice(invoice.id)} className="p-2" aria-label="Delete Invoice">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                 {invoices.length > 0 && filteredInvoices.length === 0 && (
                    <p className="p-6 text-center text-gray-500">No invoices match your search for "{searchTerm}".</p>
                 )}
                 {invoices.length === 0 && <p className="p-6 text-center text-gray-500">No invoices found. Create one to get started!</p>}
            </div>

            <InvoiceForm
                isOpen={isInvoiceFormOpen}
                onClose={() => setIsInvoiceFormOpen(false)}
                invoice={selectedInvoice}
            />

            {selectedInvoice && <PaymentForm
                isOpen={isPaymentFormOpen}
                onClose={() => setIsPaymentFormOpen(false)}
                payment={null}
                invoice={selectedInvoice}
            />}
        </div>
    );
};

export default InvoiceList;