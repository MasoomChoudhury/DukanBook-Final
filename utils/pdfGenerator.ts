import jsPDF from 'jspdf';
import 'jspdf-autotable';
import type { Invoice, BusinessProfile } from '../types';

// Helper function to convert numbers to Indian currency words
const numberToWords = (num: number): string => {
    const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    const inWords = (n: number): string => {
        let str = '';
        if (n > 99) {
            str += a[Math.floor(n / 100)] + 'Hundred ';
            n %= 100;
        }
        if (n > 19) {
            str += b[Math.floor(n / 10)] + ' ' + a[n % 10];
        } else {
            str += a[n];
        }
        return str;
    };

    const numStr = num.toFixed(2);
    const [integerPart, decimalPart] = numStr.split('.').map(Number);
    
    let words = '';
    if (integerPart > 0) {
        const crore = Math.floor(integerPart / 10000000);
        const lakh = Math.floor((integerPart % 10000000) / 100000);
        const thousand = Math.floor((integerPart % 100000) / 1000);
        const hundreds = integerPart % 1000;
        
        if (crore > 0) words += inWords(crore) + 'Crore ';
        if (lakh > 0) words += inWords(lakh) + 'Lakh ';
        if (thousand > 0) words += inWords(thousand) + 'Thousand ';
        if (hundreds > 0) words += inWords(hundreds);

        words += 'Rupees ';
    }
    
    if (decimalPart > 0) {
        words += 'and ' + inWords(decimalPart) + 'Paise ';
    }
    
    return words.trim() + ' Only';
};

