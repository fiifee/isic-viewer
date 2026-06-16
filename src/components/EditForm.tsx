import { useRef, useCallback } from 'react';
import type { IsicCardData } from '../types';
import './EditForm.css';

interface Props {
  data: IsicCardData;
  onChange: (updates: Partial<IsicCardData>) => void;
}

export function EditForm({ data, onChange }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFieldChange = useCallback(
    (field: keyof IsicCardData, value: string) => {
      onChange({ [field]: value });
    },
    [onChange]
  );

  const handlePhotoUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        onChange({ photoUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    },
    [onChange]
  );

  const handleRemovePhoto = useCallback(() => {
    onChange({ photoUrl: '' });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [onChange]);

  const fields: { key: keyof IsicCardData; label: string; placeholder: string }[] = [
    { key: 'nimi', label: 'Nimi', placeholder: 'MAALMAN / Maali' },
    { key: 'korgkool', label: 'Kõrgkool', placeholder: 'Tallinna Ülikool' },
    { key: 'isikukood', label: 'Isikukood', placeholder: '60101011234' },
    { key: 'synniaeg', label: 'Sünniaeg', placeholder: '01.01.2001' },
    { key: 'kehtivusaeg', label: 'Kehtivusaeg', placeholder: '09/2024 – 12/2025' },
  ];

  return (
    <div className="edit-form">
      {/* Photo section */}
      <div className="edit-form-photo-section">
        <label className="edit-form-label">Photo</label>
        <div className="edit-form-photo-controls">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            className="edit-form-file-input"
            id="photo-upload"
          />
          <label htmlFor="photo-upload" className="btn-upload">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            Choose Photo
          </label>
          {data.photoUrl && (
            <button className="btn-remove-photo" onClick={handleRemovePhoto}>
              Remove
            </button>
          )}
        </div>
        {data.photoUrl && (
          <div className="edit-form-photo-preview">
            <img src={data.photoUrl} alt="Preview" />
          </div>
        )}
      </div>

      {/* Text fields */}
      <div className="edit-form-fields">
        {fields.map(({ key, label, placeholder }) => (
          <div className="edit-form-field" key={key}>
            <label className="edit-form-label" htmlFor={`field-${key}`}>
              {label}
            </label>
            <input
              id={`field-${key}`}
              type="text"
              className="edit-form-input"
              value={data[key]}
              onChange={e => handleFieldChange(key, e.target.value)}
              placeholder={placeholder}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
