import { GoogleGenAI, Type } from "@google/genai";
import type { TicketQueryResponse } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const ticketQuerySchema = {
  type: Type.OBJECT,
  properties: {
    isQueryValid: { 
      type: Type.BOOLEAN, 
      description: 'True if the user query is a valid travel request that can be understood, false otherwise.' 
    },
    errorMessage: { 
      type: Type.STRING, 
      description: 'A user-friendly error message if the query is invalid, unclear, or nonsensical for train travel.' 
    },
    parsedQuery: {
      type: Type.OBJECT,
      properties: {
        origin: { type: Type.STRING, description: 'The departure city or station.' },
        destination: { type: Type.STRING, description: 'The arrival city or station.' },
        date: { type: Type.STRING, description: 'The travel date in YYYY-MM-DD format. Infer the date based on context like "tomorrow" or "next Friday". Assume today is ' + new Date().toISOString().split('T')[0] + '.' },
        adults: { type: Type.INTEGER, description: 'The number of adult passengers inferred from the query. Default to 1 if not specified.' },
        children: { type: Type.INTEGER, description: 'The number of child passengers inferred from the query. Default to 0 if not specified.' },
      },
    },
    ticketOptions: {
      type: Type.ARRAY,
      description: 'A list of 3 to 5 fictional but realistic train ticket options that match the query.',
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING, description: 'A unique identifier for the ticket, e.g., "SR-1234".' },
          trainName: { type: Type.STRING, description: 'A creative and appealing train name, e.g., "The Midnight Express" or "Coastal Voyager".' },
          departureTime: { type: Type.STRING, description: 'Departure time in HH:MM format.' },
          arrivalTime: { type: Type.STRING, description: 'Arrival time in HH:MM format.' },
          duration: { type: Type.STRING, description: 'Total travel duration, e.g., "3h 15m".' },
          price: { type: Type.NUMBER, description: 'The price per passenger in INR.' },
          class: { type: Type.STRING, description: 'The travel class. Should be one of "Economy", "Business", or "First".' },
        },
         required: ['id', 'trainName', 'departureTime', 'arrivalTime', 'duration', 'price', 'class'],
      },
    },
    smartSuggestions: {
      type: Type.ARRAY,
      description: 'A list of 2-3 helpful, creative suggestions or alternative ideas for the user\'s trip. For example, suggest a scenic route, a cheaper but slightly longer journey, or an interesting stop along the way.',
      items: {
        type: Type.STRING,
      },
    },
  },
  required: ['isQueryValid'],
};

export const getSmartTicketResults = async (query: string): Promise<TicketQueryResponse> => {
  try {
    const fullQuery = `Parse the following user request for train tickets: "${query}".`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: fullQuery,
      config: {
        responseMimeType: "application/json",
        responseSchema: ticketQuerySchema,
        systemInstruction: "You are an AI for a smart railway booking system. Your goal is to understand user queries for train travel and provide structured data for available tickets and travel suggestions. Generate fictional but realistic train data with prices in INR. If the query is ambiguous, set isQueryValid to false and provide a helpful errorMessage.",
      },
    });

    const jsonText = response.text.trim();
    const parsedData = JSON.parse(jsonText);
    
    if (typeof parsedData.isQueryValid !== 'boolean') {
        throw new Error("Invalid response format from API.");
    }
    
    // Ensure parsedQuery has default passenger counts if not provided by the model
    if (parsedData.isQueryValid && parsedData.parsedQuery) {
        parsedData.parsedQuery.adults = parsedData.parsedQuery.adults || 1;
        parsedData.parsedQuery.children = parsedData.parsedQuery.children || 0;
    }

    return parsedData as TicketQueryResponse;
    
  } catch (error) {
    console.error("Error fetching or parsing ticket results:", error);
    return {
      isQueryValid: false,
      errorMessage: "Sorry, I encountered an issue planning your trip. Please try again.",
    };
  }
};