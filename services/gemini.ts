
import { GoogleGenAI, Modality, Type, FunctionDeclaration } from "@google/genai";
import { WeatherData } from "../types";

const logFoodFunctionDeclaration: FunctionDeclaration = {
  name: 'logFood',
  parameters: {
    type: Type.OBJECT,
    description: 'Logs a food item into the user daily nutrition log with forensic detail.',
    properties: {
      foodName: { type: Type.STRING, description: 'The name of the food item.' },
      calories: { type: Type.NUMBER, description: 'Estimated total calories.' },
      protein: { type: Type.NUMBER, description: 'Estimated protein in grams.' },
      carbs: { type: Type.NUMBER, description: 'Estimated carbohydrates in grams.' },
      fats: { type: Type.NUMBER, description: 'Estimated fats in grams.' },
      junkScore: { type: Type.NUMBER, description: 'Junk/Impact score 0-10 (0=Healthy, 10=Highly Processed).' },
    },
    required: ['foodName', 'calories', 'protein', 'carbs', 'fats', 'junkScore'],
  },
};

export async function fetchLiveWeather(): Promise<WeatherData | null> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = "gemini-3-flash-preview";

  try {
    const response = await ai.models.generateContent({
      model,
      contents: "What is the current weather in Mangaldoi, Darrang, Assam (near Assam Skill University)? Return only a JSON object with keys: condition (string), temp (number in Celsius), humidity (number %), windSpeed (number km/h), isNight (boolean).",
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json"
      },
    });

    const text = response.text || "{}";
    const weather = JSON.parse(text);
    return {
      ...weather,
      lastUpdated: Date.now()
    };
  } catch (error) {
    console.error("Weather Sync Error:", error);
    return null;
  }
}

export async function sendMessageToGemini(history: any[], userMessage: string, options: any = {}) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = "gemini-3-flash-preview";

  const systemInstruction = `
You are LifeLoop AI, the advanced health and safety growth companion for Assam Skill University (ASU).

FORENSIC NUTRITIONAL ANALYSIS PROTOCOL:
When a user mentions ANY food, meal, or beverage:

1. RECOGNITION & CLARIFICATION:
- If the input is vague (e.g., "I ate something", "I had lunch"), you MUST ask a clarifying question before logging.
- Example: "Could you please specify what food item you would like to know about?" or "Can you tell me more about the food you ate (e.g., portion size or toppings)?"

2. DATA LOGGING:
- Once identified, call 'logFood' with the best estimated metrics.

3. STRUCTURED REPORT (MANDATORY FORMAT):
### 🔬 NUTRITIONAL IMPACT REPORT: [Food Name]
---
**VITAL METRICS (HUD):**
- CALORIES: [X] kcal
- PROTEIN: [X]g | CARBS: [X]g | FATS: [X]g
- JUNK FRICTION: [X]/10

**🌟 HEALTH BENEFITS:**
[Briefly list the positive impact of this food, e.g., "Rich in Vitamin C", "High fiber for heart health".]

**🛡️ SAFETY & HYGIENE CONSIDERATIONS:**
[Analyze allergens, foodborne risks (e.g., raw fish in sushi), or contamination warnings (e.g., wash apples to remove pesticides).]

**🔄 LOOP ANALYSIS:**
[Describe how this food impacts their university performance—focus on energy spikes, cognitive clarity, or physical recovery.]

**💊 HEALTH PROTOCOL:**
- [Specific Actionable Tip 1]
- [Specific Actionable Tip 2]

**📚 EDUCATIONAL SNIPPET:**
[A short fact or summary. Provide a link using Google Search if possible: "For more on [Food] and its benefits, check out this article [link]."]

---
Was this information helpful?
What else would you like to know?

TONE: Forensic, analytical, supportive, and safety-first. Use Google Search grounding to verify the latest health research and safety alerts.
  `;

  const contents = [...history, { role: 'user', parts: [{ text: userMessage }] }];
  
  const config: any = { 
    systemInstruction,
    temperature: 0.3,
    tools: [
      { functionDeclarations: [logFoodFunctionDeclaration] },
      { googleSearch: {} }
    ]
  };

  try {
    const response = await ai.models.generateContent({ model, contents, config });
    
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const groundingLinks = groundingChunks
      .filter((chunk: any) => chunk.web)
      .map((chunk: any) => ({
        title: chunk.web.title,
        uri: chunk.web.uri
      }));

    return {
      text: response.text || (response.functionCalls ? "Log processed. Synthesis complete." : "Sync complete."),
      functionCalls: response.functionCalls,
      groundingLinks
    };
  } catch (error) {
    console.error("Gemini Error:", error);
    return { text: "The analysis loop was interrupted. Neural link unstable. Please retry." };
  }
}

export async function generateSpeech(text: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
      },
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
  } catch (error) {
    return null;
  }
}
