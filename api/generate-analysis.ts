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
        const { productsJson, invoicesJson, expensesJson } = req.body;
        
        const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

        const prompt = `
            You are an expert business analyst AI for a small retail store in India. 
            Analyze the following business data. The data includes the current product inventory (tracked by variants), 
            all recent invoices (sales), and business expenses. Based on this data, provide a 
            detailed business analysis in the required JSON format. Today's date is ${new Date().toLocaleString()}.

            Here is the data:
            Current Product Inventory (by variant): ${productsJson}
            Recent Sales Invoices (by variant): ${invoicesJson}
            Recent Business Expenses: ${expensesJson}

            Please provide the following insights at the variant level:
            1.  restockRecommendations: Identify product variants that are low in stock and have high sales velocity. Suggest at least 2-3 items.
            2.  topSellingProducts: List the top 3 product variants by total revenue generated. Calculate units sold and total revenue for each.
            3.  inventoryForecasts: For the top 3 selling product variants, calculate a suggested order quantity for the next month. Base this on recent sales. Provide brief reasoning.
            4.  predictedSales: Forecast the total sales revenue for the next calendar month across all products. Provide a brief insight.
            5.  overallSummary: Provide a concise (2-3 sentences), actionable summary for the business owner.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        restockRecommendations: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    productName: { type: Type.STRING },
                                    variantName: { type: Type.STRING },
                                    currentStock: { type: Type.NUMBER },
                                    reason: { type: Type.STRING }
                                },
                                required: ["productName", "variantName", "currentStock", "reason"]
                            }
                        },
                        topSellingProducts: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    productName: { type: Type.STRING },
                                    variantName: { type: Type.STRING },
                                    unitsSold: { type: Type.NUMBER },
                                    totalRevenue: { type: Type.NUMBER }
                                },
                                required: ["productName", "variantName", "unitsSold", "totalRevenue"]
                            }
                        },
                        inventoryForecasts: {
                             type: Type.ARRAY,
                             items: {
                                type: Type.OBJECT,
                                properties: {
                                    productName: { type: Type.STRING },
                                    variantName: { type: Type.STRING },
                                    suggestedOrderQuantity: { type: Type.NUMBER },
                                    reasoning: { type: Type.STRING }
                                },
                                required: ["productName", "variantName", "suggestedOrderQuantity", "reasoning"]
                            }
                        },
                        predictedSales: {
                            type: Type.OBJECT,
                            properties: {
                                nextMonth: { type: Type.NUMBER },
                                insight: { type: Type.STRING }
                            },
                            required: ["nextMonth", "insight"]
                        },
                        overallSummary: {
                            type: Type.STRING
                        }
                    },
                    required: ["restockRecommendations", "topSellingProducts", "inventoryForecasts", "predictedSales", "overallSummary"]
                }
            }
        });

        const jsonStr = response.text.trim();
        const analysis = JSON.parse(jsonStr);
        
        return res.status(200).json(analysis);
    } catch (error) {
        console.error("Error generating analysis:", error);
        return res.status(500).json({ error: "Failed to generate analysis" });
    }
}
