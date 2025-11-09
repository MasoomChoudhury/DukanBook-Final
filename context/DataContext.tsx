import React, { createContext, useContext, ReactNode, useState, useEffect, useCallback } from 'react';
import { db } from '../firebaseConfig';
import { useAuth } from './AuthContext';
import type { Invoice, Client, Product, BusinessProfile, Payment, Expense, ProductVariant } from '../types';
import firebase from 'firebase/compat/app';

interface DataContextProps {
    invoices: Invoice[];
    clients: Client[];
    products: Product[];
    payments: Payment[];
    expenses: Expense[];
    businessProfile: BusinessProfile | null;
    addInvoice: (invoice: Omit<Invoice, 'id' | 'paidAmount'>) => Promise<void>;
    updateInvoice: (invoice: Invoice) => Promise<void>;
    deleteInvoice: (id: string) => Promise<void>;
    addClient: (client: Omit<Client, 'id'>) => Promise<Client>;
    updateClient: (client: Client) => Promise<void>;
    deleteClient: (id: string) => Promise<void>;
    addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
    updateProduct: (product: Product) => Promise<void>;
    deleteProduct: (id: string) => Promise<void>;
    batchUpdateProducts: (productsToUpdate: Omit<Product, 'id'>[]) => Promise<void>;
    addPayment: (payment: Omit<Payment, 'id'>) => Promise<void>;
    updatePayment: (payment: Payment) => Promise<void>;
    deletePayment: (id: string) => Promise<void>;
    addExpense: (expense: Omit<Expense, 'id'>) => Promise<void>;
    updateExpense: (expense: Expense) => Promise<void>;
    deleteExpense: (id: string) => Promise<void>;
    updateBusinessProfile: (profile: BusinessProfile) => Promise<void>;
    getNextInvoiceNumber: () => string;
    loadingData: boolean;
}

