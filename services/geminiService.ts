import { GoogleGenAI, Type } from "@google/genai";
import { AIReport } from "../types";

// The Gemini API key is securely provided by the Vercel/AI Studio environment.
const GEMINI_API_KEY = process.env.API_KEY;

export const generateDescription = async (itemName: string): Promise<string> => {
    if (!GEMINI_API_KEY) {
        console.error("Gemini API Key not configured.");
        return "Error: API Key not set.";
    }
    try {
        const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
        const result = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Write a brief, professional description for an invoice item named '${itemName}'. Keep it under 15 words.`,
        });
        return result.text;
    } catch (error) {
        console.error("Error generating description with Gemini API:", error);
        return "Error generating description.";
    }
};

export const extractProductsFromInvoice = async (base64Image: string, mimeType: string) => {
    if (!GEMINI_API_KEY) {
        throw new Error("Gemini API Key not configured. Please set the API_KEY environment variable in your deployment settings.");
    }
    try {
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

        let jsonStr = response.text.trim();
        return JSON.parse(jsonStr);

    } catch (error) {
        console.error("Error extracting products with Gemini API:", error);
        throw new Error("Failed to analyze the invoice image. Please ensure it's clear and try again.");
    }
};

export const generateBusinessAnalysis = async (
    productsJson: string,
    invoicesJson: string,
    expensesJson: string
): Promise<AIReport> => {
    if (!GEMINI_API_KEY) {
        throw new Error("Gemini API Key not configured. Please set the API_KEY environment variable in your deployment settings.");
    }
    try {
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
        return JSON.parse(jsonStr) as AIReport;

    } catch (error) {
        console.error("Error generating business analysis with Gemini API:", error);
        throw new Error("Failed to generate AI analysis. The model may be temporarily unavailable. Please try again later.");
    }
};
