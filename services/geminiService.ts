
import { GoogleGenAI, Type } from "@google/genai";
import type { Book, Recommendation } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const recommendationSchema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING, description: "The full title of the book." },
        author: { type: Type.STRING, description: "The full name of the author." },
        year: { type: Type.INTEGER, description: "The year the book was first published." },
        genre: { type: Type.STRING, description: "The primary genre of the book." },
        summary: { type: Type.STRING, description: "A concise, engaging summary of the book's plot or main ideas (2-3 sentences)." },
        reasoning: { type: Type.STRING, description: "A short explanation of why this specific user would enjoy this book, based on their reading history and query." },
        averageRating: { type: Type.NUMBER, description: "The book's average rating on a scale of 1 to 5, with one decimal place (e.g., 4.5)." },
        purchaseLinks: {
          type: Type.ARRAY,
          description: "A list of links to purchase the book.",
          items: {
            type: Type.OBJECT,
            properties: {
              storeName: { type: Type.STRING, description: "The name of the online store (e.g., 'Amazon', 'Barnes & Noble')." },
              url: { type: Type.STRING, description: "The direct URL to the book's page on the store." }
            },
            required: ["storeName", "url"]
          }
        },
        coverImageUrl: { type: Type.STRING, description: "A placeholder image URL for the book cover using https://picsum.photos/270/400" }
      },
      required: ["title", "author", "year", "genre", "summary", "reasoning", "averageRating", "purchaseLinks", "coverImageUrl"]
    }
};

export const getRecommendations = async (readBooks: Book[], userQuery: string): Promise<Recommendation[]> => {
  const readBooksList = readBooks.map(book => `- "${book.title}" by ${book.author} (${book.genre})`).join('\n');

  const prompt = `
    You are an expert literary recommender AI for Goodreads. Your task is to provide highly personalized book recommendations.

    Analyze the user's reading history and their specific request to suggest three new books they are highly likely to enjoy.

    **User's Reading History:**
    ${readBooksList}

    **User's Request:**
    "${userQuery}"

    **Your Task:**
    1.  Deeply analyze the themes, genres, authors, and writing styles present in the user's reading history.
    2.  Combine this analysis with the user's specific request.
    3.  Find three excellent book recommendations that are a perfect fit. Do not recommend books from their reading history.
    4.  For each recommendation, provide a compelling summary and a personalized reason why the user will like it.
    5.  Generate placeholder purchase links for Amazon and Barnes & Noble.
    6.  Return the output in a structured JSON format.
    `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: recommendationSchema,
        temperature: 0.7,
      },
    });
    
    const jsonText = response.text.trim();
    if (!jsonText) {
        console.error("Gemini API returned an empty response.");
        return [];
    }
    
    const parsedResponse = JSON.parse(jsonText);
    return parsedResponse as Recommendation[];

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to fetch recommendations from Gemini.");
  }
};