const DataContext = createContext<DataContextProps | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null);
    const [loadingData, setLoadingData] = useState(true);

    const refetchExpenses = useCallback(async () => {
        if (!user) return;
        const expensesSnap = await db.collection('expenses').where("userId", "==", user.uid).get();
        setExpenses(expensesSnap.docs.map(d => ({ ...d.data(), id: d.id } as Expense)));
    }, [user]);

    useEffect(() => {
        if (!user) {
            setLoadingData(false);
            setInvoices([]); setClients([]); setProducts([]); setPayments([]); setExpenses([]); setBusinessProfile(null);
            return;
        }

        const fetchData = async () => {
            setLoadingData(true);
            try {
                const q = (col: string) => db.collection(col).where("userId", "==", user.uid);
                const [invoiceSnap, clientSnap, productSnap, paymentSnap, expenseSnap, profileDoc] = await Promise.all([
                    q('invoices').get(), q('clients').get(), q('products').get(),
                    q('payments').get(), q('expenses').get(), db.collection('users').doc(user.uid).get()
                ]);
                setInvoices(invoiceSnap.docs.map(d => ({ ...d.data(), id: d.id } as Invoice)));
                setClients(clientSnap.docs.map(d => ({ ...d.data(), id: d.id } as Client)));
                setProducts(productSnap.docs.map(d => {
                    const data = d.data();
                    let variants: ProductVariant[] = data.variants || [];

                    // Migration logic for old product structure without variants
                    if (variants.length === 0 && data.sellingPrice !== undefined) {
                        variants.push({
                            id: `default_${d.id}`, // A consistent ID
                            name: 'Default',
                            costPrice: data.costPrice ?? 0,
                            sellingPrice: data.sellingPrice ?? (data as any).price ?? 0,
                            quantity: data.quantity ?? 0,
                        });
                    }
                    
                    const product: Product = {
                        id: d.id,
                        name: data.name,
                        description: data.description,
                        hsnSacCode: data.hsnSacCode,
                        gstRate: data.gstRate ?? 0,
                        variants: variants,
                    };
                    return product;
                }));
                setPayments(paymentSnap.docs.map(d => ({ ...d.data(), id: d.id } as Payment)));
                setExpenses(expenseSnap.docs.map(d => ({ ...d.data(), id: d.id } as Expense)));
                if (profileDoc.exists) setBusinessProfile(profileDoc.data()!.businessProfile as BusinessProfile);
            } catch (error) { console.error("Error fetching data:", error); } 
            finally { setLoadingData(false); }
        };
        fetchData();
    }, [user]);

    const getNextInvoiceNumber = useCallback(() => {
        const lastInvoice = invoices
            .filter(inv => inv.invoiceNumber.startsWith('INV-'))
            .sort((a, b) => {
                const numA = parseInt(a.invoiceNumber.replace('INV-', ''), 10);
                const numB = parseInt(b.invoiceNumber.replace('INV-', ''), 10);
                return numA - numB;
            }).pop();
        
        if (lastInvoice) {
            const lastNum = parseInt(lastInvoice.invoiceNumber.replace('INV-', ''), 10);
            return `INV-${lastNum + 1}`;
        }
        return 'INV-1001';
    }, [invoices]);

    const recalculateInvoiceStatus = useCallback(async (invoiceId: string) => {
        if (!user) return;
        
        const invoiceRef = db.collection('invoices').doc(invoiceId);

        // FIX: Firestore client-side transactions do not support queries.
        // The query for payments must be performed outside the transaction. This also
        // resolves the error from incorrectly using `transaction.get` on a Query object
        // and the subsequent error on `paymentsSnapshot.docs`.
        const paymentsQuery = db.collection('payments').where('invoiceId', '==', invoiceId).where('userId', '==', user.uid);
        const paymentsSnapshot = await paymentsQuery.get();
        const relevantPayments = paymentsSnapshot.docs.map(d => d.data() as Payment);

        await db.runTransaction(async (transaction) => {
            const invoiceDoc = await transaction.get(invoiceRef);
            if (!invoiceDoc.exists) {
                 console.error(`Invoice with ID ${invoiceId} not found during status recalculation.`);
                 return;
            }
            const invoice = invoiceDoc.data() as Invoice;

            const totalPaid = relevantPayments.reduce((sum, p) => sum + p.amount, 0);
            
            let newStatus: Invoice['status'];
            const today = new Date().toISOString().split('T')[0];

            if (totalPaid >= invoice.total) {
                newStatus = 'Paid';
            } else if (totalPaid > 0) {
                newStatus = invoice.dueDate < today ? 'Overdue' : 'Partially Paid';
            } else { // totalPaid <= 0
                newStatus = invoice.dueDate < today ? 'Overdue' : 'Unpaid';
            }
            
            const updatedInvoiceData = { paidAmount: totalPaid, status: newStatus };
            transaction.update(invoiceRef, updatedInvoiceData);

            // Update local state
            setInvoices(prev => prev.map(i => i.id === invoiceId ? { ...i, ...updatedInvoiceData } : i));
        });
    }, [user]);

    const addInventoryExpense = async (productsAdded: { name: string, quantity: number, cost: number }[]) => {
        if (!user) throw new Error("User not authenticated");
        if (productsAdded.length === 0) return;

        const today = new Date().toISOString().split('T')[0];
        const totalCost = productsAdded.reduce((sum, p) => sum + (p.quantity * p.cost), 0);
        const descriptionUpdate = productsAdded.map(p => `${p.quantity} x ${p.name}`).join(', ');

        const expenseQuery = db.collection('expenses')
            .where("userId", "==", user.uid)
            .where("date", "==", today)
            .where("category", "==", "Inventory");
        const expenseSnap = await expenseQuery.get();
        const existingExpenseDoc = expenseSnap.empty ? null : expenseSnap.docs[0];
        
        await db.runTransaction(async (transaction) => {
            if (existingExpenseDoc) {
                const expenseRef = db.collection('expenses').doc(existingExpenseDoc.id);
                const currentAmount = existingExpenseDoc.data().amount || 0;
                const currentDescription = existingExpenseDoc.data().description || `Inventory Purchase`;
                transaction.update(expenseRef, {
                    amount: currentAmount + totalCost,
                    description: `${currentDescription}; ${descriptionUpdate}`
                });
            } else {
                const newExpenseRef = db.collection('expenses').doc();
                transaction.set(newExpenseRef, {
                    userId: user.uid,
                    date: today,
                    category: 'Inventory',
                    description: `Inventory Purchase: ${descriptionUpdate}`,
                    amount: totalCost
                });
            }
        });
        await refetchExpenses();
    };


    // Generic Firestore CRUD helpers
    const addDocWithUserId = async <T extends { id: string }>(col: string, data: Omit<T, 'id'>) => {
        if (!user) throw new Error("User not authenticated");
        const docRef = await db.collection(col).add({ ...data, userId: user.uid });
        return { ...data, id: docRef.id } as T;
    };

    const updateDocById = async <T extends { id: string }>(col: string, data: T) => {
        if (!user) throw new Error("User not authenticated");
        const { id, ...rest } = data;
        await db.collection(col).doc(id).update({ ...rest, userId: user.uid });
    };

    const deleteDocById = async (col: string, id: string) => {
        if (!user) throw new Error("User not authenticated");
        await db.collection(col).doc(id).delete();
    };

    // Implementations
    const addClient = async (data: Omit<Client, 'id'>): Promise<Client> => { 
        const newClient = await addDocWithUserId('clients', data); 
        setClients(prev => [...prev, newClient]); 
        return newClient;
    };
    const updateClient = async (data: Client) => { await updateDocById('clients', data); setClients(prev => prev.map(c => c.id === data.id ? data : c)); };
    const deleteClient = async (id: string) => {
        const isClientInUse = invoices.some(invoice => invoice.client.id === id);
        if (isClientInUse) {
            throw new Error('This client cannot be deleted as they are associated with one or more invoices.');
        }
        await deleteDocById('clients', id);
        setClients(prev => prev.filter(c => c.id !== id));
    };

    const addProduct = async (data: Omit<Product, 'id'>) => {
        const newProduct = await addDocWithUserId('products', data);
        setProducts(prev => [...prev, newProduct]);
        const inventoryExpenses = data.variants
            .filter(v => v.quantity > 0 && v.costPrice > 0)
            .map(v => ({ name: `${data.name} (${v.name})`, quantity: v.quantity, cost: v.costPrice }));
        if (inventoryExpenses.length > 0) {
            await addInventoryExpense(inventoryExpenses);
        }
    };
    const updateProduct = async (data: Product) => {
        const oldProduct = products.find(p => p.id === data.id);
        await updateDocById('products', data);
        setProducts(prev => prev.map(p => p.id === data.id ? data : p));

        if (oldProduct) {
             const inventoryExpenses = data.variants.flatMap(newVariant => {
                const oldVariant = oldProduct.variants.find(v => v.id === newVariant.id);
                const quantityIncrease = newVariant.quantity - (oldVariant?.quantity || 0);
                 if (quantityIncrease > 0 && newVariant.costPrice > 0) {
                    return [{ name: `${data.name} (${newVariant.name})`, quantity: quantityIncrease, cost: newVariant.costPrice }];
                }
                return [];
            });
            if (inventoryExpenses.length > 0) {
                await addInventoryExpense(inventoryExpenses);
            }
        }
    };
    
    const deleteProduct = async (id: string) => {
        const isProductInUse = invoices.some(invoice => 
            invoice.items.some(item => item.product.id === id)
        );

        if (isProductInUse) {
            throw new Error('This product cannot be deleted as it is part of one or more invoices. Please remove it from all invoices first.');
        }

        await deleteDocById('products', id);
        setProducts(prev => prev.filter(p => p.id !== id));
    };

    const addExpense = async (data: Omit<Expense, 'id'>) => { const newExpense = await addDocWithUserId('expenses', data); setExpenses(prev => [...prev, newExpense]); };
    const updateExpense = async (data: Expense) => { await updateDocById('expenses', data); setExpenses(prev => prev.map(e => e.id === data.id ? data : e)); };
    const deleteExpense = async (id: string) => {
        const expenseExists = expenses.some(e => e.id === id);
        if (!expenseExists) {
            throw new Error("Could not find the expense to delete. It may have already been removed.");
        }
        await deleteDocById('expenses', id); 
        setExpenses(prev => prev.filter(e => e.id !== id)); 
    };

    const addPayment = async (data: Omit<Payment, 'id'>) => {
        const newPayment = await addDocWithUserId('payments', data);
        setPayments(prev => [...prev, newPayment]);
        if (data.invoiceId) await recalculateInvoiceStatus(data.invoiceId);
    };
    const updatePayment = async (data: Payment) => {
        const oldPayment = payments.find(p => p.id === data.id);
        await updateDocById('payments', data);
        setPayments(prev => prev.map(p => p.id === data.id ? data : p));
        if (oldPayment?.invoiceId && oldPayment.invoiceId !== data.invoiceId) await recalculateInvoiceStatus(oldPayment.invoiceId);
        if (data.invoiceId) await recalculateInvoiceStatus(data.invoiceId);
    };
    const deletePayment = async (id: string) => {
        const paymentToDelete = payments.find(p => p.id === id);
        if (!paymentToDelete) {
            throw new Error("Could not find the payment to delete. It may have already been removed.");
        }
        await deleteDocById('payments', id);
        setPayments(prev => prev.filter(p => p.id !== id));
        if (paymentToDelete?.invoiceId) await recalculateInvoiceStatus(paymentToDelete.invoiceId);
    };

    // Transactional Invoice/Product updates
    const addInvoice = async (invoiceData: Omit<Invoice, 'id' | 'paidAmount'>) => {
        if (!user) throw new Error("User not authenticated");
        const newInvoiceRef = db.collection('invoices').doc();
        
        await db.runTransaction(async (transaction) => {
            const productUpdates = new Map<string, { doc: firebase.firestore.DocumentSnapshot, data: Product }>();

            // 1. READ PHASE: Read all unique product documents.
            const productIds = [...new Set(invoiceData.items.map(item => item.product.id))];
            const productRefs = productIds.map(id => db.collection('products').doc(id));
            const productDocs = await Promise.all(productRefs.map(ref => transaction.get(ref)));

            for (const doc of productDocs) {
                if (!doc.exists) throw new Error(`Product with ID ${doc.id} not found.`);
                productUpdates.set(doc.id, { doc, data: doc.data() as Product });
            }

            // 2. PREPARE WRITES (in memory): Calculate new quantities.
            for (const item of invoiceData.items) {
                const update = productUpdates.get(item.product.id);
                if (!update) throw new Error(`Product ${item.product.name} not found in transaction cache.`);

                const productData = update.data;
                const variantIndex = productData.variants.findIndex(v => v.id === item.variant.id);
                if (variantIndex === -1) throw new Error(`Variant for ${item.product.name} not found.`);

                const newQuantity = productData.variants[variantIndex].quantity - item.quantity;
                if (newQuantity < 0) throw new Error(`Not enough stock for ${productData.name} (${item.variant.name}).`);
                
                productData.variants[variantIndex].quantity = newQuantity;
            }
            
            // 3. WRITE PHASE: Commit all updates.
            for (const update of productUpdates.values()) {
                transaction.update(update.doc.ref, { variants: update.data.variants });
            }
            
            const newInvoice = { ...invoiceData, paidAmount: 0, status: 'Unpaid' as const, userId: user.uid };
            transaction.set(newInvoiceRef, newInvoice);
        });

        const newInvoiceSnapshot = await newInvoiceRef.get();
        setInvoices(prev => [...prev, { ...newInvoiceSnapshot.data(), id: newInvoiceSnapshot.id } as Invoice]);
        
        // Update local product state
        const productSnap = await db.collection('products').where("userId", "==", user.uid).get();
        setProducts(productSnap.docs.map(d => ({ ...d.data(), id: d.id } as Product)));
    };

    const updateInvoice = async (invoice: Invoice) => {
        if (!user) throw new Error("User not authenticated");
        const oldInvoice = invoices.find(i => i.id === invoice.id);
        if (!oldInvoice) throw new Error("Original invoice not found");

        await db.runTransaction(async (transaction) => {
            const quantityChanges = new Map<string, number>();
            const key = (pId: string, vId: string) => `${pId}_${vId}`;

            oldInvoice.items.forEach(item => {
                const k = key(item.product.id, item.variant.id);
                quantityChanges.set(k, (quantityChanges.get(k) || 0) + item.quantity);
            });
            invoice.items.forEach(item => {
                const k = key(item.product.id, item.variant.id);
                quantityChanges.set(k, (quantityChanges.get(k) || 0) - item.quantity);
            });
            
            const productIdsToUpdate = new Set<string>();
            quantityChanges.forEach((change, key) => {
                if (change !== 0) productIdsToUpdate.add(key.split('_')[0]);
            });

            // 1. READ PHASE
            const productRefs = Array.from(productIdsToUpdate).map(id => db.collection('products').doc(id));
            const productDocs = await Promise.all(productRefs.map(ref => transaction.get(ref)));

            // 2. WRITE PHASE
            for (const productDoc of productDocs) {
                if (!productDoc.exists) throw new Error(`Product with ID ${productDoc.id} not found during update.`);
                
                const productData = productDoc.data() as Product;

                for (const variant of productData.variants) {
                    const k = key(productDoc.id, variant.id);
                    const change = quantityChanges.get(k);
                    if (change) {
                        const newQuantity = variant.quantity + change;
                        if (newQuantity < 0) throw new Error(`Not enough stock for ${productData.name} (${variant.name}).`);
                        variant.quantity = newQuantity;
                    }
                }
                
                transaction.update(productDoc.ref, { variants: productData.variants });
            }

            const { id, ...invoiceData } = invoice;
            transaction.update(db.collection('invoices').doc(id), { ...invoiceData, userId: user.uid });
        });
        
        const productSnap = await db.collection('products').where("userId", "==", user.uid).get();
        setProducts(productSnap.docs.map(d => ({ ...d.data(), id: d.id } as Product)));
        setInvoices(prev => prev.map(i => i.id === invoice.id ? invoice : i));
        await recalculateInvoiceStatus(invoice.id);
    };
    
    const deleteInvoice = async (id: string) => {
        if (!user) throw new Error("User not authenticated");
        const invoiceToDelete = invoices.find(i => i.id === id);
        if (!invoiceToDelete) {
            throw new Error("Could not find the invoice to delete. It may have already been removed.");
        }

        const paymentsToDeleteQuery = db.collection('payments').where('invoiceId', '==', id).where('userId', '==', user.uid);
        const paymentsSnapshot = await paymentsToDeleteQuery.get();

        await db.runTransaction(async (transaction) => {
            const productUpdates = new Map<string, { doc: firebase.firestore.DocumentSnapshot, data: Product }>();

            // 1. READ PHASE
            const productIds = [...new Set(invoiceToDelete.items.map(item => item.product.id))];
            const productRefs = productIds.map(id => db.collection('products').doc(id));
            const productDocs = await Promise.all(productRefs.map(ref => transaction.get(ref)));

            for (const doc of productDocs) {
                if (doc.exists) {
                    productUpdates.set(doc.id, { doc, data: doc.data() as Product });
                }
            }
            
            // 2. PREPARE WRITES (in memory)
            for (const item of invoiceToDelete.items) {
                const update = productUpdates.get(item.product.id);
                if (update) {
                    const productData = update.data;
                    const variantIndex = productData.variants.findIndex(v => v.id === item.variant.id);
                    if (variantIndex !== -1) {
                         productData.variants[variantIndex].quantity += item.quantity;
                    }
                }
            }
            
            // 3. WRITE PHASE
            for (const update of productUpdates.values()) {
                transaction.update(update.doc.ref, { variants: update.data.variants });
            }
            
            transaction.delete(db.collection('invoices').doc(id));
            paymentsSnapshot.forEach(paymentDoc => transaction.delete(paymentDoc.ref));
        });

        setInvoices(prev => prev.filter(i => i.id !== id));
        setPayments(prev => prev.filter(p => p.invoiceId !== id));
        const productSnap = await db.collection('products').where("userId", "==", user.uid).get();
        setProducts(productSnap.docs.map(d => ({ ...d.data(), id: d.id } as Product)));
    };
    
     const batchUpdateProducts = async (productsToAdd: Omit<Product, 'id'>[]) => {
        if (!user) throw new Error("User not authenticated");

        const existingProductsQuery = db.collection('products').where("userId", "==", user.uid);
        const existingProductsSnap = await existingProductsQuery.get();
        const existingProductsMap = new Map<string, {id: string, data: Product}>();
        existingProductsSnap.forEach(doc => {
            const data = doc.data() as Product;
            existingProductsMap.set(data.name.toLowerCase(), { id: doc.id, data });
        });

        const inventoryExpensesToAdd: { name: string, quantity: number, cost: number }[] = [];

        await db.runTransaction(async (transaction) => {
            for (const newProductData of productsToAdd) {
                const existingDoc = existingProductsMap.get(newProductData.name.toLowerCase());
                if (existingDoc) {
                    const existingVariants = existingDoc.data.variants || [];
                    const newVariant = newProductData.variants[0]; // Assuming scanner adds one variant
                    const existingVariantIndex = existingVariants.findIndex(v => v.name.toLowerCase() === newVariant.name.toLowerCase());

                    if (existingVariantIndex !== -1) {
                        existingVariants[existingVariantIndex].quantity += newVariant.quantity;
                    } else {
                        existingVariants.push(newVariant);
                    }
                    transaction.update(db.collection('products').doc(existingDoc.id), { variants: existingVariants });
                     if(newVariant.quantity > 0 && newVariant.costPrice > 0){
                         inventoryExpensesToAdd.push({ name: `${existingDoc.data.name} (${newVariant.name})`, quantity: newVariant.quantity, cost: newVariant.costPrice });
                    }
                } else {
                    const newProductRef = db.collection('products').doc();
                    transaction.set(newProductRef, { ...newProductData, userId: user.uid });
                    const newVariant = newProductData.variants[0];
                     if(newVariant.quantity > 0 && newVariant.costPrice > 0){
                         inventoryExpensesToAdd.push({ name: `${newProductData.name} (${newVariant.name})`, quantity: newVariant.quantity, cost: newVariant.costPrice });
                    }
                }
            }
        });

        if (inventoryExpensesToAdd.length > 0) {
            await addInventoryExpense(inventoryExpensesToAdd);
        }

        const productSnap = await db.collection('products').where("userId", "==", user.uid).get();
        setProducts(productSnap.docs.map(d => ({ ...d.data(), id: d.id } as Product)));
     };

    const updateBusinessProfile = async (profile: BusinessProfile) => {
        if (!user) throw new Error("User not authenticated");
        await db.collection('users').doc(user.uid).update({ businessProfile: profile });
        setBusinessProfile(profile);
    };

    const value = {
        invoices, clients, products, payments, expenses, businessProfile,
        addInvoice, updateInvoice, deleteInvoice,
        addClient, updateClient, deleteClient,
        addProduct, updateProduct, deleteProduct, batchUpdateProducts,
        addPayment, updatePayment, deletePayment,
        addExpense, updateExpense, deleteExpense,
        updateBusinessProfile,
        getNextInvoiceNumber,
        loadingData
    };

    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};