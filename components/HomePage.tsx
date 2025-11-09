import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Dashboard from './Dashboard';
import InvoiceList from './InvoiceList';
import ClientList from './ClientList';
import ProductList from './ProductList';
import InventoryScanner from './InventoryScanner';
import Reports from './Reports';
import ExpenseList from './ExpenseList';
import PaymentList from './PaymentList';
import BusinessProfileSettings from './BusinessProfileSettings';
import type { View } from '../types';
import { useData } from '../context/DataContext';

const HomePage: React.FC = () => {
    const [currentView, setCurrentView] = useState<View>('dashboard');
    const { loadingData } = useData();

    const renderView = () => {
        switch (currentView) {
            case 'dashboard':
                return <Dashboard />;
            case 'invoices':
                return <InvoiceList />;
            case 'clients':
                return <ClientList />;
            case 'products':
                return <ProductList />;
            case 'scanner':
                return <InventoryScanner />;
            case 'reports':
                return <Reports />;
            case 'expenses':
                return <ExpenseList />;
            case 'payments':
                return <PaymentList />;
            case 'settings':
                return <BusinessProfileSettings />;
            default:
                return <Dashboard />;
        }
    };

    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
            <main className="flex-1 p-6 md:p-8 lg:p-10 overflow-y-auto">
                {loadingData ? (
                     <div className="flex items-center justify-center h-full">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-600"></div>
                    </div>
                ) : renderView()}
            </main>
        </div>
    );
};

export default HomePage;
