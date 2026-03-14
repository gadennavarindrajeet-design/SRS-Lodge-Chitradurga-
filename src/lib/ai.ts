import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const getRevenueForecast = async (historicalData: any[]) => {
  const prompt = `Based on the following historical revenue data for a lodge, predict the revenue for the next 30 days. Return only a JSON array of objects with "date" and "predictedRevenue".
  Data: ${JSON.stringify(historicalData)}`;

  const response = await ai.models.generateContent({
    model: "gemini-3.1-flash-lite-preview",
    contents: [{ parts: [{ text: prompt }] }],
  });

  try {
    const text = response.text || "[]";
    const jsonMatch = text.match(/\[.*\]/s);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : [];
  } catch (e) {
    console.error("AI Forecast Error:", e);
    return [];
  }
};

export const chatWithAssistant = async (message: string, context: any) => {
  const prompt = `You are an AI assistant for a lodge owner. Use the following context about the lodge to answer the user's question.
  Context: ${JSON.stringify(context)}
  User: ${message}`;

  const response = await ai.models.generateContent({
    model: "gemini-3.1-flash-lite-preview",
    contents: [{ parts: [{ text: prompt }] }],
  });

  return response.text;
};
