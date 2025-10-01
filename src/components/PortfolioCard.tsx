import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { TrendingUp } from 'lucide-react';

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

const PortfolioCard = () => {
  const { watchlist, lastUpdated } = useSelector((state: RootState) => state.portfolio);

  const portfolioData = useMemo(() => {
    const total = watchlist.reduce((sum, token) => sum + (token.holdings * token.current_price), 0);
    
    const chartData = watchlist
      .filter(token => token.holdings > 0)
      .map((token, index) => ({
        name: token.symbol.toUpperCase(),
        value: token.holdings * token.current_price,
        color: COLORS[index % COLORS.length],
      }))
      .sort((a, b) => b.value - a.value);

    return { total, chartData };
  }, [watchlist]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatTime = (isoString: string | null) => {
    if (!isoString) return 'Never';
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <div className="bg-card rounded-2xl border border-border p-6 shadow-lg">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Portfolio Total
            </h2>
          </div>
          <div className="text-4xl font-bold text-foreground mb-4">
            {formatCurrency(portfolioData.total)}
          </div>
          <p className="text-sm text-muted-foreground">
            Last updated: {formatTime(lastUpdated)}
          </p>
        </div>

        {portfolioData.chartData.length > 0 && (
          <div className="w-full lg:w-80 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={portfolioData.chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {portfolioData.chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '0.5rem',
                    color: 'hsl(var(--foreground))',
                  }}
                />
                <Legend 
                  verticalAlign="middle" 
                  align="right"
                  layout="vertical"
                  iconType="circle"
                  formatter={(value) => <span className="text-sm text-foreground">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default PortfolioCard;
