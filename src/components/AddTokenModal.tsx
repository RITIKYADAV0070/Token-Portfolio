import { useState, useEffect, useRef, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { addTokens } from '../store/portfolioSlice';
import { coingeckoAPI } from '../services/coingecko';
import { Token } from '../store/portfolioSlice';
import { X, Search, TrendingUp, Loader2 } from 'lucide-react';

interface AddTokenModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddTokenModal = ({ isOpen, onClose }: AddTokenModalProps) => {
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Token[]>([]);
  const [trendingTokens, setTrendingTokens] = useState<Token[]>([]);
  const [marketTokens, setMarketTokens] = useState<Token[]>([]);
  const [selectedTokens, setSelectedTokens] = useState<Set<string>>(new Set());
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingTrending, setIsLoadingTrending] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      loadTrendingTokens();
      loadMarketTokens(1);
    }
  }, [isOpen]);

  useEffect(() => {
    if (searchQuery) {
      const debounce = setTimeout(() => {
        searchTokens();
      }, 500);
      return () => clearTimeout(debounce);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const loadTrendingTokens = async () => {
    setIsLoadingTrending(true);
    try {
      const tokens = await coingeckoAPI.getTrendingTokens();
      setTrendingTokens(tokens);
    } catch (error) {
      console.error('Failed to load trending tokens:', error);
    } finally {
      setIsLoadingTrending(false);
    }
  };

  const loadMarketTokens = async (page: number) => {
    setIsLoadingMore(true);
    try {
      const tokens = await coingeckoAPI.getMarketTokens(page);
      setMarketTokens(prev => page === 1 ? tokens : [...prev, ...tokens]);
      setCurrentPage(page);
    } catch (error) {
      console.error('Failed to load market tokens:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const searchTokens = async () => {
    setIsSearching(true);
    try {
      const tokens = await coingeckoAPI.searchTokens(searchQuery);
      setSearchResults(tokens);
    } catch (error) {
      console.error('Failed to search tokens:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current || isLoadingMore || searchQuery) return;
    
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    if (scrollHeight - scrollTop <= clientHeight * 1.5) {
      loadMarketTokens(currentPage + 1);
    }
  }, [currentPage, isLoadingMore, searchQuery]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  const toggleToken = (tokenId: string) => {
    setSelectedTokens(prev => {
      const newSet = new Set(prev);
      if (newSet.has(tokenId)) {
        newSet.delete(tokenId);
      } else {
        newSet.add(tokenId);
      }
      return newSet;
    });
  };

  const handleAddTokens = () => {
    const allTokens = searchQuery ? searchResults : [...trendingTokens, ...marketTokens];
    const tokensToAdd = allTokens.filter(token => selectedTokens.has(token.id));
    dispatch(addTokens(tokensToAdd));
    handleClose();
  };

  const handleClose = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSelectedTokens(new Set());
    setCurrentPage(1);
    setMarketTokens([]);
    onClose();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 8,
    }).format(value);
  };

  if (!isOpen) return null;

  const displayTokens = searchQuery ? searchResults : marketTokens;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="bg-card rounded-2xl border border-border w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl">
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-foreground">Add Token</h2>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-secondary rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search tokens..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-6">
          {!searchQuery && trendingTokens.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Trending
                </h3>
              </div>
              <div className="space-y-2">
                {isLoadingTrending ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : (
                  trendingTokens.map(token => (
                    <TokenRow
                      key={token.id}
                      token={token}
                      isSelected={selectedTokens.has(token.id)}
                      onToggle={() => toggleToken(token.id)}
                      formatCurrency={formatCurrency}
                    />
                  ))
                )}
              </div>
            </div>
          )}

          <div>
            {!searchQuery && (
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                {searchQuery ? 'Search Results' : 'All Tokens'}
              </h3>
            )}
            <div className="space-y-2">
              {isSearching ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : displayTokens.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No tokens found
                </div>
              ) : (
                <>
                  {displayTokens.map(token => (
                    <TokenRow
                      key={token.id}
                      token={token}
                      isSelected={selectedTokens.has(token.id)}
                      onToggle={() => toggleToken(token.id)}
                      formatCurrency={formatCurrency}
                    />
                  ))}
                  {isLoadingMore && (
                    <div className="flex justify-center py-4">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-border">
          <button
            onClick={handleAddTokens}
            disabled={selectedTokens.size === 0}
            className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Add to Watchlist ({selectedTokens.size})
          </button>
        </div>
      </div>
    </div>
  );
};

interface TokenRowProps {
  token: Token;
  isSelected: boolean;
  onToggle: () => void;
  formatCurrency: (value: number) => string;
}

const TokenRow = ({ token, isSelected, onToggle, formatCurrency }: TokenRowProps) => {
  const isPositive = token.price_change_percentage_24h >= 0;

  return (
    <button
      onClick={onToggle}
      className={`w-full p-3 rounded-lg border transition-all ${
        isSelected
          ? 'border-primary bg-primary/10'
          : 'border-border hover:border-primary/50 hover:bg-secondary/50'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
          isSelected ? 'border-primary bg-primary' : 'border-border'
        }`}>
          {isSelected && <div className="w-2 h-2 rounded-full bg-primary-foreground" />}
        </div>
        <img
          src={token.image}
          alt={token.name}
          className="w-8 h-8 rounded-full"
        />
        <div className="flex-1 text-left">
          <div className="font-semibold text-foreground">{token.name}</div>
          <div className="text-sm text-muted-foreground uppercase">{token.symbol}</div>
        </div>
        <div className="text-right">
          <div className="font-mono text-foreground">{formatCurrency(token.current_price)}</div>
          <div className={`text-sm font-semibold ${isPositive ? 'text-success' : 'text-danger'}`}>
            {isPositive ? '+' : ''}{token.price_change_percentage_24h.toFixed(2)}%
          </div>
        </div>
      </div>
    </button>
  );
};

export default AddTokenModal;
