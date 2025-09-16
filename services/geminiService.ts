
import { GoogleGenAI } from "@google/genai";
import type { Transaction } from '../types';

if (!process.env.API_KEY) {
    console.warn("API_KEY environment variable not set. AI features will not work.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export const getFinancialInsight = async (prompt: string, transactions: Transaction[]): Promise<string> => {
    if (!process.env.API_KEY) {
        return "API Key is not configured. Please set the API_KEY environment variable to use the AI assistant.";
    }

    const model = 'gemini-2.5-flash';
    const systemInstruction = `You are a friendly and insightful financial assistant named Gemini. 
    Analyze the user's transaction data to answer their questions and provide helpful advice. 
    The transaction data is provided in JSON format. All amounts are in USD. 
    Be concise and clear in your responses. Format your response using markdown for better readability, including lists, bold text, and italics where appropriate.
    Today's date is ${new Date().toLocaleDateString()}.`;

    const fullPrompt = `
User Question: "${prompt}"

My recent transactions (JSON):
${JSON.stringify(transactions, null, 2)}
`;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: fullPrompt,
            config: {
                systemInstruction: systemInstruction,
            }
        });
        return response.text;
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        return "Sorry, I encountered an error trying to analyze your data. Please check the console for more details.";
    }
};
