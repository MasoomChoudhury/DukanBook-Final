import { AIReport } from "../types";

export const generateDescription = async (itemName: string): Promise<string> => {
    try {
        const response = await fetch('/api/generate-description', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ itemName }),
        });
        
        if (!response.ok) throw new Error('Failed to generate description');
        
        const data = await response.json();
        return data.description;
    } catch (error) {
        console.error("Error generating description:", error);
        return "Error generating description.";
    }
};

export const extractProductsFromInvoice = async (base64Image: string, mimeType: string) => {
    try {
        const response = await fetch('/api/extract-products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ base64Image, mimeType }),
        });
        
        if (!response.ok) throw new Error('Failed to extract products');
        
        const data = await response.json();
        return data.products;
    } catch (error) {
        console.error("Error extracting products:", error);
        throw new Error("Failed to analyze the invoice image. Please ensure it's clear and try again.");
    }
};

export const generateBusinessAnalysis = async (
    productsJson: string,
    invoicesJson: string,
    expensesJson: string
): Promise<AIReport> => {
    try {
        const response = await fetch('/api/generate-analysis', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productsJson, invoicesJson, expensesJson }),
        });
        
        if (!response.ok) throw new Error('Failed to generate analysis');
        
        return await response.json();
    } catch (error) {
        console.error("Error generating business analysis:", error);
        throw new Error("Failed to generate AI analysis. The model may be temporarily unavailable. Please try again later.");
    }
};
