import type { InvoiceItem } from '../types';

export const calculateInvoiceTaxes = (
    items: InvoiceItem[], 
    businessState: string, 
    clientState: string
) => {
    let subtotal = 0;
    let cgst = 0;
    let sgst = 0;
    const igst = 0; // IGST will now always be 0.

    items.forEach(item => {
        const itemSubtotal = item.quantity * item.price;
        subtotal += itemSubtotal;
        const gstAmount = (itemSubtotal * item.gstRate) / 100;

        // Always calculate SGST and CGST, regardless of state, as requested.
        sgst += gstAmount / 2;
        cgst += gstAmount / 2;
    });

    const total = subtotal + cgst + sgst;

    return { subtotal, cgst, sgst, igst, total };
};