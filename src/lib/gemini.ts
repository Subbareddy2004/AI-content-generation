import { GoogleGenerativeAI } from '@google/generative-ai';

if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
  throw new Error('Missing NEXT_PUBLIC_GEMINI_API_KEY environment variable');
}

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);

export interface ContentGenerationParams {
  topic: string;
  platform: 'blog' | 'twitter' | 'linkedin' | 'facebook';
  tone: 'professional' | 'casual' | 'friendly' | 'formal';
  length: 'short' | 'medium' | 'long';
  keywords?: string[];
  brandGuidelines?: string;
}

export async function generateContent(params: ContentGenerationParams): Promise<string> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  try {
    const result = await model.generateContent({
      contents: [{
        role: 'user',
        parts: [{
          text: `Generate content for ${params.platform} with the following specifications:
          Topic: ${params.topic}
          Tone: ${params.tone}
          Length: ${params.length}
          ${params.keywords ? `Keywords to include: ${params.keywords.join(', ')}` : ''}
          ${params.brandGuidelines ? `Brand Guidelines: ${params.brandGuidelines}` : ''}

          Please ensure the content is engaging, well-structured, and optimized for the specified platform.`
        }]
      }]
    });
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating content:', error);
    throw error;
  }
}

export async function optimizeContent(content: string, platform: string): Promise<string> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  try {
    const prompt = `
      Optimize the following content for ${platform}, ensuring it follows platform best practices 
      and maximizes engagement potential while maintaining the original message:

      ${content}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error optimizing content:', error);
    throw error;
  }
}

export async function analyzeSentiment(content: string): Promise<{
  sentiment: 'positive' | 'neutral' | 'negative';
  score: number;
}> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  try {
    const prompt = `
      Analyze the sentiment of the following content and provide a score between -1 (negative) 
      and 1 (positive), with 0 being neutral.

      Content to analyze:
      ${content}

      Respond with a valid JSON object in this exact format:
      {"score": <number between -1 and 1>}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    try {
      const analysis = JSON.parse(text);
      if (typeof analysis.score !== 'number' || analysis.score < -1 || analysis.score > 1) {
        throw new Error('Invalid score value');
      }
      
      return {
        sentiment: analysis.score > 0.2 ? 'positive' : analysis.score < -0.2 ? 'negative' : 'neutral',
        score: analysis.score
      };
    } catch (parseError) {
      console.error('Failed to parse sentiment analysis response:', parseError);
      throw new Error('Invalid sentiment analysis response format');
    }
  } catch (error) {
    console.error('Error during sentiment analysis:', error);
    throw error;
  }
}