import express from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 8080;

// Middleware to parse large JSON payloads (images)
app.use(express.json({ limit: '50mb' }));

// Serve static files (the React frontend) from the current directory
app.use(express.static(__dirname));

app.post('/api/analyze', async (req, res) => {
  try {
    const { base64Image, mimeType } = req.body;

    // Security Check: Ensure API key exists on the server
    if (!process.env.API_KEY || process.env.API_KEY.trim() === '') {
      console.error("CRITICAL ERROR: API_KEY environment variable is missing on the server.");
      return res.status(500).json({ error: 'Server configuration error. API Key is missing.' });
    }

    // Initialize Gemini API securely on the server
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY, vertexai: true });
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
      
      Based on these values, calculate a Nutri-Grade (A, B, C, or D) where A is the healthiest and D is the least healthy. 
      Provide a short 1-sentence reasoning for the grade in both English and Indonesian.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        role: 'user',
        parts: [
          { inlineData: { mimeType: mimeType, data: base64Data } },
          { text: prompt },
        ],
      },
      config: {
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
            grade: { type: Type.STRING },
            calories: { type: Type.NUMBER },
            sugar: { type: Type.NUMBER },
            saturatedFat: { type: Type.NUMBER },
            sodium: { type: Type.NUMBER },
            protein: { type: Type.NUMBER },
            fiber: { type: Type.NUMBER },
            reasoning: { 
              type: Type.OBJECT, 
              properties: {
                en: { type: Type.STRING },
                id: { type: Type.STRING }
              },
              required: ["en", "id"]
            }
          },
          required: ["productName", "grade", "calories", "sugar", "saturatedFat", "sodium", "protein", "fiber", "reasoning"],
        },
      },
    });

    const jsonStr = response.text.trim();
    const result = JSON.parse(jsonStr);
    res.json(result);

  } catch (error) {
    console.error('Error analyzing image:', error);
    res.status(500).json({ error: error.message || 'Failed to analyze image' });
  }
});

// Fallback for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`Secure Backend Server listening on port ${port}`);
});
