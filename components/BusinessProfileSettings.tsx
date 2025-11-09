import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import Button from './common/Button';
import type { BusinessProfile } from '../types';
import { INDIAN_STATES } from '../constants';

const BusinessProfileSettings: React.FC = () => {
    const { businessProfile, updateBusinessProfile } = useData();
    const [formData, setFormData] = useState<BusinessProfile>({
        name: '',
        address: '',
        gstin: '',
        contact: '',
        state: INDIAN_STATES[0],
    });
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        if (businessProfile) {
            setFormData(businessProfile);
        }
    }, [businessProfile]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await updateBusinessProfile(formData);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
        } catch (error) {
            console.error("Failed to update profile:", error);
            alert("An error occurred while saving your profile.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-800">Business Profile</h2>
            <p className="text-gray-600">This information will appear on your invoices. Make sure it's accurate.</p>
            
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-sm space-y-6">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Business Name</label>
                    <input id="name" name="name" value={formData.name} onChange={handleChange} required className="mt-1 w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900"/>
                </div>
                 <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
                    <input id="address" name="address" value={formData.address} onChange={handleChange} required className="mt-1 w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900"/>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="gstin" className="block text-sm font-medium text-gray-700">GSTIN</label>
                        <input id="gstin" name="gstin" value={formData.gstin} onChange={handleChange} required className="mt-1 w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900"/>
                    </div>
                    <div>
                        <label htmlFor="contact" className="block text-sm font-medium text-gray-700">Contact (Email/Phone)</label>
                        <input id="contact" name="contact" value={formData.contact} onChange={handleChange} required className="mt-1 w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900"/>
                    </div>
                </div>
                <div>
                    <label htmlFor="state" className="block text-sm font-medium text-gray-700">State (Place of Supply)</label>
                    <select id="state" name="state" value={formData.state} onChange={handleChange} required className="mt-1 w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900">
                        {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>

                <div className="flex justify-end items-center gap-4 pt-4 border-t">
                    {showSuccess && <p className="text-green-600 text-sm">Profile saved successfully!</p>}
                    <Button type="submit" disabled={isSaving}>
                        {isSaving ? 'Saving...' : 'Save Profile'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default BusinessProfileSettings;
