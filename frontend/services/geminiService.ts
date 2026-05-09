import { GoogleGenAI, Type } from '@google/genai';
import { NutriGrade, BilingualText, ScanMode } from '../types.ts';

// Lazy initialization of the AI client
let aiClient: GoogleGenAI | null = null;

const getAiClient = (): GoogleGenAI => {
  if (!aiClient) {
    // Read the obfuscated (Base64 encoded) key from the injected environment
    const encodedKey = process.env.ENCODED_API_KEY;
    
    let apiKey = '';

    if (encodedKey && encodedKey !== '${ENCODED_KEY}' && encodedKey !== 'undefined') {
      try {
        // Decode the Base64 string back to the original API key
        apiKey = atob(encodedKey);
      } catch (e) {
        console.error("Failed to decode API key.");
      }
    } else if (process.env.API_KEY && process.env.API_KEY !== '${API_KEY}') {
      // Fallback for local development where API_KEY might be set directly
      apiKey = process.env.API_KEY;
    }
    
    if (!apiKey || apiKey.trim() === '') {
      throw new Error("Configuration Error: API_KEY is missing. Please set the API_KEY environment variable.");
    }
    
    aiClient = new GoogleGenAI({ apiKey: apiKey, vertexai: true });
  }
  return aiClient;
};

export interface GeminiAnalysisResult {
  productName: BilingualText;
  grade: NutriGrade;
  calories: number;
  sugar: number;
  saturatedFat: number;
  sodium: number;
  protein: number;
  fiber: number;
  reasoning: BilingualText;
  recommendation: BilingualText;
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const analyzeNutritionLabel = async (base64Image: string, mimeType: string, mode: ScanMode, retries = 3): Promise<GeminiAnalysisResult> => {
  const ai = getAiClient();
  
  // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
  const base64Data = base64Image.split(',')[1];

  const prompt = `
    Analyze this nutrition facts label. 
    Extract the following information accurately:
    1. Product Name (guess a generic name if not explicitly stated, e.g., "Potato Chips", "Cereal"). Provide the name in both English and Indonesian.
    2. Calories (kcal).
    3. Total Sugar (g).
    4. Saturated Fat (g).
    5. Sodium (mg).
    6. Protein (g).
    7. Dietary Fiber (g).
    
    CRITICAL INSTRUCTION: You must evaluate this product strictly based on the dietary guidelines for: ${mode.toUpperCase()} MODE.
    
    Mode Guidelines:
    - NORMAL: General health guidelines (WHO).
    - DIET: Strictly penalize high calories and low protein. Reward portion-friendly and high protein.
    - DIABETES: Strictly penalize high sugar and simple carbs. Reward high fiber. Warn about added sugars.
    - PREGNANCY: Check for safe ingredients. Warn about high sodium or excessive sugars. Highlight essential nutrients if present.
    - BREASTFEEDING: Ensure sufficient calories and safe ingredients.
    - KIDS: Strictly penalize high sugar and artificial additives. Reward natural nutrients.
    - HYPERTENSION: Strictly penalize high sodium/salt.
    - FITNESS: Reward high protein and recovery-friendly macros. Penalize excessive empty calories.

    Based on the extracted values AND the specific requirements of the ${mode.toUpperCase()} MODE, calculate a Nutri-Grade (A, B, C, or D) where A is the healthiest and D is the least healthy FOR THIS SPECIFIC MODE. 
    
    Provide a detailed reasoning (2-3 sentences) explaining WHY it got this grade for this specific user condition.
    Provide a short recommendation (1 sentence) on how to consume it (e.g., "Avoid during pregnancy", "Safe for daily consumption", "Limit to once a week").
    Provide both reasoning and recommendation in English and Indonesian.
  `;

  let lastError: any;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
          role: 'user',
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
          systemInstruction: 'You are an expert nutritionist. Your task is to analyze an image of a nutrition facts label and extract specific information, evaluating it based on specific user health conditions.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              productName: { 
                type: Type.OBJECT, 
                properties: {
                  en: { type: Type.STRING, description: "Product name in English" },
                  id: { type: Type.STRING, description: "Product name in Indonesian" }
                },
                required: ["en", "id"]
              },
              grade: { type: Type.STRING, description: "Must be exactly 'A', 'B', 'C', or 'D'" },
              calories: { type: Type.NUMBER },
              sugar: { type: Type.NUMBER },
              saturatedFat: { type: Type.NUMBER },
              sodium: { type: Type.NUMBER },
              protein: { type: Type.NUMBER },
              fiber: { type: Type.NUMBER },
              reasoning: { 
                type: Type.OBJECT, 
                properties: {
                  en: { type: Type.STRING, description: "Detailed reasoning tailored to the selected mode in English" },
                  id: { type: Type.STRING, description: "Detailed reasoning tailored to the selected mode in Indonesian" }
                },
                required: ["en", "id"]
              },
              recommendation: { 
                type: Type.OBJECT, 
                properties: {
                  en: { type: Type.STRING, description: "Short recommendation in English" },
                  id: { type: Type.STRING, description: "Short recommendation in Indonesian" }
                },
                required: ["en", "id"]
              }
            },
            required: ["productName", "grade", "calories", "sugar", "saturatedFat", "sodium", "protein", "fiber", "reasoning", "recommendation"],
          },
        },
      });

      const jsonStr = response.text.trim();
      const result = JSON.parse(jsonStr);

      // Ensure grade is a valid enum value, default to C if parsing fails
      let parsedGrade = NutriGrade.C;
      if (Object.values(NutriGrade).includes(result.grade as NutriGrade)) {
        parsedGrade = result.grade as NutriGrade;
      }

      return {
        productName: result.productName,
        grade: parsedGrade,
        calories: result.calories || 0,
        sugar: result.sugar || 0,
        saturatedFat: result.saturatedFat || 0,
        sodium: result.sodium || 0,
        protein: result.protein || 0,
        fiber: result.fiber || 0,
        reasoning: result.reasoning,
        recommendation: result.recommendation || { en: "Consume in moderation.", id: "Konsumsi dalam jumlah sedang." },
      };
    } catch (error: any) {
      lastError = error;
      console.error(`Attempt ${attempt + 1} failed:`, error);
      
      // Check if it's a 4xx error (except 429 Too Many Requests) which shouldn't be retried
      if (error.status && error.status >= 400 && error.status < 500 && error.status !== 429) {
        throw new Error(`API Error: ${error.message || 'Invalid request'}`);
      }
      
      // Exponential backoff
      if (attempt < retries - 1) {
        const backoffTime = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
        await delay(backoffTime);
      }
    }
  }

  throw new Error(`Failed to analyze image after ${retries} attempts. ${lastError?.message || ''}`);
};
