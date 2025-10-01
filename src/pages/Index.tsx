import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { updatePrices } from '../store/portfolioSlice';
import { coingeckoAPI } from '../services/coingecko';
import Header from '../components/Header';
import PortfolioCard from '../components/PortfolioCard';
import WatchlistTable from '../components/WatchlistTable';
import AddTokenModal from '../components/AddTokenModal';
import { Plus, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

const Index = () => {
  const dispatch = useDispatch();
  const { watchlist } = useSelector((state: RootState) => state.portfolio);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefreshPrices = async () => {
    if (watchlist.length === 0) {
      toast.error('No tokens in watchlist');
      return;
    }

    setIsRefreshing(true);
    try {
      const ids = watchlist.map(token => token.id);
      const updatedTokens = await coingeckoAPI.getTokenPrices(ids);
      dispatch(updatePrices(updatedTokens));
      toast.success('Prices updated successfully');
    } catch (error) {
      console.error('Failed to refresh prices:', error);
      toast.error('Failed to refresh prices');
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <PortfolioCard />
        </div>

        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">Watchlist</h2>
          <div className="flex gap-3">
            <button
              onClick={handleRefreshPrices}
              disabled={isRefreshing || watchlist.length === 0}
              className="px-4 py-2 bg-secondary text-foreground rounded-lg font-medium hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh Prices
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Token
            </button>
          </div>
        </div>

        <WatchlistTable />
      </main>

      <AddTokenModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default Index;
