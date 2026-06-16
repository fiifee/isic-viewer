import { EditForm } from './EditForm';
import type { IsicCardData } from '../types';
import './SettingsModal.css';

interface Props {
  data: IsicCardData;
  onChange: (updates: Partial<IsicCardData>) => void;
  onClose: () => void;
}

export function SettingsModal({ data, onChange, onClose }: Props) {
  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-panel" onClick={e => e.stopPropagation()}>
        <div className="settings-header">
          <h2 className="settings-title">Card Settings</h2>
          <button className="settings-close" onClick={onClose} aria-label="Close settings">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="settings-body">
          <EditForm data={data} onChange={onChange} />
        </div>
      </div>
    </div>
  );
}
