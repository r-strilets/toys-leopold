
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Toy } from "../types";

/**
 * Gets toy recommendations based on child's age and interests using Gemini.
 */
export const getToyRecommendations = async (childAge: string, interests: string, availableToys: Toy[]) => {
  // Initialize right before call to ensure valid environment access
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  
  const toysList = availableToys.map(t => `- ${t.name} (ID: ${t.id}, Категорія: ${t.category}, Вік: ${t.ageRange})`).join('\n');

  const prompt = `Ти - кіт Леопольд, помічник у магазині іграшок. 
  До тебе звернулися за порадою. Дитині ${childAge} років, вона цікавиться: ${interests}. 
  
  Ось список іграшок, які є в нашому магазині:
  ${toysList}
  
  Будь ласка, обери 3 НАЙКРАЩІ іграшки ВИКЛЮЧНО з цього списку, які найбільше підійдуть цій дитині. 
  Поясни свій вибір лагідно, у стилі кота Леопольда.
  Відповідай українською мовою.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            toyId: { type: Type.STRING, description: "ID обраної іграшки зі списку" },
            name: { type: Type.STRING, description: "Повна назва іграшки" },
            reason: { type: Type.STRING, description: "Добре пояснення, чому це підходить" }
          },
          required: ["toyId", "name", "reason"]
        }
      }
    }
  });

  try {
    const text = response.text?.trim() || '[]';
    return JSON.parse(text);
  } catch (e) {
    console.error("Failed to parse AI response", e);
    return [];
  }
};

/**
 * Generates a short story about a toy from Leopold the Cat's perspective.
 */
export const getLeopoldStory = async (toyName: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Напиши дуже коротку добру казку (до 3 речень) про іграшку "${toyName}" від імені кота Леопольда. Його девіз: "Хлопці, давайте жити дружньо!". Відповідай українською мовою.`,
  });
  return response.text || "Давайте жити дружньо!";
};

/**
 * Generates audio for the story using Gemini TTS.
 */
export const generateLeopoldAudio = async (text: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' },
        },
      },
    },
  });
  return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
};

// Audio Utilities for Live API
export function encodeAudio(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function decodeAudio(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}
