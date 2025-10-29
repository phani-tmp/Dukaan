import { GoogleGenAI } from '@google/genai';

const genAI = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || '' });

export async function translateToProductName(userInput, productContext) {
  try {
    const productList = productContext.map(p => `${p.id}: ${p.name} (${p.teluguName}, ${p.hindiName})`).join('\n');
    
    const prompt = `You are a product name translator for a quick commerce app in India.

Available products (format: id: name (telugu, hindi)):
${productList}

User input: "${userInput}"

Task: Extract product names, quantities, and units from the user's input. The input may be in Telugu, English, Hindi, or Hinglish.

Match the input to products in the database using:
- Exact matches
- Synonyms (e.g., "dal" = "pappu" = "lentils")
- Telugu names (e.g., "పాలు" = "Milk", "ఉల్లిపాయ" = "Onion")
- Common misspellings

Return a JSON array with this structure:
[
  {
    "productId": "product_id_from_database",
    "productName": "standardized product name",
    "quantity": number or null,
    "unit": "kg/litre/piece/packet" or null,
    "confidence": 0.0 to 1.0
  }
]

If no products match, return an empty array [].
Only return valid JSON, no explanations.`;

    const result = await genAI.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }]
        }
      ]
    });
    
    const text = result.text || '';
    
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    return [];
  } catch (error) {
    console.error('[Gemini] Translation error:', error);
    return [];
  }
}

export async function extractProductFromVoice(audioText, productContext) {
  try {
    const prompt = `You are helping a shopkeeper add products to their inventory via voice input.

User said: "${audioText}"

Extract the following information:
- Product name (in English, even if they spoke in Telugu/Hindi)
- Price (in rupees)
- Quantity/Stock available
- Unit (kg, litre, piece, packet, etc.)
- Category (Vegetables, Fruits, Dairy, Groceries, Snacks, etc.)

Return JSON in this exact format:
{
  "name": "product name",
  "price": number,
  "stock": number,
  "unit": "unit type",
  "category": "category name",
  "confidence": 0.0 to 1.0
}

If information is missing or unclear, use null for that field.
Only return valid JSON, no explanations.`;

    const result = await genAI.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }]
        }
      ]
    });
    
    const text = result.text || '';
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    return null;
  } catch (error) {
    console.error('[Gemini] Voice extraction error:', error);
    return null;
  }
}

export async function detectLanguage(text) {
  try {
    const prompt = `Detect the language of this text: "${text}"

Return only one of these language codes: "en" (English), "te" (Telugu), "hi" (Hindi), or "mix" (mixed/Hinglish).

Only return the language code, nothing else.`;

    const result = await genAI.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }]
        }
      ]
    });
    
    const text_response = (result.text || '').trim().toLowerCase();
    
    if (text_response.includes('te')) return 'te';
    if (text_response.includes('hi')) return 'hi';
    if (text_response.includes('mix')) return 'mix';
    return 'en';
  } catch (error) {
    console.error('[Gemini] Language detection error:', error);
    return 'en';
  }
}

export async function semanticProductSearch(query, products) {
  try {
    const productList = products.map(p => `${p.id}: ${p.name} (${p.category})`).join('\n');

    const prompt = `You are a smart product search assistant for a quick commerce app.

User query: "${query}"

Available products (format: id: name (category)):
${productList}

Find products that match the user's intent. Consider:
- Synonyms (e.g., "vegetables" includes tomato, onion, etc.)
- Category matches (e.g., "breakfast items" includes milk, bread, etc.)
- Telugu/Hindi/English variations
- Common misspellings

Return a JSON array of matching product IDs ordered by relevance:
["product_id_1", "product_id_2", ...]

Return up to 10 most relevant matches.
Only return valid JSON array, no explanations.`;

    const result = await genAI.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }]
        }
      ]
    });
    
    const text = result.text || '';
    
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const productIds = JSON.parse(jsonMatch[0]);
      return products.filter(p => productIds.includes(p.id));
    }
    
    return [];
  } catch (error) {
    console.error('[Gemini] Semantic search error:', error);
    return [];
  }
}

export async function chatAssistant(message, conversationHistory, products, cartItems) {
  try {
    const productList = products.map(p => `- ${p.name} (₹${p.discountedPrice || p.price})`).join('\n');
    
    const systemContext = `You are a helpful shopping assistant for DUKAAN (దుకాణ్), a quick commerce app.

Available products:
${productList}

Current cart: ${cartItems.length > 0 ? cartItems.map(i => `${i.name} x${i.quantity}`).join(', ') : 'Empty'}

Help the user with:
1. Finding products
2. Suggesting items based on needs (e.g., "breakfast items", "weekly groceries")
3. Answering questions about products
4. Providing helpful shopping tips

Be friendly, concise, and helpful. Respond in the same language the user uses (English or Telugu).
Keep responses short (2-3 sentences max).`;

    const prompt = `${systemContext}

Conversation:
${conversationHistory.slice(-5).map(h => `${h.role}: ${h.message}`).join('\n')}
User: ${message}

Your response:`;

    const result = await genAI.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }]
        }
      ]
    });
    
    return (result.text || '').trim();
  } catch (error) {
    console.error('[Gemini] Chat error:', error);
    return 'Sorry, I had trouble understanding that. Can you try again?';
  }
}
