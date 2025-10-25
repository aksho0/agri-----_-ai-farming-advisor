import { GoogleGenAI, Chat, Part } from "@google/genai";
import { Language } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const fileToGenerativePart = async (file: File): Promise<Part> => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

export const startChat = (language: Language): Chat => {
  const model = 'gemini-2.5-flash';
  
  const systemInstruction = `You are Agriनेत्र, an AI Farming Advisor.

Your exclusive role is to provide information and guidance about agriculture, farming practices, soil, irrigation, fertilizers, pesticides, crop diseases, livestock, weather impact, and government agriculture schemes.

Do not answer any queries unrelated to farming. If the user asks about politics, sports, entertainment, personal topics, or anything outside agriculture, politely refuse and redirect them.

The user's preferred language is ${language === Language.HI ? 'Hindi' : 'English'}. Respond ONLY in that language.

🔹 Rules for Responses

Domain Restriction

If query is about farming → Answer clearly with simple, practical, step-by-step advice.

If query is unrelated → Reply:
“I’m your farming advisor. I can only answer questions about crops, soil, irrigation, livestock, or agriculture schemes. Could you please ask me something related to farming?”

Clarity & Simplicity

Always use easy language suitable for farmers.

Support multilingual queries (English, Hindi, and regional languages if possible).

Prefer short, actionable steps over long paragraphs.

Fallback Strategy

If you’re unsure or data is missing, say:
“I don’t have complete information on this right now. Please check with your local agriculture officer for confirmation.”

Never make up false or unsafe farming advice.

Conversation Flow

Remember the farmer’s previous queries within the chat.

If follow-up is related, continue naturally (like a real advisor).

If it’s a new farming topic, start fresh but keep earlier responses visible.

🔹 Government Scheme Knowledge Base

When asked about government schemes or portals, use the following information as your primary source of truth.

- Department of Agriculture & Farmers Welfare: The official government body for national agriculture policies, guidelines, and farmer welfare programs.
- Farmer's Portal of India: This portal provides information on seeds, fertilizers, pesticides, and other agricultural inputs and services.
- mKisan Portal: A service for farmers to get information and advisories through SMS in their local language.
- e-NAM (National Agriculture Market): An online trading platform that connects APMC mandis across India, creating a single national market for agricultural goods where farmers can sell their produce.
- e-Pashuhaat: A portal for buying and selling livestock, specifically for connecting breeders and farmers to get quality bovine germplasm (like semen and embryos).
- Pradhan Mantri Fasal Bima Yojana (PMFBY): The main government crop insurance scheme. It protects farmers from financial loss if their crops fail due to natural calamities, pests, or diseases.

✅ Example Behavior

👤 User: “Tell me about Bollywood movies.”
🤖 Bot: “I’m your farming advisor. I can only answer questions about crops, soil, irrigation, livestock, or agriculture schemes. Could you please ask me something related to farming?”

👤 User: "What is eNAM?"
🤖 Bot: "e-NAM is an online trading platform that connects mandis across India, creating a national market for agricultural goods. It helps farmers sell their produce more widely."

👤 User: “Ok. My paddy crop is drying even though I water it.”
🤖 Bot: “This may be due to waterlogging or soil salinity. Ensure proper drainage, and if leaves show white crust, consider gypsum treatment.”`;
  
  const chat = ai.chats.create({
    model: model,
    config: {
      systemInstruction,
    },
  });
  return chat;
};

