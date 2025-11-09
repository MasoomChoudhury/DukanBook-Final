import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Button from './common/Button';
import { generateBusinessAnalysis } from '../services/geminiService';
import type { AIReport } from '../types';

const StatCard: React.FC<{ title: string; value: string; isPositive?: boolean; description?: string }> = ({ title, value, isPositive, description }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className={`text-3xl font-bold ${
            isPositive === true ? 'text-green-600' : isPositive === false ? 'text-red-600' : 'text-gray-800'
        }`}>{value}</p>
        {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
    </div>
);

const Reports: React.FC = () => {
    const { payments, expenses, invoices, products } = useData();
    const [period, setPeriod] = useState<'month' | 'year'>('month');

    const [aiReport, setAiReport] = useState<AIReport | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
    };

    const { totalRevenue, totalExpenses, profitLoss, chartData } = useMemo(() => {
        const now = new Date();
        const startDate = period === 'month' 
            ? new Date(now.getFullYear(), now.getMonth(), 1)
            : new Date(now.getFullYear(), 0, 1);
            
        const filteredPayments = payments.filter(p => new Date(p.date) >= startDate);
        const filteredExpenses = expenses.filter(e => new Date(e.date) >= startDate);

        const revenue = filteredPayments.reduce((sum, p) => sum + p.amount, 0);
        const expenseTotal = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
        
        const data = [];
        if (period === 'month') {
            const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
            for (let i = 1; i <= daysInMonth; i++) {
                data.push({
                    name: `Day ${i}`,
                    Revenue: filteredPayments.filter(p => new Date(p.date).getDate() === i).reduce((s, p) => s + p.amount, 0),
                    Expenses: filteredExpenses.filter(e => new Date(e.date).getDate() === i).reduce((s, e) => s + e.amount, 0),
                });
            }
        } else { // year
             for (let i = 0; i < 12; i++) {
                const monthDate = new Date(now.getFullYear(), i, 1);
                data.push({
                    name: monthDate.toLocaleString('default', { month: 'short' }),
                    Revenue: filteredPayments.filter(p => new Date(p.date).getMonth() === i).reduce((s, p) => s + p.amount, 0),
                    Expenses: filteredExpenses.filter(e => new Date(e.date).getMonth() === i).reduce((s, e) => s + e.amount, 0),
                });
            }
        }

        return {
            totalRevenue: revenue,
            totalExpenses: expenseTotal,
            profitLoss: revenue - expenseTotal,
            chartData: data,
        };

    }, [payments, expenses, period]);
    
    const handleGenerateReport = async () => {
        setIsGenerating(true);
        setError(null);
        setAiReport(null);

        try {
            const simplifiedInvoices = invoices.map(inv => ({
                date: inv.issueDate,
                total: inv.total,
                items: inv.items.map(item => ({
                    productName: item.product.name,
                    variantName: item.variant.name,
                    quantity: item.quantity,
                    price: item.price
                }))
            }));

             const simplifiedProducts = products.flatMap(p => 
                p.variants.map(v => ({
                    productName: p.name,
                    variantName: v.name,
                    stock: v.quantity,
                    price: v.sellingPrice
                }))
            );
            
            const simplifiedExpenses = expenses.map(e => ({
                date: e.date,
                category: e.category,
                amount: e.amount
            }));

            const report = await generateBusinessAnalysis(
                JSON.stringify(simplifiedProducts),
                JSON.stringify(simplifiedInvoices),
                JSON.stringify(simplifiedExpenses)
            );
            setAiReport(report);
        } catch (err: any) {
            setError(err.message || 'An unknown error occurred.');
        } finally {
            setIsGenerating(false);
        }
    };


    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Reports</h2>
                <div className="flex items-center gap-2">
                    <Button variant={period === 'month' ? 'primary' : 'secondary'} onClick={() => setPeriod('month')}>This Month</Button>
                    <Button variant={period === 'year' ? 'primary' : 'secondary'} onClick={() => setPeriod('year')}>This Year</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Total Revenue" value={formatCurrency(totalRevenue)} />
                <StatCard title="Total Expenses" value={formatCurrency(totalExpenses)} />
                <StatCard 
                    title="Profit / Loss" 
                    value={formatCurrency(profitLoss)} 
                    isPositive={profitLoss >= 0} 
                />
            </div>
            
            <div className="bg-white shadow-sm rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                    Cash Flow ({period === 'month' ? 'This Month' : 'This Year'})
                </h3>
                <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis tickFormatter={(value) => `₹${value/1000}k`} />
                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                        <Legend />
                        <Bar dataKey="Revenue" fill="#22d780" />
                        <Bar dataKey="Expenses" fill="#f99f70" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
            
            {/* AI Business Insights Section */}
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-800">AI Business Insights</h2>
                    <Button onClick={handleGenerateReport} disabled={isGenerating}>
                        {isGenerating ? 'Analyzing Data...' : 'Generate AI Analysis'}
                    </Button>
                </div>
                
                {isGenerating && (
                     <div className="flex flex-col items-center justify-center text-primary-600 bg-white p-8 rounded-lg shadow-sm">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
                        <p className="mt-4 font-semibold">Our AI is analyzing your business...</p>
                        <p className="text-sm text-gray-500">This might take a moment.</p>
                    </div>
                )}
                
                {error && <p className="mt-4 text-center text-red-600 bg-red-100 p-4 rounded-md shadow-sm">{error}</p>}

                {aiReport && (
                    <div className="space-y-6">
                        {/* Overall Summary & Sales Prediction */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                             <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm">
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">Overall Summary</h3>
                                <p className="text-gray-600">{aiReport.overallSummary}</p>
                            </div>
                            <StatCard 
                                title="Predicted Sales (Next Month)" 
                                value={formatCurrency(aiReport.predictedSales.nextMonth)}
                                description={aiReport.predictedSales.insight}
                            />
                        </div>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                             {/* Restock Recommendations */}
                            <div className="bg-white p-6 rounded-lg shadow-sm">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Restock Recommendations</h3>
                                <ul className="space-y-3">
                                    {aiReport.restockRecommendations.map(item => (
                                        <li key={`${item.productName}-${item.variantName}`} className="border-b pb-3 last:border-0 last:pb-0">
                                            <p className="font-semibold text-gray-800">{item.productName} ({item.variantName})</p>
                                            <p className="text-sm text-gray-500">
                                                <span className="font-bold text-red-500">{item.currentStock}</span> units left. {item.reason}
                                            </p>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            
                            {/* Top Selling Products */}
                             <div className="bg-white p-6 rounded-lg shadow-sm">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Selling Products</h3>
                                <ul className="space-y-3">
                                    {aiReport.topSellingProducts.map(item => (
                                        <li key={`${item.productName}-${item.variantName}`} className="border-b pb-3 last:border-0 last:pb-0">
                                            <div className="flex justify-between items-center">
                                                <p className="font-semibold text-gray-800">{item.productName} ({item.variantName})</p>
                                                <p className="font-bold text-primary-600">{formatCurrency(item.totalRevenue)}</p>
                                            </div>
                                            <p className="text-sm text-gray-500">{item.unitsSold} units sold</p>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            
                            {/* Inventory Purchase Forecast */}
                             <div className="bg-white p-6 rounded-lg shadow-sm">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Inventory Purchase Forecast</h3>
                                 <ul className="space-y-3">
                                    {aiReport.inventoryForecasts.map(item => (
                                        <li key={`${item.productName}-${item.variantName}`} className="border-b pb-3 last:border-0 last:pb-0">
                                            <div className="flex justify-between items-center">
                                                <p className="font-semibold text-gray-800">{item.productName} ({item.variantName})</p>
                                                <p className="font-bold text-primary-600">Order: {item.suggestedOrderQuantity} units</p>
                                            </div>
                                            <p className="text-sm text-gray-500 mt-1">{item.reasoning}</p>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Reports;