import { useState, useCallback } from 'react';
import { AIResponse } from '../types';

interface UseNutritionAIResult {
  analyzeFood: (description: string, apiKey: string) => Promise<AIResponse | null>;
  isLoading: boolean;
  error: string | null;
}

export const useNutritionAI = (): UseNutritionAIResult => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeFood = useCallback(async (description: string, apiKey: string): Promise<AIResponse | null> => {
    console.log('🍎 analyzeFood called', { description, apiKey: apiKey ? 'Present' : 'Missing' });
    
    if (!description.trim()) {
      setError('Please enter a food description');
      return null;
    }

    if (!apiKey.trim()) {
      setError('Please set your OpenAI API key in settings');
      return null;
    }

    console.log('✅ Starting food analysis...');
    setIsLoading(true);
    setError(null);

    const systemPrompt = `You are a nutritional analysis API. Your task is to analyze food descriptions and return accurate nutritional estimates in JSON format.

Rules:
1. Always return valid JSON
2. Estimate calories and macronutrients based on standard serving sizes
3. Be reasonably accurate for common foods
4. If you cannot identify the food, return null for all values except foodName which should be "Unknown"
5. Include reasonable estimates even for ambiguous descriptions

Output format:
{
  "foodName": "string",
  "calories": number,
  "protein_g": number,
  "carbs_g": number,
  "fat_g": number,
  "servingSize": "string"
}`;

    const userPrompt = `Analyze this food description and return nutritional information: "${description}"

Respond with only the JSON object, no markdown formatting, no additional text.`;

    try {
      console.log('🌐 Making food analysis API call to OpenAI...');
      
      const requestBody = {
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: 200,
      };
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify(requestBody),
      });

      console.log('📥 Food analysis response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Food analysis API Error:', errorData);
        
        if (response.status === 401) {
          throw new Error('Invalid API key. Please check your OpenAI API key in settings.');
        } else if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please try again in a moment.');
        } else {
          throw new Error(errorData.error?.message || 'Failed to analyze food');
        }
      }

      const data = await response.json();
      console.log('✅ Food analysis response received:', data);
      
      const content = data.choices[0]?.message?.content;

      if (!content) {
        console.error('❌ No content in food analysis response');
        throw new Error('No response from AI');
      }
      
      console.log('📝 Food analysis content:', content);

      // Clean up the response (remove markdown code blocks if present)
      const cleanedContent = content.replace(/```json\s*|\s*```/g, '').trim();
      
      const parsedResponse: AIResponse = JSON.parse(cleanedContent);
      
      // Validate the response has required fields
      if (!parsedResponse.foodName || typeof parsedResponse.calories !== 'number') {
        throw new Error('Invalid response format from AI');
      }

      return parsedResponse;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze food';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { analyzeFood, isLoading, error };
};
