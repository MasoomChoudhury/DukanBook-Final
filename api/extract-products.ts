import { GoogleGenAI, Type } from "@google/genai";
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const GEMINI_API_KEY = process.env.API_KEY;
    
    if (!GEMINI_API_KEY) {
        return res.status(500).json({ error: "API Key not configured" });
    }

    try {
        const { base64Image, mimeType } = req.body;
        
        const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
        const imagePart = {
            inlineData: {
                data: base64Image,
                mimeType,
            },
        };

        const textPart = {
            text: "Analyze this invoice image. Extract all line items and return them as a JSON array. For each item, provide 'name', 'description' (if any), 'hsnSacCode' (if any), 'price' (as a number), and 'quantity' (as a number).",
        };
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, textPart] },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            name: { type: Type.STRING },
                            description: { type: Type.STRING },
                            hsnSacCode: { type: Type.STRING },
                            price: { type: Type.NUMBER },
                            quantity: { type: Type.NUMBER },
                        },
                        required: ["name", "quantity", "price"]
                    }
                }
            }
        });

        const jsonStr = response.text.trim();
        const products = JSON.parse(jsonStr);
        
        return res.status(200).json({ products });
    } catch (error) {
        console.error("Error extracting products:", error);
        return res.status(500).json({ error: "Failed to analyze invoice" });
    }
}
