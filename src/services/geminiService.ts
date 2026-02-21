import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function analyzeNetwork(nodes: any[], links: any[]) {
  const prompt = `
    Analyze the following financial network data for suspicious patterns like fraud networks, mule accounts, or coordinated activities.
    
    Nodes: ${JSON.stringify(nodes.slice(0, 50))}
    Links: ${JSON.stringify(links.slice(0, 100))}

    Identify:
    1. Shared phone numbers across multiple accounts.
    2. High-frequency interactions before transactions.
    3. Potential clusters of suspicious entities.
    
    Return a risk assessment in JSON format with:
    - riskScore (0-100)
    - findings (array of strings)
    - suspiciousEntities (array of IDs)
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            riskScore: { type: Type.NUMBER },
            findings: { type: Type.ARRAY, items: { type: Type.STRING } },
            suspiciousEntities: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["riskScore", "findings", "suspiciousEntities"]
        }
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("AI Analysis Error:", error);
    return { riskScore: 0, findings: ["Analysis failed"], suspiciousEntities: [] };
  }
}
