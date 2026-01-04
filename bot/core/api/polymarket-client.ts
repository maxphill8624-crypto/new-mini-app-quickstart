import { ClobClient } from '@polymarket/clob-client';
import { ethers } from 'ethers';
import { Market, Token, Order } from '../../types';
import axios from 'axios';

export class PolymarketClient {
  private clobClient: ClobClient;
  private wallet: ethers.Wallet;
  private initialized: boolean = false;

  constructor(
    private privateKey: string,
    private chainId: number = 137,
    private host: string = 'https://clob.polymarket.com'
  ) {
    this.wallet = new ethers.Wallet(privateKey);
  }

  async initialize(): Promise<void> {
    try {
      this.clobClient = new ClobClient(
        this.host,
        this.chainId,
        this.wallet
      );
      this.initialized = true;
      console.log('Polymarket client initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Polymarket client:', error);
      throw error;
    }
  }

  async getMarkets(limit: number = 100): Promise<Market[]> {
    this.ensureInitialized();

    try {
      const response = await axios.get('https://gamma-api.polymarket.com/markets', {
        params: { limit, active: true }
      });

      return response.data.map((market: any) => ({
        id: market.condition_id,
        question: market.question,
        tokens: market.tokens?.map((token: any) => ({
          tokenId: token.token_id,
          outcome: token.outcome,
          price: parseFloat(token.price || '0'),
          volume: parseFloat(token.volume || '0')
        })) || [],
        volume: parseFloat(market.volume || '0'),
        liquidity: parseFloat(market.liquidity || '0'),
        endDate: new Date(market.end_date_iso),
        active: market.active
      }));
    } catch (error) {
      console.error('Error fetching markets:', error);
      throw error;
    }
  }

  async getMarketById(marketId: string): Promise<Market | null> {
    this.ensureInitialized();

    try {
      const response = await axios.get(`https://gamma-api.polymarket.com/markets/${marketId}`);
      const market = response.data;

      return {
        id: market.condition_id,
        question: market.question,
        tokens: market.tokens?.map((token: any) => ({
          tokenId: token.token_id,
          outcome: token.outcome,
          price: parseFloat(token.price || '0'),
          volume: parseFloat(token.volume || '0')
        })) || [],
        volume: parseFloat(market.volume || '0'),
        liquidity: parseFloat(market.liquidity || '0'),
        endDate: new Date(market.end_date_iso),
        active: market.active
      };
    } catch (error) {
      console.error('Error fetching market:', error);
      return null;
    }
  }

  async getOrderBook(tokenId: string): Promise<{ bids: any[], asks: any[] }> {
    this.ensureInitialized();

    try {
      const orderBook = await this.clobClient.getOrderBook(tokenId);
      return {
        bids: orderBook.bids || [],
        asks: orderBook.asks || []
      };
    } catch (error) {
      console.error('Error fetching order book:', error);
      return { bids: [], asks: [] };
    }
  }

  async placeOrder(order: Order): Promise<string | null> {
    this.ensureInitialized();

    try {
      const orderArgs = {
        tokenID: order.tokenId,
        price: order.price,
        size: order.size,
        side: order.side,
        feeRateBps: 0
      };

      const signedOrder = await this.clobClient.createOrder(orderArgs);
      const response = await this.clobClient.postOrder(signedOrder);

      console.log('Order placed successfully:', response.orderID);
      return response.orderID;
    } catch (error) {
      console.error('Error placing order:', error);
      return null;
    }
  }

  async cancelOrder(orderId: string): Promise<boolean> {
    this.ensureInitialized();

    try {
      await this.clobClient.cancelOrder(orderId);
      console.log('Order cancelled successfully:', orderId);
      return true;
    } catch (error) {
      console.error('Error cancelling order:', error);
      return false;
    }
  }

  async getBalance(): Promise<number> {
    this.ensureInitialized();

    try {
      const balance = await this.clobClient.getBalance();
      return parseFloat(balance.toString());
    } catch (error) {
      console.error('Error fetching balance:', error);
      return 0;
    }
  }

  async getOpenOrders(): Promise<any[]> {
    this.ensureInitialized();

    try {
      const orders = await this.clobClient.getOrders();
      return orders || [];
    } catch (error) {
      console.error('Error fetching open orders:', error);
      return [];
    }
  }

  private ensureInitialized(): void {
    if (!this.initialized) {
      throw new Error('Client not initialized. Call initialize() first.');
    }
  }
}
