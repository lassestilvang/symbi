import { EmotionalState, HealthMetrics, HealthGoals } from '../types';
import { StorageService } from './StorageService';

/**
 * AIBrainService
 * 
 * Integrates with Gemini API to analyze health data and determine emotional states.
 * Implements caching, timeout, and retry logic for robust AI-powered analysis.
 * 
 * Requirements: 5.3, 5.4, 6.1, 6.2, 6.3, 11.2
 */

export interface AIAnalysisResult {
  emotionalState: EmotionalState;
  confidence: number;
  reasoning?: string;
}

export interface EvolutionContext {
  daysActive: number;
  dominantStates: EmotionalState[];
  userPreferences?: any;
}

export class AIBrainService {
  private static readonly GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';
  private static readonly GEMINI_IMAGE_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent';
  private static readonly TIMEOUT_MS = 10000; // 10 seconds
  private static readonly MAX_RETRIES = 2;
  private static readonly CACHE_KEY = 'ai_analysis_cache';
  private static readonly CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Analyze health data using Gemini API to determine emotional state
   * Implements caching, timeout, and retry logic
   * 
   * @param metrics Current health metrics (steps, sleep, HRV)
   * @param goals User's health goals
   * @returns AI analysis result with emotional state
   */
  async analyzeHealthData(
    metrics: HealthMetrics,
    goals: HealthGoals
  ): Promise<AIAnalysisResult> {
    // Check cache first
    const cachedResult = await this.getCachedAnalysis(metrics);
    if (cachedResult) {
      console.log('Using cached AI analysis');
      return cachedResult;
    }

    // Attempt analysis with retries
    let lastError: Error | null = null;
    for (let attempt = 1; attempt <= AIBrainService.MAX_RETRIES; attempt++) {
      try {
        console.log(`AI analysis attempt ${attempt}/${AIBrainService.MAX_RETRIES}`);
        const result = await this.performAnalysis(metrics, goals);
        
        // Cache successful result
        await this.cacheAnalysis(metrics, result);
        
        return result;
      } catch (error) {
        lastError = error as Error;
        console.error(`AI analysis attempt ${attempt} failed:`, error);
        
        // Don't retry on the last attempt
        if (attempt < AIBrainService.MAX_RETRIES) {
          // Wait before retrying (exponential backoff)
          await this.delay(1000 * attempt);
        }
      }
    }

    // All retries failed
    throw new Error(`AI analysis failed after ${AIBrainService.MAX_RETRIES} attempts: ${lastError?.message}`);
  }

