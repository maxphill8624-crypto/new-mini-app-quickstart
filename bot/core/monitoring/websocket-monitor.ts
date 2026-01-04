import WebSocket from 'ws';
import { Market } from '../../types';

export type PriceUpdateCallback = (tokenId: string, price: number, volume: number) => void;

export class WebSocketMonitor {
  private ws: WebSocket | null = null;
  private reconnectInterval: number = 5000;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private subscriptions: Set<string> = new Set();
  private callbacks: PriceUpdateCallback[] = [];

  constructor(
    private wsUrl: string = 'wss://ws-subscriptions-clob.polymarket.com/ws/market'
  ) {}

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.wsUrl);

        this.ws.on('open', () => {
          console.log('WebSocket connected to Polymarket');
          this.resubscribeAll();
          resolve();
        });

        this.ws.on('message', (data: WebSocket.Data) => {
          this.handleMessage(data);
        });

        this.ws.on('close', () => {
          console.log('WebSocket disconnected');
          this.scheduleReconnect();
        });

        this.ws.on('error', (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  subscribeToMarket(tokenId: string): void {
    if (this.subscriptions.has(tokenId)) {
      return;
    }

    this.subscriptions.add(tokenId);

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const subscribeMessage = JSON.stringify({
        type: 'subscribe',
        market: tokenId
      });
      this.ws.send(subscribeMessage);
      console.log(`Subscribed to market: ${tokenId}`);
    }
  }

  subscribeToMarkets(markets: Market[]): void {
    for (const market of markets) {
      for (const token of market.tokens) {
        this.subscribeToMarket(token.tokenId);
      }
    }
  }

  unsubscribeFromMarket(tokenId: string): void {
    if (!this.subscriptions.has(tokenId)) {
      return;
    }

    this.subscriptions.delete(tokenId);

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const unsubscribeMessage = JSON.stringify({
        type: 'unsubscribe',
        market: tokenId
      });
      this.ws.send(unsubscribeMessage);
      console.log(`Unsubscribed from market: ${tokenId}`);
    }
  }

  onPriceUpdate(callback: PriceUpdateCallback): void {
    this.callbacks.push(callback);
  }

  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.subscriptions.clear();
    console.log('WebSocket monitor disconnected');
  }

  private handleMessage(data: WebSocket.Data): void {
    try {
      const message = JSON.parse(data.toString());

      // Handle different message types
      if (message.type === 'price_update' || message.event_type === 'price_change') {
        const tokenId = message.market || message.token_id;
        const price = parseFloat(message.price || message.last_price || '0');
        const volume = parseFloat(message.volume || '0');

        // Notify all callbacks
        this.callbacks.forEach(callback => {
          callback(tokenId, price, volume);
        });
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  }

  private resubscribeAll(): void {
    const subscriptionsCopy = Array.from(this.subscriptions);
    this.subscriptions.clear();

    for (const tokenId of subscriptionsCopy) {
      this.subscribeToMarket(tokenId);
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      return;
    }

    console.log(`Reconnecting in ${this.reconnectInterval / 1000} seconds...`);

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect().catch(error => {
        console.error('Reconnection failed:', error);
      });
    }, this.reconnectInterval);
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}
