import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { updateHoldings, removeToken } from '../store/portfolioSlice';
import Sparkline from './Sparkline';
import { MoreVertical, Pencil, Trash2 } from 'lucide-react';

const WatchlistTable = () => {
  const dispatch = useDispatch();
  const { watchlist } = useSelector((state: RootState) => state.portfolio);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(watchlist.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedWatchlist = watchlist.slice(startIndex, startIndex + itemsPerPage);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 8,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const handleEditStart = (id: string, currentHoldings: number) => {
    setEditingId(id);
    setEditValue(currentHoldings.toString());
    setOpenMenu(null);
  };

  const handleEditSave = (id: string) => {
    const value = parseFloat(editValue);
    if (!isNaN(value) && value >= 0) {
      dispatch(updateHoldings({ id, holdings: value }));
    }
    setEditingId(null);
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditValue('');
  };

  const handleDelete = (id: string) => {
    dispatch(removeToken(id));
    setOpenMenu(null);
  };

  if (watchlist.length === 0) {
    return (
      <div className="bg-card rounded-2xl border border-border p-12 text-center">
        <p className="text-muted-foreground text-lg">No tokens in watchlist</p>
        <p className="text-muted-foreground text-sm mt-2">Click "Add Token" to get started</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-secondary/50">
            <tr className="border-b border-border">
              <th className="text-left px-6 py-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Token
              </th>
              <th className="text-right px-6 py-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Price
              </th>
              <th className="text-right px-6 py-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                24h %
              </th>
              <th className="px-6 py-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                7d Chart
              </th>
              <th className="text-right px-6 py-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Holdings
              </th>
              <th className="text-right px-6 py-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Value
              </th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody>
            {paginatedWatchlist.map((token) => {
              const value = token.holdings * token.current_price;
              const isPositive = token.price_change_percentage_24h >= 0;

              return (
                <tr key={token.id} className="border-b border-border hover:bg-secondary/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={token.image}
                        alt={token.name}
                        className="w-8 h-8 rounded-full"
                      />
                      <div>
                        <div className="font-semibold text-foreground">{token.name}</div>
                        <div className="text-sm text-muted-foreground uppercase">{token.symbol}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-foreground">
                    {formatCurrency(token.current_price)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`font-semibold ${isPositive ? 'text-success' : 'text-danger'}`}>
                      {formatPercent(token.price_change_percentage_24h)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {token.sparkline_in_7d?.price && (
                      <div className="w-32 h-12">
                        <Sparkline
                          data={token.sparkline_in_7d.price}
                          isPositive={isPositive}
                        />
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {editingId === token.id ? (
                      <input
                        type="number"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={() => handleEditSave(token.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleEditSave(token.id);
                          if (e.key === 'Escape') handleEditCancel();
                        }}
                        className="w-24 px-2 py-1 bg-secondary border border-border rounded text-foreground text-right"
                        autoFocus
                      />
                    ) : (
                      <button
                        onClick={() => handleEditStart(token.id, token.holdings)}
                        className="font-mono text-foreground hover:text-primary transition-colors"
                      >
                        {token.holdings.toLocaleString()}
                      </button>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right font-mono font-semibold text-foreground">
                    {formatCurrency(value)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="relative">
                      <button
                        onClick={() => setOpenMenu(openMenu === token.id ? null : token.id)}
                        className="p-2 hover:bg-secondary rounded-lg transition-colors"
                      >
                        <MoreVertical className="w-4 h-4 text-muted-foreground" />
                      </button>
                      {openMenu === token.id && (
                        <div className="absolute right-0 mt-2 w-48 bg-popover border border-border rounded-lg shadow-lg z-10">
                          <button
                            onClick={() => handleEditStart(token.id, token.holdings)}
                            className="w-full px-4 py-2 text-left hover:bg-secondary flex items-center gap-2 text-foreground rounded-t-lg"
                          >
                            <Pencil className="w-4 h-4" />
                            Edit Holdings
                          </button>
                          <button
                            onClick={() => handleDelete(token.id)}
                            className="w-full px-4 py-2 text-left hover:bg-secondary flex items-center gap-2 text-danger rounded-b-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                            Remove
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="px-6 py-4 flex items-center justify-between border-t border-border">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, watchlist.length)} of {watchlist.length} tokens
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-lg bg-secondary text-foreground hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-lg bg-secondary text-foreground hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WatchlistTable;