  /**
   * Generate an evolved appearance for the Symbi using Gemini Image API
   * Implements retry logic (up to 3 attempts) and caches the generated image locally
   * 
   * Requirements: 8.2, 8.3
   * 
   * @param context Evolution context with level and dominant states
   * @returns Data URL of the generated image (base64 encoded)
   */
  async generateEvolvedAppearance(context: EvolutionContext): Promise<string> {
    const prompt = this.constructEvolutionPrompt(context);
    const maxRetries = 3;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Evolution image generation attempt ${attempt}/${maxRetries}`);
        
        const response = await this.callGeminiImageAPI(prompt);
        
        // Extract image data from response
        const imageUrl = this.extractImageUrl(response);
        
        // Cache the image locally
        await this.cacheEvolutionImage(context, imageUrl);
        
        console.log('Evolution image generated successfully');
        return imageUrl;
      } catch (error) {
        lastError = error as Error;
        console.error(`Evolution image generation attempt ${attempt} failed:`, error);
        
        // Don't retry on the last attempt
        if (attempt < maxRetries) {
          // Wait before retrying (exponential backoff: 2s, 4s)
          await this.delay(2000 * attempt);
        }
      }
    }

    // All retries failed
    throw new Error(`Evolution image generation failed after ${maxRetries} attempts: ${lastError?.message}`);
  }

  /**
   * Perform the actual analysis by calling Gemini API
   */
  private async performAnalysis(
    metrics: HealthMetrics,
    goals: HealthGoals
  ): Promise<AIAnalysisResult> {
    const prompt = this.constructAnalysisPrompt(metrics, goals);

    const response = await this.callGeminiAPI(prompt);
    
    return this.parseAnalysisResponse(response);
  }

  /**
   * Construct the prompt for emotional state analysis
   */
  private constructAnalysisPrompt(metrics: HealthMetrics, goals: HealthGoals): string {
    return `You are the "brain" for a digital pet called Symbi. Your job is to analyze the user's health data and determine their overall emotional state in ONE WORD.

Choose from: [Vibrant, Calm, Tired, Stressed, Anxious, Rested, Active, Sad, Resting]

Health Data:
- Steps: ${metrics.steps} (goal: ${goals.targetSteps})
- Sleep: ${metrics.sleepHours !== undefined ? `${metrics.sleepHours} hours` : 'not available'} (goal: ${goals.targetSleepHours} hours)
- HRV: ${metrics.hrv !== undefined ? `${metrics.hrv}ms` : 'not available'} (higher is better, typical range: 20-100)

Rules:
- Vibrant: Exceeding goals, high HRV (>60), excellent sleep (>7 hours)
- Active: Meeting step goals (>80% of target), decent sleep
- Calm: Good sleep (>7 hours), moderate activity, good HRV
- Rested: Excellent sleep (>8 hours), lower activity is okay
- Tired: Low sleep (<6 hours), any activity level
- Stressed: Low HRV (<40), high activity, low sleep
- Anxious: Low HRV (<40), erratic patterns, moderate sleep
- Resting: Moderate activity (40-80% of step goal), average sleep
- Sad: Very low activity (<40% of step goal), any sleep level

Respond with ONLY ONE WORD from the list above. No explanation, just the emotional state.`;
  }

  /**
   * Construct the prompt for evolution image generation
   */
  private constructEvolutionPrompt(context: EvolutionContext): string {
    const levelDescriptions = [
      'Subtle glow, small wings',
      'Brighter colors, larger wings, sparkles',
      'Crown or halo, multiple tails, energy aura',
      'Ethereal armor, magical symbols',
      'Fully transcendent form, cosmic elements'
    ];

    const level = Math.min(context.daysActive / 30, 5);
    const levelIndex = Math.floor(level) - 1;
    const description = levelDescriptions[Math.max(0, Math.min(levelIndex, 4))];

    return `Generate an evolved version of a cute Halloween ghost creature (Symbi).

Base characteristics:
- Purple color palette (#7C3AED to #9333EA)
- Ghost-like floating form
- Cute but slightly spooky aesthetic
- Rounded shapes

Evolution level: ${Math.floor(level)}
Dominant emotional states: ${context.dominantStates.join(', ')}

Add new features that reflect ${Math.floor(level)} evolution levels of healthy habits:
${description}

Style: Digital art, vibrant colors, Halloween theme, cute but powerful`;
  }

  /**
   * Call Gemini API with timeout
   */
  private async callGeminiAPI(prompt: string): Promise<any> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), AIBrainService.TIMEOUT_MS);

    try {
      const response = await fetch(
        `${AIBrainService.GEMINI_API_URL}?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: prompt
              }]
            }],
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 10,
            }
          }),
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Gemini API request timed out');
      }
      
      throw error;
    }
  }

  /**
   * Call Gemini Image API
   */
  private async callGeminiImageAPI(prompt: string): Promise<any> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 seconds for image generation

    try {
      const response = await fetch(
        `${AIBrainService.GEMINI_IMAGE_API_URL}?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: prompt
              }]
            }],
            generationConfig: {
              temperature: 0.7,
            }
          }),
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Gemini Image API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Gemini Image API request timed out');
      }
      
      throw error;
    }
  }

  /**
   * Parse the Gemini API response to extract emotional state
   */
  private parseAnalysisResponse(response: any): AIAnalysisResult {
    try {
      // Extract text from Gemini response
      const text = response.candidates?.[0]?.content?.parts?.[0]?.text?.trim().toLowerCase();
      
      if (!text) {
        throw new Error('No text in Gemini response');
      }

      // Map response to EmotionalState enum
      const stateMap: Record<string, EmotionalState> = {
        'vibrant': EmotionalState.VIBRANT,
        'calm': EmotionalState.CALM,
        'tired': EmotionalState.TIRED,
        'stressed': EmotionalState.STRESSED,
        'anxious': EmotionalState.ANXIOUS,
        'rested': EmotionalState.RESTED,
        'active': EmotionalState.ACTIVE,
        'sad': EmotionalState.SAD,
        'resting': EmotionalState.RESTING,
      };

      const emotionalState = stateMap[text];
      
      if (!emotionalState) {
        throw new Error(`Invalid emotional state from AI: ${text}`);
      }

      return {
        emotionalState,
        confidence: 0.9, // Gemini doesn't provide confidence, use default
        reasoning: text,
      };
    } catch (error) {
      console.error('Error parsing AI response:', error);
      throw new Error('Failed to parse AI response');
    }
  }

  /**
   * Extract image URL from Gemini Image API response
   */
  private extractImageUrl(response: any): string {
    // Note: This is a placeholder implementation
    // Actual implementation depends on Gemini Image API response format
    const imageData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData;
    
    if (imageData) {
      // Convert base64 to data URL
      return `data:${imageData.mimeType};base64,${imageData.data}`;
    }
    
    throw new Error('No image data in response');
  }

  /**
   * Get cached analysis if available and not expired
   */
  private async getCachedAnalysis(metrics: HealthMetrics): Promise<AIAnalysisResult | null> {
    try {
      const cache = await StorageService.get<any>(AIBrainService.CACHE_KEY);
      
      if (!cache) {
        return null;
      }

      const cacheAge = Date.now() - cache.timestamp;
      
      // Check if cache is expired
      if (cacheAge > AIBrainService.CACHE_DURATION_MS) {
        return null;
      }

      // Check if metrics match (simple comparison)
      if (
        cache.metrics.steps === metrics.steps &&
        cache.metrics.sleepHours === metrics.sleepHours &&
        cache.metrics.hrv === metrics.hrv
      ) {
        return cache.result;
      }

      return null;
    } catch (error) {
      console.error('Error reading cache:', error);
      return null;
    }
  }

  /**
   * Cache analysis result
   */
  private async cacheAnalysis(metrics: HealthMetrics, result: AIAnalysisResult): Promise<void> {
    try {
      await StorageService.set(AIBrainService.CACHE_KEY, {
        metrics,
        result,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error('Error caching analysis:', error);
      // Don't throw - caching failure shouldn't break the flow
    }
  }

  /**
   * Cache evolution image locally
   */
  private async cacheEvolutionImage(context: EvolutionContext, imageUrl: string): Promise<void> {
    try {
      const cacheKey = `@symbi:evolution_image_${context.daysActive}`;
      await StorageService.set(cacheKey, {
        imageUrl,
        context,
        timestamp: Date.now(),
      });
      console.log('Evolution image cached successfully');
    } catch (error) {
      console.error('Error caching evolution image:', error);
      // Don't throw - caching failure shouldn't break the flow
    }
  }

  /**
   * Delay helper for retry logic
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
