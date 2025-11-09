import React from 'react';
import { useData } from '../context/DataContext';
import type { Invoice } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Line, ComposedChart } from 'recharts';

// FIX: Changed JSX.Element to React.ReactNode to resolve namespace error.
const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm flex items-center">
        <div className="bg-primary-100 text-primary-600 p-3 rounded-full mr-4">
            {icon}
        </div>
        <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
    </div>
);

const Dashboard: React.FC = () => {
    const { invoices, clients, products, expenses } = useData();

    const totalRevenue = invoices
        .filter(inv => inv.status === 'Paid' || inv.status === 'Partially Paid')
        .reduce((sum, inv) => sum + inv.paidAmount, 0);

    const outstandingRevenue = invoices
        .filter(inv => inv.status === 'Unpaid' || inv.status === 'Overdue' || inv.status === 'Partially Paid')
        .reduce((sum, inv) => sum + (inv.total - inv.paidAmount), 0);

    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
    };

    const getStatusChip = (status: Invoice['status']) => {
         switch (status) {
            case 'Paid': return 'bg-green-100 text-green-800';
            case 'Overdue': return 'bg-red-100 text-red-800';
            case 'Partially Paid': return 'bg-primary-100 text-primary-800';
            case 'Unpaid': default: return 'bg-yellow-100 text-yellow-800';
        }
    };
    
    // Data for sales chart (last 6 months)
    const salesData = Array.from({ length: 6 }).map((_, i) => {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const month = d.toLocaleString('default', { month: 'short' });
        const year = d.getFullYear();
        
        const monthlySales = invoices
            .filter(inv => new Date(inv.issueDate).getMonth() === d.getMonth() && new Date(inv.issueDate).getFullYear() === year && (inv.status === 'Paid' || inv.status === 'Partially Paid'))
            .reduce((sum, inv) => sum + inv.paidAmount, 0);
            
        const monthlyExpenses = expenses
            .filter(exp => new Date(exp.date).getMonth() === d.getMonth() && new Date(exp.date).getFullYear() === year)
            .reduce((sum, exp) => sum + exp.amount, 0);

        return { name: month, Sales: monthlySales, Expenses: monthlyExpenses };
    }).reverse();


    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-800">Dashboard</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="Total Revenue" 
                    value={formatCurrency(totalRevenue)}
                    icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 8h6m-5 4h.01M4 16h16M4 12h16M4 8h16M4 4h16" /></svg>}
                />
                <StatCard 
                    title="Outstanding" 
                    value={formatCurrency(outstandingRevenue)}
                    icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>}
                />
                <StatCard 
                    title="Total Expenses" 
                    value={formatCurrency(totalExpenses)}
                    icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0z"/></svg>}
                />
                <StatCard 
                    title="Total Clients" 
                    value={clients.length}
                    icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>}
                />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white shadow-sm rounded-lg p-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Sales Overview (Last 6 Months)</h3>
                     <ResponsiveContainer width="100%" height={300}>
                        <ComposedChart data={salesData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis tickFormatter={(value) => `₹${value/1000}k`} />
                            <Tooltip formatter={(value: number) => formatCurrency(value)} />
                            <Legend />
                            <Bar dataKey="Sales" fill="#22d780" />
                            <Line type="monotone" dataKey="Expenses" stroke="#f99f70" />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
                <div className="bg-white shadow-sm rounded-lg p-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Recent Invoices</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500">
                            <tbody>
                                {invoices.slice().reverse().slice(0, 5).map(invoice => (
                                    <tr key={invoice.id} className="border-b last:border-b-0">
                                        <td className="py-3 pr-2">
                                            <div className="font-medium text-gray-900">{invoice.invoiceNumber}</div>
                                            <div className="text-gray-500">{invoice.client.name}</div>
                                        </td>
                                        <td className="py-3 pl-2 text-right">
                                            <div className="font-medium text-gray-900">{formatCurrency(invoice.total)}</div>
                                            <span className={`px-2 py-1 mt-1 inline-block text-xs font-semibold rounded-full ${getStatusChip(invoice.status)}`}>
                                                {invoice.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                     {invoices.length === 0 && <p className="pt-6 text-center text-gray-500">No invoices yet.</p>}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;