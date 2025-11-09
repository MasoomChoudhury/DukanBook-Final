import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import Button from './common/Button';
import Modal from './common/Modal';
import type { Expense } from '../types';

const ExpenseForm: React.FC<{ expense: Expense | null; onClose: () => void }> = ({ expense, onClose }) => {
    const { addExpense, updateExpense } = useData();
    const [formData, setFormData] = useState({
        date: expense?.date || new Date().toISOString().split('T')[0],
        description: expense?.description || '',
        category: expense?.category || 'Other',
        amount: expense?.amount || 0,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'number' ? parseFloat(value) || 0 : value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (expense) {
            await updateExpense({ ...formData, id: expense.id });
        } else {
            await addExpense(formData);
        }
        onClose();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Date</label>
                    <input name="date" type="date" value={formData.date} onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900"/>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Amount</label>
                    <input name="amount" type="number" value={formData.amount} onChange={handleChange} placeholder="Amount" required className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900"/>
                </div>
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <select name="category" value={formData.category} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900">
                    <option>Inventory</option>
                    <option>Marketing</option>
                    <option>Utilities</option>
                    <option>Salary</option>
                    <option>Other</option>
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <input name="description" value={formData.description} onChange={handleChange} placeholder="Expense Description" required className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900"/>
            </div>
            <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                <Button type="submit">{expense ? 'Update Expense' : 'Add Expense'}</Button>
            </div>
        </form>
    );
};

const ExpenseList: React.FC = () => {
    const { expenses, deleteExpense } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const handleNewExpense = () => {
        setSelectedExpense(null);
        setIsModalOpen(true);
    };

    const handleEditExpense = (expense: Expense) => {
        setSelectedExpense(expense);
        setIsModalOpen(true);
    };

    const handleDeleteExpense = (id: string) => {
        if (window.confirm('Are you sure you want to delete this expense record?')) {
            const executeDelete = async () => {
                try {
                    await deleteExpense(id);
                } catch (error: any) {
                    console.error("Failed to delete expense:", error);
                    alert(`Error: ${error.message}` || "An unknown error occurred while deleting the expense record.");
                }
            };
            executeDelete();
        }
    };
    
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
    };

    const filteredExpenses = useMemo(() => {
        return expenses.filter(expense => {
            const term = searchTerm.toLowerCase().trim();
            if (!term) return true;

            const descriptionMatch = expense.description.toLowerCase().includes(term);
            const categoryMatch = expense.category.toLowerCase().includes(term);

            return descriptionMatch || categoryMatch;
        });
    }, [expenses, searchTerm]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-4">
                <h2 className="text-2xl font-bold text-gray-800">Expenses</h2>
                <Button onClick={handleNewExpense}>Record New Expense</Button>
            </div>

            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                     <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                </div>
                <input
                    type="text"
                    placeholder="Search by description or category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 p-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-primary-500 focus:border-primary-500"
                    aria-label="Search expenses"
                />
            </div>

            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3">Date</th>
                                <th scope="col" className="px-6 py-3">Description</th>
                                <th scope="col" className="px-6 py-3">Category</th>
                                <th scope="col" className="px-6 py-3 text-right">Amount</th>
                                <th scope="col" className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredExpenses.map((expense) => (
                                <tr key={expense.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4">{new Date(expense.date).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 font-medium text-gray-900">{expense.description}</td>
                                    <td className="px-6 py-4">{expense.category}</td>
                                    <td className="px-6 py-4 text-right font-semibold">{formatCurrency(expense.amount)}</td>
                                    <td className="px-6 py-4 flex items-center space-x-2">
                                        <Button variant="secondary" onClick={() => handleEditExpense(expense)} className="p-2" aria-label="Edit Expense">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z"></path></svg>
                                        </Button>
                                        <Button variant="secondary" onClick={() => handleDeleteExpense(expense.id)} className="p-2" aria-label="Delete Expense">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {expenses.length > 0 && filteredExpenses.length === 0 && (
                    <p className="p-6 text-center text-gray-500">No expenses match your search for "{searchTerm}".</p>
                )}
                {expenses.length === 0 && <p className="p-6 text-center text-gray-500">No expenses recorded yet.</p>}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedExpense ? 'Edit Expense' : 'Record New Expense'}>
                <ExpenseForm expense={selectedExpense} onClose={() => setIsModalOpen(false)} />
            </Modal>
        </div>
    );
};

export default ExpenseList;