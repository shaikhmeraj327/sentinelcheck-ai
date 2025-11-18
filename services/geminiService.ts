import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

// Initialize the Gemini client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeCheckImage = async (
  base64Data: string,
  mimeType: string
): Promise<AnalysisResult> => {
  const modelId = "gemini-2.5-flash";

  const prompt = `
    You are an expert forensic document examiner and banking AI. 
    Analyze the provided image of a bank check (or checks).
    
    Task 1: Extract structured data from the check. Accurately transcribe names, dates, and amounts.
    Task 2: Perform a fraud risk assessment. Look for:
      - Inconsistencies between the numeric amount and the written legal amount.
      - Signs of digital alteration (blurring, font mismatches, pasted text).
      - Missing or suspicious signatures.
      - Date anomalies (stale checks, future dates).
      - MICR line inconsistencies.
      - High-risk payee names or memo fields.

    Return the result in JSON format conforming to the schema.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            extraction: {
              type: Type.OBJECT,
              properties: {
                bankName: { type: Type.STRING },
                payerName: { type: Type.STRING },
                payerAddress: { type: Type.STRING },
                payeeName: { type: Type.STRING },
                date: { type: Type.STRING },
                amountNumeric: { type: Type.STRING },
                amountText: { type: Type.STRING },
                checkNumber: { type: Type.STRING },
                routingNumber: { type: Type.STRING },
                accountNumber: { type: Type.STRING },
                memo: { type: Type.STRING },
                isSigned: { type: Type.BOOLEAN },
                micrLine: { type: Type.STRING },
              },
              required: ["bankName", "payeeName", "amountNumeric", "date", "isSigned"],
            },
            fraudAnalysis: {
              type: Type.OBJECT,
              properties: {
                riskScore: { type: Type.NUMBER, description: "0 to 100, where 100 is high fraud risk" },
                riskLevel: { type: Type.STRING, enum: ["SAFE", "CAUTION", "SUSPICIOUS", "CRITICAL"] },
                reasoning: { type: Type.STRING },
                digitalAlterationDetected: { type: Type.BOOLEAN },
                alerts: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      severity: { type: Type.STRING, enum: ["LOW", "MEDIUM", "HIGH"] },
                      flag: { type: Type.STRING },
                      description: { type: Type.STRING },
                    },
                  },
                },
              },
              required: ["riskScore", "riskLevel", "reasoning", "alerts"],
            },
          },
        },
      },
    });

    const text = response.text;
    if (!text) {
        throw new Error("No response text from Gemini");
    }
    return JSON.parse(text) as AnalysisResult;

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};
