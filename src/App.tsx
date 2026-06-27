import { useState } from 'react';
import { Match } from './api';
import MatchList from './components/MatchList';
import MatchDetailView from './components/MatchDetailView';
import { Footprints } from 'lucide-react';

function App() {
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

  return (
    <div className="min-h-screen bg-primary">
      {/* Header */}
      <header className="header-gradient sticky top-0 z-50 backdrop-blur-xl">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-accent/15 flex items-center justify-center">
              <Footprints size={18} className="text-accent" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-primary tracking-tight">Footcore</h1>
              <p className="text-[10px] text-muted -mt-0.5">Live Football</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-[10px]">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-live" />
              <span className="text-muted">your API</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-3xl mx-auto px-4 py-5">
        {selectedMatch ? (
          <MatchDetailView
            match={selectedMatch}
            onBack={() => setSelectedMatch(null)}
          />
        ) : (
          <MatchList />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-8">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between text-[10px] text-muted">
          <span>Footcore — Football Live Scores</span>
          <span>data from your API</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
