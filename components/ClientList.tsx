import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import Button from './common/Button';
import Modal from './common/Modal';
import type { Client } from '../types';
import { INDIAN_STATES } from '../constants';

const ClientForm: React.FC<{ client: Client | null; onClose: () => void }> = ({ client, onClose }) => {
    const { addClient, updateClient } = useData();
    const [formData, setFormData] = useState<Omit<Client, 'id'>>({
        name: client?.name || '',
        gstin: client?.gstin || '',
        address: client?.address || '',
        state: client?.state || INDIAN_STATES[0],
        contact: client?.contact || '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (client) {
                await updateClient({ ...formData, id: client.id });
            } else {
                await addClient(formData);
            }
            onClose();
        } catch (error) {
            console.error("Failed to save client:", error);
            alert("There was an error saving the client.");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <input name="name" value={formData.name} onChange={handleChange} placeholder="Client Name" required className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900"/>
            <input name="gstin" value={formData.gstin} onChange={handleChange} placeholder="GSTIN" required className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900"/>
            <input name="address" value={formData.address} onChange={handleChange} placeholder="Address" required className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900"/>
            <select name="state" value={formData.state} onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900">
                {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <input name="contact" value={formData.contact} onChange={handleChange} placeholder="Contact Info" required className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900"/>
            <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                <Button type="submit">{client ? 'Update Client' : 'Add Client'}</Button>
            </div>
        </form>
    );
};


const ClientList: React.FC = () => {
    const { clients, deleteClient } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const handleNewClient = () => {
        setSelectedClient(null);
        setIsModalOpen(true);
    };

    const handleEditClient = (client: Client) => {
        setSelectedClient(client);
        setIsModalOpen(true);
    };

    const handleDeleteClient = (id: string) => {
        if (window.confirm('Are you sure you want to delete this client?')) {
            const executeDelete = async () => {
                try {
                    await deleteClient(id);
                } catch (error: any) {
                    console.error("Failed to delete client:", error);
                    alert(`Error: ${error.message}` || "An unknown error occurred while deleting the client.");
                }
            };
            executeDelete();
        }
    };

    const filteredClients = useMemo(() => {
        return clients.filter(client => {
            const term = searchTerm.toLowerCase().trim();
            if (!term) return true;

            const nameMatch = client.name.toLowerCase().includes(term);
            const gstinMatch = client.gstin.toLowerCase().includes(term);
            const stateMatch = client.state.toLowerCase().includes(term);

            return nameMatch || gstinMatch || stateMatch;
        });
    }, [clients, searchTerm]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-4">
                <h2 className="text-2xl font-bold text-gray-800">Clients</h2>
                <Button onClick={handleNewClient}>Add New Client</Button>
            </div>
            
             <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                     <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                </div>
                <input
                    type="text"
                    placeholder="Search by name, GSTIN, or state..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 p-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-primary-500 focus:border-primary-500"
                    aria-label="Search clients"
                />
            </div>

             <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3">Name</th>
                                <th scope="col" className="px-6 py-3">GSTIN</th>
                                <th scope="col" className="px-6 py-3">State</th>
                                <th scope="col" className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredClients.map((client) => (
                                <tr key={client.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">{client.name}</td>
                                    <td className="px-6 py-4">{client.gstin}</td>
                                    <td className="px-6 py-4">{client.state}</td>
                                    <td className="px-6 py-4 flex items-center space-x-2">
                                        <Button variant="secondary" onClick={() => handleEditClient(client)} className="p-2" aria-label="Edit Client">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z"></path></svg>
                                        </Button>
                                        <Button variant="secondary" onClick={() => handleDeleteClient(client.id)} className="p-2" aria-label="Delete Client">
                                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                 {clients.length > 0 && filteredClients.length === 0 && (
                    <p className="p-6 text-center text-gray-500">No clients match your search for "{searchTerm}".</p>
                )}
                 {clients.length === 0 && <p className="p-6 text-center text-gray-500">No clients found. Add one to get started!</p>}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedClient ? 'Edit Client' : 'Add New Client'}>
                <ClientForm client={selectedClient} onClose={() => setIsModalOpen(false)} />
            </Modal>
        </div>
    );
};

export default ClientList;