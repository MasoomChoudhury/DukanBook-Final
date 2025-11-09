import React from 'react';
import type { View } from '../types';
import { logout } from '../services/authService';

interface SidebarProps {
    currentView: View;
    setCurrentView: (view: View) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView }) => {
    const navItems: { id: View; label: string; icon: React.ReactNode }[] = [
        {
            id: 'dashboard',
            label: 'Dashboard',
            icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>,
        },
        {
            id: 'invoices',
            label: 'Invoices',
            icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>,
        },
         {
            id: 'payments',
            label: 'Payments',
            icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/></svg>,
        },
         {
            id: 'expenses',
            label: 'Expenses',
            icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0z"/></svg>,
        },
        {
            id: 'clients',
            label: 'Clients',
            icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>,
        },
        {
            id: 'products',
            label: 'Products',
            icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>,
        },
        {
            id: 'scanner',
            label: 'Inventory Scanner',
            icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6.364 1.636l-.707.707M20 12h-1M4 12H3m1.636 6.364l.707-.707M12 20v-1m-6.364-1.636l.707-.707m12.728 0l-.707.707M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>,
        },
         {
            id: 'reports',
            label: 'Reports',
            icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>,
        },
    ];

    const handleLogout = async () => {
        if (window.confirm('Are you sure you want to log out?')) {
            await logout();
        }
    };

    return (
        <aside className="w-64 bg-white shadow-md flex-shrink-0 hidden md:block flex flex-col justify-between">
            <div>
                <div className="p-4">
                    <div className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" className="text-primary-700">
                            <g fill="none">
                                <rect width="16" height="18" x="4" y="3" fill="currentColor" fillOpacity="0.25" rx="2"/>
                                <path stroke="currentColor" strokeLinecap="round" d="M8.5 6.5h7m-7 3h4m-4 3h6" strokeWidth="1.5"/>
                                <path fill="currentColor" d="M4 19a2 2 0 0 1 2-2h11c.932 0 1.398 0 1.765-.152a2 2 0 0 0 1.083-1.083C20 15.398 20 14.932 20 14v3c0 1.886 0 2.828-.586 3.414S17.886 21 16 21H6a2 2 0 0 1-2-2"/>
                            </g>
                        </svg>
                        <h1 className="text-2xl font-bold text-primary-700">DukanBook</h1>
                    </div>
                </div>
                <nav className="mt-4">
                    <ul>
                        {navItems.map(item => (
                            <li key={item.id} className="px-2">
                                <button
                                    onClick={() => setCurrentView(item.id)}
                                    className={`flex items-center w-full px-4 py-3 my-1 rounded-lg transition-colors duration-200 ${
                                        currentView === item.id
                                            ? 'bg-primary-100 text-primary-700 font-semibold'
                                            : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                                >
                                    <span className="mr-3">{item.icon}</span>
                                    {item.label}
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>
             <div className="p-4 mt-auto">
                <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-3 my-1 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors duration-200"
                >
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                    Logout
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;