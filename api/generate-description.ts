import { GoogleGenAI } from "@google/genai";
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
        const { itemName } = req.body;
        
        const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
        const result = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Write a brief, professional description for an invoice item named '${itemName}'. Keep it under 15 words.`,
        });
        
        return res.status(200).json({ description: result.text });
    } catch (error) {
        console.error("Error generating description:", error);
        return res.status(500).json({ error: "Failed to generate description" });
    }
}
