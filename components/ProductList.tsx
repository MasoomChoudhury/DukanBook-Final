import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import Button from './common/Button';
import Modal from './common/Modal';
import type { Product, ProductVariant } from '../types';

type FormVariant = Omit<ProductVariant, 'costPrice' | 'sellingPrice' | 'quantity'> & {
    costPrice: string;
    sellingPrice: string;
    quantity: string;
}

const ProductForm: React.FC<{ product: Product | null; onClose: () => void }> = ({ product, onClose }) => {
    const { addProduct, updateProduct } = useData();
    const [formData, setFormData] = useState({
        name: product?.name || '',
        description: product?.description || '',
        hsnSacCode: product?.hsnSacCode || '',
        gstRate: product ? String(product.gstRate) : '',
    });
    const [variants, setVariants] = useState<FormVariant[]>(
        product?.variants.map(v => ({...v, costPrice: String(v.costPrice), sellingPrice: String(v.sellingPrice), quantity: String(v.quantity) })) || 
        [{ id: `new_${Date.now()}`, name: 'Default', costPrice: '', sellingPrice: '', quantity: '' }]
    );

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };
    
    const handleVariantChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const newVariants = [...variants];
        (newVariants[index] as any)[name] = value;
        setVariants(newVariants);
    };

    const addVariant = () => {
        setVariants([...variants, { id: `new_${Date.now()}`, name: '', costPrice: '', sellingPrice: '', quantity: '' }]);
    };

    const removeVariant = (index: number) => {
        if (variants.length <= 1) {
            alert("A product must have at least one variant.");
            return;
        }
        setVariants(variants.filter((_, i) => i !== index));
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const parsedVariants: ProductVariant[] = variants.map(v => ({
                id: v.id,
                name: v.name.trim() || 'Default',
                costPrice: parseFloat(v.costPrice) || 0,
                sellingPrice: parseFloat(v.sellingPrice) || 0,
                quantity: parseInt(v.quantity, 10) || 0,
            }));

            if (parsedVariants.some(v => !v.name)) {
                alert("Variant name cannot be empty.");
                return;
            }

            const productData = {
                ...formData,
                gstRate: parseFloat(formData.gstRate) || 0,
                variants: parsedVariants,
            };

            if (product) {
                await updateProduct({ ...productData, id: product.id });
            } else {
                await addProduct(productData);
            }
            onClose();
        } catch (error) {
            console.error("Failed to save product:", error);
            alert("There was an error saving the product.");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Product Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input name="name" value={formData.name} onChange={handleFormChange} placeholder="Product Name" required className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900"/>
                <input name="hsnSacCode" value={formData.hsnSacCode} onChange={handleFormChange} placeholder="HSN/SAC Code" required className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900"/>
            </div>
             <input name="description" value={formData.description} onChange={handleFormChange} placeholder="Description" className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900"/>
             <input name="gstRate" type="number" step="0.01" min="0" value={formData.gstRate} onChange={handleFormChange} placeholder="GST Rate (%)" required className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900"/>
            
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2 pt-4">Variants</h3>
            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
            {variants.map((variant, index) => (
                <div key={variant.id} className="p-3 border rounded-md bg-gray-50 space-y-2">
                    <div className="flex items-center gap-2">
                        <input name="name" value={variant.name} onChange={e => handleVariantChange(index, e)} placeholder="Variant Name (e.g., Red, Large)" required className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900"/>
                        <Button type="button" variant="secondary" onClick={() => removeVariant(index)} className="p-2" aria-label="Remove variant">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </Button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        <input name="costPrice" type="number" step="0.01" min="0" value={variant.costPrice} onChange={e => handleVariantChange(index, e)} placeholder="Cost Price" required className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900"/>
                        <input name="sellingPrice" type="number" step="0.01" min="0" value={variant.sellingPrice} onChange={e => handleVariantChange(index, e)} placeholder="Selling Price" required className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900"/>
                        <input name="quantity" type="number" step="1" min="0" value={variant.quantity} onChange={e => handleVariantChange(index, e)} placeholder="Quantity" required className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900"/>
                    </div>
                </div>
            ))}
            </div>
            <Button type="button" variant="secondary" onClick={addVariant}>Add Variant</Button>

            <div className="flex justify-end gap-2 pt-4 border-t mt-4">
                <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                <Button type="submit">{product ? 'Update Product' : 'Add Product'}</Button>
            </div>
        </form>
    );
};


