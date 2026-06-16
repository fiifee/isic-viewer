import { useState, useCallback, useRef } from 'react';
import { IsicCard } from './components/IsicCard';
import { SettingsModal } from './components/SettingsModal';
import type { IsicCardData, FieldPositions } from './types';
import { DEFAULT_CARD_DATA, DEFAULT_POSITIONS } from './types';
import './App.css';

export default function App() {
  const [cardData, setCardData] = useState<IsicCardData>(() => {
    try {
      const saved = localStorage.getItem('isic-card-data');
      return saved ? { ...DEFAULT_CARD_DATA, ...JSON.parse(saved) } : DEFAULT_CARD_DATA;
    } catch {
      return DEFAULT_CARD_DATA;
    }
  });

  const [fieldPositions, setFieldPositions] = useState<FieldPositions>(() => {
    try {
      const saved = localStorage.getItem('isic-field-positions');
      return saved ? { ...DEFAULT_POSITIONS, ...JSON.parse(saved) } : DEFAULT_POSITIONS;
    } catch {
      return DEFAULT_POSITIONS;
    }
  });

  const [showSettings, setShowSettings] = useState(false);

  const updateCardData = useCallback((updates: Partial<IsicCardData>) => {
    setCardData(prev => {
      const next = { ...prev, ...updates };
      localStorage.setItem('isic-card-data', JSON.stringify(next));
      return next;
    });
  }, []);

  const updateFieldPosition = useCallback(
    (key: keyof FieldPositions, pos: FieldPositions[typeof key]) => {
      setFieldPositions(prev => {
        const next = { ...prev, [key]: pos };
        localStorage.setItem('isic-field-positions', JSON.stringify(next));
        return next;
      });
    },
    []
  );

  // Zoom state
  const [zoom, setZoom] = useState(1);
  const lastDistRef = useRef<number>(0);
  const lastTapRef = useRef<number>(0);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setZoom(z => Math.max(0.5, Math.min(3, z - e.deltaY * 0.001)));
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      lastDistRef.current = dist;
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      if (lastDistRef.current > 0) {
        const delta = dist / lastDistRef.current;
        setZoom(z => Math.max(0.5, Math.min(3, z * delta)));
      }
      lastDistRef.current = dist;
    }
  }, []);

  const handleDoubleTap = useCallback(() => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      setZoom(z => (z > 1.5 ? 1 : 2));
    }
    lastTapRef.current = now;
  }, []);

  return (
    <div className="app">
      {/* Top bar with valid indicator + settings */}
      <div className="top-bar">
        <div className="valid-indicator">
          <span className="valid-indicator-dot" />
          <span className="valid-indicator-label">Valid</span>
          <span className="valid-indicator-time">
            {new Date().toLocaleString('et-EE', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })}
          </span>
        </div>
        <button
          className="settings-gear"
          onClick={() => setShowSettings(true)}
          aria-label="Settings"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
          </svg>
        </button>
      </div>

      <main className="app-main">
        <div
          className="zoom-container"
          onWheel={handleWheel}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onClick={handleDoubleTap}
          style={{ transform: `scale(${zoom})` }}
        >
          <IsicCard
            data={cardData}
            positions={fieldPositions}
            onPositionChange={updateFieldPosition}
          />
        </div>
      </main>

      {showSettings && (
        <SettingsModal
          data={cardData}
          onChange={updateCardData}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}
