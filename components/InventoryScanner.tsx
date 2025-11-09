import React, { useState, useRef, useCallback } from 'react';
import Button from './common/Button';
import { extractProductsFromInvoice } from '../services/geminiService';
import type { Product } from '../types';
import { useData } from '../context/DataContext';

type ExtractedProduct = Omit<Product, 'id'>;

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = error => reject(error);
    });
};


const InventoryScanner: React.FC = () => {
    const { products, batchUpdateProducts } = useData();
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imageBase64, setImageBase64] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [extractedProducts, setExtractedProducts] = useState<ExtractedProduct[]>([]);
    const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);
    
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const resetState = () => {
        setImageFile(null);
        setImageBase64(null);
        setExtractedProducts([]);
        setError(null);
        stopCamera();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            resetState();
            setImageFile(file);
            const b64 = await fileToBase64(file);
            setImageBase64(b64);
        }
    };

    const startCamera = async () => {
        resetState();
        setIsCameraOpen(true);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error("Camera error:", err);
            setError("Could not access camera. Please check permissions.");
            setIsCameraOpen(false);
        }
    };

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
        setIsCameraOpen(false);
    };

    const captureImage = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext('2d');
            context?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
            const dataUrl = canvas.toDataURL('image/jpeg');
            setImageBase64(dataUrl.split(',')[1]);
            stopCamera();
        }
    };
    
    const processImage = async () => {
        if (!imageBase64) {
            setError("No image selected to process.");
            return;
        }
        setIsProcessing(true);
        setError(null);
        setExtractedProducts([]);
        try {
            const mimeType = imageFile?.type || 'image/jpeg';
            const result = await extractProductsFromInvoice(imageBase64, mimeType);
            
            if (Array.isArray(result)) {
                const validProducts: ExtractedProduct[] = result
                    .filter(item => item && typeof item === 'object' && 'name' in item && 'price' in item && 'quantity' in item)
                    .map((p: any) => ({
                        name: p.name,
                        description: p.description || '',
                        hsnSacCode: p.hsnSacCode || '',
                        gstRate: 0, // Default GST rate
                        variants: [{
                            id: `default_${Date.now()}_${Math.random()}`,
                            name: 'Default',
                            costPrice: 0, // Default cost price
                            sellingPrice: Number(p.price) || 0,
                            quantity: Number(p.quantity) || 0,
                        }]
                    }));
                
                if (result.length > 0 && validProducts.length === 0) {
                    setError("While the invoice was read, no items with a name, price, and quantity could be clearly identified. Please try a clearer image.");
                } else {
                    setExtractedProducts(validProducts);
                }
            } else {
                 setError("The AI could not recognize a list of products in the image. Please try again with a clearer invoice.");
            }
        } catch (err: any) {
            setError(err.message || "An unknown error occurred.");
        } finally {
            setIsProcessing(false);
        }
    };
    
    const handleAddToProducts = async () => {
        if (extractedProducts.length > 0) {
            try {
                await batchUpdateProducts(extractedProducts);
                alert("Products have been successfully added/updated!");
                resetState();
            } catch (err) {
                 setError("Failed to save products to the database.");
            }
        }
    };

    const renderInitialView = () => (
        <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Scan Your Inventory Invoice</h3>
            <p className="text-gray-500 mb-6">Upload or take a picture of an invoice to automatically add products to your inventory.</p>
            <div className="flex justify-center gap-4">
                <Button onClick={() => fileInputRef.current?.click()}>Upload Invoice</Button>
                <Button variant="secondary" onClick={startCamera}>Use Camera</Button>
            </div>
            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
        </div>
    );

    const renderPreview = () => (
        <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Image Preview</h3>
            {imageBase64 && <img src={`data:image/jpeg;base64,${imageBase64}`} alt="Invoice preview" className="max-h-80 mx-auto rounded-md shadow-md" />}
            <div className="mt-6 flex justify-center gap-4">
                 <Button variant="secondary" onClick={resetState}>Start Over</Button>
                 <Button onClick={processImage} disabled={isProcessing}>
                    {isProcessing ? 'Analyzing...' : 'Extract Products'}
                </Button>
            </div>
        </div>
    );

    const renderCameraView = () => (
        <div className="text-center">
            <video ref={videoRef} autoPlay playsInline className="w-full max-w-lg mx-auto rounded-md shadow-md"></video>
            <canvas ref={canvasRef} className="hidden"></canvas>
            <div className="mt-6 flex justify-center gap-4">
                <Button variant="secondary" onClick={stopCamera}>Cancel</Button>
                <Button onClick={captureImage}>Capture</Button>
            </div>
        </div>
    );

    const renderResultsView = () => (
        <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Extracted Products</h3>
            <p className="text-sm text-gray-600 mb-4">Review the items found in the invoice. Items in <span className="text-green-600 font-semibold">green</span> will be added as new products. Items in <span className="text-blue-600 font-semibold">blue</span> already exist and their quantity will be updated.</p>
            <div className="overflow-x-auto bg-white rounded-md shadow">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-2 text-left">Name</th>
                            <th className="px-4 py-2 text-left">HSN/SAC</th>
                            <th className="px-4 py-2 text-right">Price</th>
                            <th className="px-4 py-2 text-right">Quantity</th>
                        </tr>
                    </thead>
                    <tbody>
                        {extractedProducts.map((p, i) => {
                             const isExisting = products.some(ep => ep.name.toLowerCase() === p.name.toLowerCase());
                             return (
                                <tr key={i} className={`border-t ${isExisting ? 'text-blue-600' : 'text-green-600'}`}>
                                    <td className="px-4 py-2 font-semibold">{p.name}</td>
                                    <td className="px-4 py-2">{p.hsnSacCode}</td>
                                    <td className="px-4 py-2 text-right">₹{p.variants[0]?.sellingPrice?.toFixed(2) || '0.00'}</td>
                                    <td className="px-4 py-2 text-right">{p.variants[0]?.quantity || 0}</td>
                                </tr>
                             );
                        })}
                    </tbody>
                </table>
            </div>
             <div className="mt-6 flex justify-end gap-4">
                 <Button variant="secondary" onClick={resetState}>Cancel</Button>
                 <Button onClick={handleAddToProducts}>Confirm and Add to Products</Button>
            </div>
        </div>
    );

    return (
        <div className="w-full space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Inventory Scanner</h2>
            <div className="bg-white p-8 rounded-lg shadow-sm w-full">
                {!imageBase64 && !isCameraOpen && renderInitialView()}
                {isCameraOpen && renderCameraView()}
                {imageBase64 && !isCameraOpen && extractedProducts.length === 0 && renderPreview()}
                {extractedProducts.length > 0 && renderResultsView()}

                {isProcessing && (
                    <div className="mt-6 flex flex-col items-center justify-center text-primary-600">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
                        <p className="mt-4 font-semibold">AI is reading your invoice...</p>
                    </div>
                )}
                {error && <p className="mt-4 text-center text-red-600 bg-red-100 p-3 rounded-md">{error}</p>}
            </div>
        </div>
    );
};

export default InventoryScanner;