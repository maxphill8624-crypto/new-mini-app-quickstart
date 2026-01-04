import Anthropic from '@anthropic-ai/sdk';
import { Market, AIAnalysis } from '../../types';

export class AIAnalyzer {
  private client: Anthropic;

  constructor(apiKey: string) {
    this.client = new Anthropic({ apiKey });
  }

  async analyzeMarket(market: Market): Promise<AIAnalysis | null> {
    try {
      const prompt = this.buildAnalysisPrompt(market);

      const response = await this.client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        messages: [{
          role: 'user',
          content: prompt
        }]
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        return null;
      }

      return this.parseAnalysis(market.id, market.question, content.text);
    } catch (error) {
      console.error('Error analyzing market with AI:', error);
      return null;
    }
  }

  async analyzeBatch(markets: Market[], maxAnalyses: number = 5): Promise<AIAnalysis[]> {
    const analyses: AIAnalysis[] = [];

    // Analyze top markets by volume
    const sortedMarkets = markets
      .sort((a, b) => b.volume - a.volume)
      .slice(0, maxAnalyses);

    for (const market of sortedMarkets) {
      const analysis = await this.analyzeMarket(market);
      if (analysis) {
        analyses.push(analysis);
      }
    }

    return analyses;
  }

  private buildAnalysisPrompt(market: Market): string {
    const tokenInfo = market.tokens
      .map(t => `${t.outcome}: $${t.price.toFixed(2)} (Volume: $${t.volume.toFixed(0)})`)
      .join('\n');

    return `Analyze this prediction market and provide a trading recommendation:

Market Question: ${market.question}

Current Prices:
${tokenInfo}

Market Stats:
- Total Volume: $${market.volume.toFixed(0)}
- Liquidity: $${market.liquidity.toFixed(0)}
- End Date: ${market.endDate.toISOString()}

Please provide your analysis in the following JSON format:
{
  "prediction": "YES" or "NO",
  "confidence": <number between 0 and 1>,
  "reasoning": "<brief explanation>",
  "recommendedAction": "BUY", "SELL", or "HOLD",
  "suggestedPrice": <price you'd recommend trading at>
}

Consider:
1. Current market pricing vs your assessment of probability
2. Market volume and liquidity
3. Time until resolution
4. Any obvious mispricing

Respond ONLY with the JSON, no additional text.`;
  }

  private parseAnalysis(marketId: string, question: string, responseText: string): AIAnalysis | null {
    try {
      // Extract JSON from response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('No JSON found in AI response');
        return null;
      }

      const parsed = JSON.parse(jsonMatch[0]);

      return {
        marketId,
        question,
        prediction: parsed.prediction,
        confidence: parseFloat(parsed.confidence),
        reasoning: parsed.reasoning,
        recommendedAction: parsed.recommendedAction,
        suggestedPrice: parseFloat(parsed.suggestedPrice)
      };
    } catch (error) {
      console.error('Error parsing AI analysis:', error);
      return null;
    }
  }

  async getMarketSentiment(question: string, newsContext?: string): Promise<number> {
    try {
      const prompt = `Based on this prediction market question: "${question}"${newsContext ? `\n\nRecent news: ${newsContext}` : ''}

Provide a probability estimate (0 to 1) for the YES outcome. Respond with ONLY a number between 0 and 1.`;

      const response = await this.client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 50,
        messages: [{
          role: 'user',
          content: prompt
        }]
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        return 0.5;
      }

      const probability = parseFloat(content.text.trim());
      return isNaN(probability) ? 0.5 : Math.max(0, Math.min(1, probability));
    } catch (error) {
      console.error('Error getting market sentiment:', error);
      return 0.5; // Default to neutral
    }
  }
}