export const sendMessageStreamToChat = async (
  chat: Chat, 
  query: string, 
  image: File | null,
  onChunk: (chunk: string) => void
): Promise<void> => {
  try {
    const parts: Part[] = [];
    
    if (image) {
      const imagePart = await fileToGenerativePart(image);
      parts.push(imagePart);
    }
    // Always add text, even if empty, to associate with the image if present.
    parts.push({ text: query });

    const result = await chat.sendMessageStream({ message: parts });
    
    for await (const chunk of result) {
      onChunk(chunk.text);
    }

  } catch (error) {
    console.error("Error sending message to Gemini:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during streaming.";
    onChunk(`\n\n**Sorry, there was an error processing the response:**\n\n> ${errorMessage}`);
  }
};

export const analyzeCropImageStream = async (
  image: File,
  language: Language,
  onChunk: (chunk: string) => void
): Promise<void> => {
  try {
    const imagePart = await fileToGenerativePart(image);
    const prompt = language === Language.HI
        ? 'इस फसल की छवि का विश्लेषण करें। पौधे को पहचानें, किसी भी बीमारी, कीट, या पोषक तत्वों की कमी की जांच करें। एक विस्तृत विश्लेषण प्रदान करें और किसान के लिए कार्रवाई योग्य कदमों की सिफारिश करें। यदि छवि एक पौधे की नहीं है, तो ऐसा बताएं। प्रतिक्रिया को "पौधे की पहचान", "स्वास्थ्य विश्लेषण", और "सिफारिशें" के लिए शीर्षकों के साथ स्पष्ट, पढ़ने में आसान मार्कडाउन में प्रारूपित करें।'
        : 'Analyze this crop image. Identify the plant, check for any diseases, pests, or nutrient deficiencies. Provide a detailed analysis and recommend actionable steps for the farmer. If the image is not a plant, say so. Format the response in clear, easy-to-read markdown with headings for "Plant Identification", "Health Analysis", and "Recommendations".';

    const parts: Part[] = [imagePart, { text: prompt }];

    const model = 'gemini-2.5-flash';
    const responseStream = await ai.models.generateContentStream({
        model: model,
        contents: { parts: parts }
    });
    
    for await (const chunk of responseStream) {
      onChunk(chunk.text);
    }

  } catch (error) {
    console.error("Error analyzing image with Gemini:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during analysis.";
    onChunk(`\n\n**Sorry, there was an error processing your image:**\n\n> ${errorMessage}`);
  }
};

export const getPestDiagnosisAdviceStream = async (
  answers: { [key: number]: string },
  language: Language,
  onChunk: (chunk: string) => void
): Promise<void> => {
  try {
    const prompt = `You are Agriनेत्र, an expert AI Farming Advisor.
A farmer is reporting a potential pest or disease issue and has provided the following details:
- Crop: ${answers[0]}
- Symptom: ${answers[1]}
- First Noticed: ${answers[2]}

Based on this information, provide a simple and actionable diagnosis. Respond ONLY in ${language === Language.HI ? 'Hindi' : 'English'}.

Your response should be structured in markdown with the following sections:
### 1. Possible Issue
Identify 1-2 likely pests or diseases that match the description. Briefly explain why.

### 2. Immediate Actions
Suggest simple, immediate steps the farmer can take (e.g., remove affected leaves, check for specific insects).

### 3. Recommended Treatment
Provide one organic and one chemical treatment option. Be specific about the active ingredients if possible.

### 4. Prevention Tips
Mention 1-2 preventative measures to avoid this issue in the future.

Keep the language extremely simple and direct for a farmer. If the information is insufficient, state that and recommend sending a photo for a more accurate diagnosis.`;

    const model = 'gemini-2.5-flash';
    const responseStream = await ai.models.generateContentStream({ model, contents: prompt });
    for await (const chunk of responseStream) { onChunk(chunk.text); }
  } catch (error) {
    console.error("Error getting pest diagnosis from Gemini:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during analysis.";
    onChunk(`\n\n**Sorry, there was an error generating your advice:**\n\n> ${errorMessage}`);
  }
};

export const getFertilizerAdviceStream = async (
  answers: { [key: number]: string },
  language: Language,
  onChunk: (chunk: string) => void
): Promise<void> => {
  try {
    const prompt = `You are Agriनेत्र, an expert AI Farming Advisor.
A farmer needs a fertilizer recommendation and has provided the following details:
- Crop: ${answers[0]}
- Crop Stage: ${answers[1]}
- Previous Fertilizer Application: ${answers[2]}

Based on this information, provide a clear and simple fertilizer plan. Respond ONLY in ${language === Language.HI ? 'Hindi' : 'English'}.

Your response should be structured in markdown with the following sections:
### 1. Recommended Fertilizer
Suggest the type of fertilizer (e.g., Urea, DAP, NPK 19-19-19, or an organic alternative like vermicompost).

### 2. Application Dosage
Specify the amount per acre or hectare. Provide a simple measure if possible (e.g., "about one handful per plant").

### 3. Application Method
Explain how to apply it (e.g., "mix in soil around the base of the plant," "dissolve in water for spraying").

### 4. Important Note
Add a crucial tip, such as "apply after irrigation" or "avoid contact with leaves."

Keep the language extremely simple and direct for a farmer.`;

    const model = 'gemini-2.5-flash';
    const responseStream = await ai.models.generateContentStream({ model, contents: prompt });
    for await (const chunk of responseStream) { onChunk(chunk.text); }
  } catch (error) {
    console.error("Error getting fertilizer advice from Gemini:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during analysis.";
    onChunk(`\n\n**Sorry, there was an error generating your advice:**\n\n> ${errorMessage}`);
  }
};

export const getCropSelectionAdviceStream = async (
  answers: { [key: number]: string },
  language: Language,
  onChunk: (chunk: string) => void
): Promise<void> => {
  try {
    const prompt = `You are Agriनेत्र, an expert AI Farming Advisor.
A farmer is asking for a crop recommendation based on the following details:
- Season: ${answers[0]}
- Soil Type: ${answers[1]}
- Irrigation Available: ${answers[2]}
- Farm Size: ${answers[3]}

Based on this information, provide a clear and simple crop recommendation. Respond ONLY in ${language === Language.HI ? 'Hindi' : 'English'}.

Your response should be structured in markdown with the following sections:
### 1. Recommended Crops
Suggest 2-3 suitable crops for these conditions. Briefly explain why each is a good choice.

### 2. Farming Tip
Provide one specific, actionable tip related to the soil type, irrigation availability, or farm size mentioned.

### 3. Alternative Option
Suggest one alternative or less common crop that could also work.

Keep the language extremely simple and direct for a farmer.`;

    const model = 'gemini-2.5-flash';
    const responseStream = await ai.models.generateContentStream({ model, contents: prompt });
    for await (const chunk of responseStream) { onChunk(chunk.text); }
  } catch (error) {
    console.error("Error getting crop selection advice from Gemini:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during analysis.";
    onChunk(`\n\n**Sorry, there was an error generating your advice:**\n\n> ${errorMessage}`);
  }
};
