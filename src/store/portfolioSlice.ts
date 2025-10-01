import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Token {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  sparkline_in_7d?: {
    price: number[];
  };
}

export interface WatchlistToken extends Token {
  holdings: number;
}

interface PortfolioState {
  watchlist: WatchlistToken[];
  lastUpdated: string | null;
}

const STORAGE_KEY = 'crypto_portfolio_watchlist';

const loadFromStorage = (): WatchlistToken[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveToStorage = (watchlist: WatchlistToken[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(watchlist));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
};

const initialState: PortfolioState = {
  watchlist: loadFromStorage(),
  lastUpdated: null,
};

const portfolioSlice = createSlice({
  name: 'portfolio',
  initialState,
  reducers: {
    addTokens: (state, action: PayloadAction<Token[]>) => {
      action.payload.forEach((token) => {
        const exists = state.watchlist.find((t) => t.id === token.id);
        if (!exists) {
          state.watchlist.push({ ...token, holdings: 0 });
        }
      });
      saveToStorage(state.watchlist);
    },
    removeToken: (state, action: PayloadAction<string>) => {
      state.watchlist = state.watchlist.filter((t) => t.id !== action.payload);
      saveToStorage(state.watchlist);
    },
    updateHoldings: (state, action: PayloadAction<{ id: string; holdings: number }>) => {
      const token = state.watchlist.find((t) => t.id === action.payload.id);
      if (token) {
        token.holdings = action.payload.holdings;
        saveToStorage(state.watchlist);
      }
    },
    updatePrices: (state, action: PayloadAction<Token[]>) => {
      action.payload.forEach((updatedToken) => {
        const token = state.watchlist.find((t) => t.id === updatedToken.id);
        if (token) {
          token.current_price = updatedToken.current_price;
          token.price_change_percentage_24h = updatedToken.price_change_percentage_24h;
          token.sparkline_in_7d = updatedToken.sparkline_in_7d;
          token.image = updatedToken.image;
        }
      });
      state.lastUpdated = new Date().toISOString();
      saveToStorage(state.watchlist);
    },
  },
});

export const { addTokens, removeToken, updateHoldings, updatePrices } = portfolioSlice.actions;
export default portfolioSlice.reducer;
