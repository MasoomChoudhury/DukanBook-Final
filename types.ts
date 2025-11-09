import { ReactNode } from "react";

export type View = 'dashboard' | 'invoices' | 'clients' | 'products' | 'scanner' | 'payments' | 'expenses' | 'reports' | 'settings';

export interface Client {
    id: string;
    name: string;
    gstin: string;
    address: string;
    state: string;
    contact: string;
}

export interface ProductVariant {
    id: string;
    name: string;
    costPrice: number;
    sellingPrice: number;
    quantity: number;
}

export interface Product {
    id: string;
    name: string;
    description: string;
    hsnSacCode: string;
    gstRate: number; // GST percentage
    variants: ProductVariant[];
}

export interface InvoiceItem {
    id: string; // Unique ID for the item within an invoice
    product: Product;
    variant: ProductVariant;
    description: string;
    quantity: number; // Quantity for this invoice
    price: number; // Selling price per unit for this invoice
    gstRate: number; // GST rate at the time of sale
}

export interface Invoice {
    id: string;
    invoiceNumber: string;
    client: Client;
    items: InvoiceItem[];
    issueDate: string; // YYYY-MM-DD
    dueDate: string; // YYYY-MM-DD
    status: 'Paid' | 'Unpaid' | 'Overdue' | 'Partially Paid';
    subtotal: number;
    cgst: number;
    sgst: number;
    igst: number;
    total: number;
    paidAmount: number;
}

export interface Payment {
    id:string;
    invoiceId: string | null;
    clientId: string;
    amount: number;
    date: string; // YYYY-MM-DD
    mode: 'Cash' | 'Bank Transfer' | 'UPI' | 'Other';
    notes?: string;
}

export interface Expense {
    id: string;
    date: string; // YYYY-MM-DD
    category: 'Inventory' | 'Marketing' | 'Utilities' | 'Salary' | 'Other';
    description: string;
    amount: number;
}


export interface BusinessProfile {
    name: string;
    address: string;
    gstin: string;
    contact: string;
    state: string;
}

// AI Report Types
export interface RestockRecommendation {
    productName: string;
    variantName: string;
    currentStock: number;
    reason: string;
}

export interface TopSellingProduct {
    productName: string;
    variantName: string;
    unitsSold: number;
    totalRevenue: number;
}

export interface InventoryForecast {
    productName: string;
    variantName: string;
    suggestedOrderQuantity: number;
    reasoning: string;
}

export interface PredictedSales {
    nextMonth: number;
    insight: string;
}

export interface AIReport {
    restockRecommendations: RestockRecommendation[];
    topSellingProducts: TopSellingProduct[];
    inventoryForecasts: InventoryForecast[];
    predictedSales: PredictedSales;
    overallSummary: string;
}
