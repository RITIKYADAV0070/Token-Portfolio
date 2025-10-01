import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Wallet } from 'lucide-react';

const Header = () => {
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Wallet className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Crypto Portfolio</h1>
              <p className="text-xs text-muted-foreground">Track your tokens</p>
            </div>
          </div>
          
          <ConnectButton />
        </div>
      </div>
    </header>
  );
};

export default Header;
