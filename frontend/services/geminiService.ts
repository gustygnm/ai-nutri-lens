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
  whyThisGrade: BilingualText;
  recommendation: BilingualText;
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const getModeInstructions = (mode: ScanMode): string => {
  switch (mode) {
    case ScanMode.DIET:
      return "Focus strictly on weight loss. Penalize high calories, high sugar, and low protein. Reward high protein and fiber.";
    case ScanMode.DIABETES:
      return "Focus strictly on blood sugar management. Heavily penalize added sugars and simple carbohydrates. Reward high fiber and low glycemic impact.";
    case ScanMode.PREGNANCY:
      return "Focus on safety for expecting mothers. Warn about raw ingredients, high sodium, high sugar, and artificial additives. Reward folate, iron, and calcium.";
    case ScanMode.BREASTFEEDING:
      return "Focus on optimal nutrition for nursing mothers. Ensure sufficient calories and nutrients. Warn against excessive caffeine or harmful additives.";
    case ScanMode.KIDS:
      return "Focus on child health. Heavily penalize high sugar, artificial colors, and preservatives. Reward natural ingredients and essential nutrients for growth.";
    case ScanMode.HYPERTENSION:
      return "Focus strictly on heart health and blood pressure. Heavily penalize high sodium and saturated fats.";
    case ScanMode.FITNESS:
      return "Focus on muscle gain and recovery. Reward high protein and moderate complex carbs. Penalize empty calories and excessive saturated fats.";
    case ScanMode.NORMAL:
    default:
      return "Provide a general health analysis based on standard WHO nutritional guidelines.";
  }
};

export const analyzeNutritionLabel = async (base64Image: string, mimeType: string, mode: ScanMode, retries = 3): Promise<GeminiAnalysisResult> => {
  const ai = getAiClient();
  
  // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
  const base64Data = base64Image.split(',')[1];

  const modeInstruction = getModeInstructions(mode);

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
    
    CRITICAL INSTRUCTION: You are evaluating this product specifically for a user in **${mode.toUpperCase()} MODE**.
    ${modeInstruction}

    Based on these values AND the specific mode profile, calculate a Nutri-Grade (A, B, C, or D) where A is the healthiest and D is the least healthy FOR THIS SPECIFIC PROFILE.
    
    Provide:
    - A short 1-sentence 'reasoning' (insight) for the grade.
    - A detailed 'whyThisGrade' explaining the specific nutritional factors that led to this grade for this profile.
    - A 'recommendation' (e.g., "Safe for daily consumption", "Limit to once a week", "Avoid if diabetic").
    
    All text outputs MUST be provided in both English and Indonesian.
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
          systemInstruction: 'You are an expert clinical nutritionist and dietitian. Your task is to analyze an image of a nutrition facts label and extract specific information, evaluating it strictly based on the user\'s specified health profile/mode using evidence-based guidelines (WHO, FDA, ADA, etc.).',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              productName: { 
                type: Type.OBJECT, 
                properties: {
                  en: { type: Type.STRING },
                  id: { type: Type.STRING }
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
                  en: { type: Type.STRING, description: "Short 1-sentence insight" },
                  id: { type: Type.STRING }
                },
                required: ["en", "id"]
              },
              whyThisGrade: { 
                type: Type.OBJECT, 
                properties: {
                  en: { type: Type.STRING, description: "Detailed explanation of the grade based on the mode" },
                  id: { type: Type.STRING }
                },
                required: ["en", "id"]
              },
              recommendation: { 
                type: Type.OBJECT, 
                properties: {
                  en: { type: Type.STRING, description: "Actionable advice (e.g., Safe daily, Limit intake)" },
                  id: { type: Type.STRING }
                },
                required: ["en", "id"]
              }
            },
            required: ["productName", "grade", "calories", "sugar", "saturatedFat", "sodium", "protein", "fiber", "reasoning", "whyThisGrade", "recommendation"],
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
        whyThisGrade: result.whyThisGrade,
        recommendation: result.recommendation,
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
