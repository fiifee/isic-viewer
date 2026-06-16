export interface IsicCardData {
  korgkool: string;
  nimi: string;
  synniaeg: string;
  isikukood: string;
  kehtivusaeg: string;
  photoUrl: string;
}

export interface FieldPosition {
  left: number;
  top: number;
}

export interface PhotoPosition extends FieldPosition {
  width: number;
  height: number;
}

export interface FieldPositions {
  nimi: FieldPosition;
  korgkool: FieldPosition;
  isikukood: FieldPosition;
  synniaeg: FieldPosition;
  kehtivusaeg: FieldPosition;
  photo: PhotoPosition;
}

export const DEFAULT_POSITIONS: FieldPositions = {
  nimi:       { left: 4,    top: 51.5 },
  korgkool:   { left: 4,    top: 39.6 },
  isikukood:  { left: 4.2,  top: 75.6 },
  synniaeg:   { left: 4.2,  top: 63.8 },
  kehtivusaeg:{ left: 4.4,  top: 87.8 },
  photo:      { left: 65.1, top: 15.3, width: 32.2, height: 62.8 },
};

export const DEFAULT_CARD_DATA: IsicCardData = {
  korgkool: 'KOOL',
  nimi: 'Eesnimi Perenimi',
  synniaeg: 'DD.MM.YYYY',
  isikukood: 'XXXXXXXXXXX',
  kehtivusaeg: '09.2025-12.2026',
  photoUrl: '',
};