export const generateInvoicePDF = (invoice: Invoice, businessProfile: BusinessProfile) => {
    const doc = new jsPDF();

    // Set the font to Noto Sans, loaded from Google Fonts in index.html
    doc.setFont('Noto Sans');
    
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    const primaryColor = '#139656'; // primary-700 from tailwind config

    // --- Header ---
    doc.setFillColor(primaryColor);
    doc.rect(0, 0, pageWidth, 30, 'F');
    doc.setFont('Noto Sans', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.text('INVOICE', pageWidth - margin, 20, { align: 'right' });

    // --- Business Details (Top Left) ---
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.text(businessProfile.name, margin, 45);

    doc.setFont('Noto Sans', 'normal');
    doc.setFontSize(10);
    doc.text(businessProfile.address, margin, 52);
    doc.text(`GSTIN: ${businessProfile.gstin}`, margin, 58);
    doc.text(`Contact: ${businessProfile.contact}`, margin, 64);
    
    // --- Invoice Details (Top Right) ---
    const rightColX = pageWidth / 2 + 20;
    doc.setFont('Noto Sans', 'bold');
    doc.text('Invoice #:', rightColX, 45);
    doc.text('Issue Date:', rightColX, 52);
    doc.text('Due Date:', rightColX, 59);
    
    doc.setFont('Noto Sans', 'normal');
    doc.text(invoice.invoiceNumber, rightColX + 30, 45);
    doc.text(new Date(invoice.issueDate).toLocaleDateString(), rightColX + 30, 52);
    doc.text(new Date(invoice.dueDate).toLocaleDateString(), rightColX + 30, 59);

    // --- Bill To Section ---
    doc.setDrawColor(200);
    doc.line(margin, 75, pageWidth - margin, 75); 
    
    doc.setFont('Noto Sans', 'bold');
    doc.setTextColor(100);
    doc.text('BILL TO', margin, 85);
    doc.setTextColor(0);
    doc.setFont('Noto Sans', 'normal');
    doc.setFontSize(11);
    doc.text(invoice.client.name, margin, 92);
    doc.setFontSize(10);
    doc.text(invoice.client.address, margin, 98);
    doc.text(`GSTIN: ${invoice.client.gstin}`, margin, 104);
    doc.text(`Place of Supply: ${invoice.client.state}`, margin, 110);
    
    // --- Items Table ---
    const tableHead = [['#', 'Item & Description', 'HSN/SAC', 'Qty', 'Rate', 'Amount']];
    const tableBody = invoice.items.map((item, index) => {
        let itemName = item.product.name;
        if (item.product.variants.length > 1 || item.variant.name !== 'Default') {
            itemName += ` (${item.variant.name})`;
        }
        
        return [
            index + 1,
            `${itemName}\n${item.description || ''}`,
            item.product.hsnSacCode,
            item.quantity,
            `₹ ${item.price.toFixed(2)}`,
            `₹ ${(item.quantity * item.price).toFixed(2)}`
        ];
    });

    doc.autoTable({
        head: tableHead,
        body: tableBody,
        startY: 120,
        theme: 'striped',
        headStyles: { fillColor: [19, 150, 86], font: 'Noto Sans' },
        styles: {
            font: 'Noto Sans',
            cellPadding: 3, 
            fontSize: 10, 
            valign: 'middle' 
        },
        didParseCell: function (data) {
            // For multi-line description cells
            if (data.column.dataKey === 1 && data.cell.section === 'body') {
                data.cell.styles.fontStyle = 'normal';
            }
        }
    });
    
    // --- Post-Table Section: Totals and Amount in Words ---
    let finalY = (doc as any).lastAutoTable.finalY + 10;
    
    // Amount in Words
    doc.setFontSize(9);
    doc.setFont('Noto Sans', 'bold');
    doc.text('Amount in Words:', margin, finalY);
    doc.setFont('Noto Sans', 'normal');
    doc.text(numberToWords(invoice.total), margin, finalY + 5, { maxWidth: pageWidth / 2 - margin });

    // --- Totals Box (Recalculated for better alignment) ---
    const totalsBoxWidth = 85;
    const totalsBoxHeight = 42;
    const totalsXStart = pageWidth - margin - totalsBoxWidth;
    const valueX = pageWidth - margin - 5; // Right-aligned position for values
    const labelX = totalsXStart + 5; // Left-aligned position for labels

    doc.setDrawColor(220);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(totalsXStart, finalY - 5, totalsBoxWidth, totalsBoxHeight, 3, 3, 'FD');

    let currentY = finalY;
    doc.setFontSize(11);
    doc.setFont('Noto Sans', 'bold');
    
    doc.text('Subtotal:', labelX, currentY);
    doc.text(`₹ ${invoice.subtotal.toFixed(2)}`, valueX, currentY, { align: 'right' });
    currentY += 7;

    if (invoice.sgst > 0) {
        doc.text('SGST:', labelX, currentY);
        doc.text(`₹ ${invoice.sgst.toFixed(2)}`, valueX, currentY, { align: 'right' });
        currentY += 7;
    }
    if (invoice.cgst > 0) {
        doc.text('CGST:', labelX, currentY);
        doc.text(`₹ ${invoice.cgst.toFixed(2)}`, valueX, currentY, { align: 'right' });
        currentY += 7;
    }

    doc.setDrawColor(180);
    doc.line(totalsXStart + 2, currentY - 3, pageWidth - margin - 2, currentY - 3); 
    
    doc.setFontSize(14);
    doc.setTextColor(primaryColor);
    doc.text('Total:', labelX, currentY + 3);
    doc.text(`₹ ${invoice.total.toFixed(2)}`, valueX, currentY + 3, { align: 'right' });
    doc.setTextColor(0);


    // --- Footer ---
    const pageHeight = doc.internal.pageSize.getHeight();
    const footerY = pageHeight - 40;
    doc.setDrawColor(200);
    doc.line(margin, footerY, pageWidth - margin, footerY); 
    
    doc.setFontSize(9);
    doc.setFont('Noto Sans', 'bold');
    doc.text('Terms & Conditions', margin, footerY + 8);
    doc.setFont('Noto Sans', 'normal');
    doc.text('1. Payment is due within 15 days.', margin, footerY + 13);
    
    doc.setFont('Noto Sans', 'bold');
    doc.text('Bank Details', rightColX, footerY + 8);
    doc.setFont('Noto Sans', 'normal');
    doc.text('Bank: Your Bank Name, IFSC: YOURIFSC', rightColX, footerY + 13);
    
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text('Thank you for your business!', pageWidth / 2, pageHeight - 10, { align: 'center' });

    doc.output('dataurlnewwindow');
};
