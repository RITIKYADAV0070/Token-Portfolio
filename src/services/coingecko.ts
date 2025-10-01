import axios from 'axios';
import { Token } from '../store/portfolioSlice';

const BASE_URL = 'https://api.coingecko.com/api/v3';

export const coingeckoAPI = {
  searchTokens: async (query: string): Promise<Token[]> => {
    const response = await axios.get(`${BASE_URL}/search`, {
      params: { query },
    });
    
    const coins = response.data.coins.slice(0, 50);
    const ids = coins.map((coin: any) => coin.id).join(',');
    
    if (!ids) return [];
    
    const priceResponse = await axios.get(`${BASE_URL}/coins/markets`, {
      params: {
        vs_currency: 'usd',
        ids,
        sparkline: true,
      },
    });
    
    return priceResponse.data;
  },

  getTrendingTokens: async (): Promise<Token[]> => {
    const response = await axios.get(`${BASE_URL}/search/trending`);
    const trendingIds = response.data.coins.map((item: any) => item.item.id).join(',');
    
    if (!trendingIds) return [];
    
    const priceResponse = await axios.get(`${BASE_URL}/coins/markets`, {
      params: {
        vs_currency: 'usd',
        ids: trendingIds,
        sparkline: true,
      },
    });
    
    return priceResponse.data;
  },

  getTokenPrices: async (ids: string[]): Promise<Token[]> => {
    if (!ids.length) return [];
    
    const response = await axios.get(`${BASE_URL}/coins/markets`, {
      params: {
        vs_currency: 'usd',
        ids: ids.join(','),
        sparkline: true,
      },
    });
    
    return response.data;
  },

  getMarketTokens: async (page: number = 1): Promise<Token[]> => {
    const response = await axios.get(`${BASE_URL}/coins/markets`, {
      params: {
        vs_currency: 'usd',
        order: 'market_cap_desc',
        per_page: 20,
        page,
        sparkline: true,
      },
    });
    
    return response.data;
  },
};