const ProductList: React.FC = () => {
    const { products, deleteProduct } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const handleNewProduct = () => {
        setSelectedProduct(null);
        setIsModalOpen(true);
    };

    const handleEditProduct = (product: Product) => {
        setSelectedProduct(product);
        setIsModalOpen(true);
    };
    
    const handleDeleteProduct = (id: string) => {
        const productToDelete = products.find(p => p.id === id);
        if (!productToDelete) return;

        if (window.confirm(`Are you sure you want to delete "${productToDelete.name}"? This action cannot be undone.`)) {
            const executeDelete = async () => {
                try {
                    await deleteProduct(id);
                } catch (error: any) {
                    console.error("Failed to delete product:", error);
                    alert(error.message || "An unknown error occurred while trying to delete the product.");
                }
            };
            executeDelete();
        }
    };
    
    const getTotalStock = (product: Product) => {
        return product.variants.reduce((sum, v) => sum + v.quantity, 0);
    }

    const getStockColor = (quantity: number) => {
        if (quantity <= 0) return 'text-red-600 font-bold';
        if (quantity <= 5) return 'text-orange-500 font-semibold';
        return 'text-gray-900';
    };
    
    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            const term = searchTerm.toLowerCase().trim();
            if (!term) return true;

            const nameMatch = product.name.toLowerCase().includes(term);
            const hsnMatch = product.hsnSacCode.toLowerCase().includes(term);
            const variantMatch = product.variants.some(variant =>
                variant.name.toLowerCase().includes(term)
            );

            return nameMatch || hsnMatch || variantMatch;
        });
    }, [products, searchTerm]);


    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-4">
                <h2 className="text-2xl font-bold text-gray-800">Products & Services</h2>
                <Button onClick={handleNewProduct}>Add New Item</Button>
            </div>

            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                </div>
                <input
                    type="text"
                    placeholder="Search by name, variant, or HSN/SAC code..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 p-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-primary-500 focus:border-primary-500"
                    aria-label="Search products"
                />
            </div>

            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3">Name</th>
                                <th scope="col" className="px-6 py-3">HSN/SAC</th>
                                <th scope="col" className="px-6 py-3">Variants</th>
                                <th scope="col" className="px-6 py-3">Total Stock</th>
                                <th scope="col" className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.map((product) => {
                                const totalStock = getTotalStock(product);
                                return (
                                <tr key={product.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">{product.name}</td>
                                    <td className="px-6 py-4">{product.hsnSacCode}</td>
                                    <td className="px-6 py-4 text-xs">{product.variants.map(v => v.name).join(', ')}</td>
                                    <td className={`px-6 py-4 ${getStockColor(totalStock)}`}>
                                        {totalStock}
                                    </td>
                                    <td className="px-6 py-4 flex items-center space-x-2">
                                        <Button variant="secondary" onClick={() => handleEditProduct(product)} className="p-2" aria-label="Edit Product">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z"></path></svg>
                                        </Button>
                                        <Button variant="secondary" onClick={() => handleDeleteProduct(product.id)} className="p-2" aria-label="Delete Product">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                        </Button>
                                    </td>
                                </tr>
                            )})}
                        </tbody>
                    </table>
                </div>
                {products.length > 0 && filteredProducts.length === 0 && (
                    <p className="p-6 text-center text-gray-500">No products match your search for "{searchTerm}".</p>
                )}
                {products.length === 0 && <p className="p-6 text-center text-gray-500">No products or services found. Add one to get started!</p>}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedProduct ? 'Edit Product/Service' : 'Add New Product/Service'}>
                <ProductForm product={selectedProduct} onClose={() => setIsModalOpen(false)} />
            </Modal>
        </div>
    );
};

export default ProductList;