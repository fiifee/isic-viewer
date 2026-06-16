import { useRef, useCallback, useState } from 'react';
import type { IsicCardData, FieldPositions, FieldPosition, PhotoPosition } from '../types';
import './IsicCard.css';

const CARD_ROTATION = -90; // degrees — must match CSS transform

interface Props {
  data: IsicCardData;
  positions: FieldPositions;
  onPositionChange: (key: keyof FieldPositions, pos: FieldPosition | PhotoPosition) => void;
}

/**
 * For a CARD_ROTATION of -90°, the card's visual orientation is:
 *   visual-right → card's internal bottom (top% increases)
 *   visual-down  → card's internal left  (left% decreases)
 *
 * getBoundingClientRect() returns the axis-aligned bounding box where
 * rect.width = visual height = card-height, rect.height = visual width = card-width.
 */

function visualToCard(
  clientX: number,
  clientY: number,
  rect: DOMRect
): { left: number; top: number } {
  const visualX = clientX - rect.left;
  const visualY = clientY - rect.top;
  // rect.width = card's internal height, rect.height = card's internal width
  const left = 100 - (visualY / rect.height) * 100;
  const top = (visualX / rect.width) * 100;
  return { left, top };
}

/**
 * A single draggable field overlay on the card.
 * Tracks mouse movement relative to the card element and updates position as %.
 */
function DraggableField({
  cardRef,
  position,
  onMove,
  className,
  children,
}: {
  cardRef: React.RefObject<HTMLDivElement | null>;
  position: FieldPosition;
  onMove: (pos: FieldPosition) => void;
  className: string;
  children: React.ReactNode;
}) {
  const [dragging, setDragging] = useState(false);
  const offsetRef = useRef({ dx: 0, dy: 0 });

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragging(true);
      const card = cardRef.current;
      if (!card) return;
      const rect = card.getBoundingClientRect();
      const vis = visualToCard(e.clientX, e.clientY, rect);
      offsetRef.current = {
        dx: vis.left - position.left,
        dy: vis.top - position.top,
      };
    },
    [cardRef, position]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!dragging) return;
      const card = cardRef.current;
      if (!card) return;
      const rect = card.getBoundingClientRect();
      const vis = visualToCard(e.clientX, e.clientY, rect);
      onMove({
        left: Math.max(0, Math.min(100, Math.round((vis.left - offsetRef.current.dx) * 10) / 10)),
        top: Math.max(0, Math.min(100, Math.round((vis.top - offsetRef.current.dy) * 10) / 10)),
      });
    },
    [dragging, cardRef, onMove]
  );

  const handleMouseUp = useCallback(() => {
    setDragging(false);
  }, []);

  return (
    <div
      className={`${className} ${dragging ? 'isic-dragging' : ''}`}
      style={{
        left: `${position.left}%`,
        top: `${position.top}%`,
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {children}
      <span className="isic-drag-handle" title="Drag to reposition">
        ⠿
      </span>
    </div>
  );
}

/**
 * Draggable + resizable photo overlay.
 * Drag the body to move, drag the bottom-right handle to resize.
 */
function DraggablePhoto({
  cardRef,
  position,
  onMove,
  children,
}: {
  cardRef: React.RefObject<HTMLDivElement | null>;
  position: PhotoPosition;
  onMove: (pos: PhotoPosition) => void;
  children: React.ReactNode;
}) {
  const [dragging, setDragging] = useState(false);
  const [resizing, setResizing] = useState(false);
  const offsetRef = useRef({ dx: 0, dy: 0 });
  const sizeRef = useRef({ w: 0, h: 0, startX: 0, startY: 0 });

  // --- Drag (move) --- rotation-aware
  const handleDragStart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragging(true);
      const card = cardRef.current;
      if (!card) return;
      const rect = card.getBoundingClientRect();
      const vis = visualToCard(e.clientX, e.clientY, rect);
      offsetRef.current = { dx: vis.left - position.left, dy: vis.top - position.top };
    },
    [cardRef, position]
  );

  // --- Resize (bottom-right handle) ---
  const handleResizeStart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setResizing(true);
      const card = cardRef.current;
      if (!card) return;
      const rect = card.getBoundingClientRect();
      sizeRef.current = {
        w: position.width,
        h: position.height,
        startX: e.clientX,
        startY: e.clientY,
      };
    },
    [cardRef, position]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const card = cardRef.current;
      if (!card) return;
      const rect = card.getBoundingClientRect();

      if (dragging) {
        const vis = visualToCard(e.clientX, e.clientY, rect);
        onMove({
          ...position,
          left: Math.max(0, Math.min(100, Math.round((vis.left - offsetRef.current.dx) * 10) / 10)),
          top: Math.max(0, Math.min(100, Math.round((vis.top - offsetRef.current.dy) * 10) / 10)),
        });
      }

      if (resizing) {
        // resize uses raw pixel deltas — works on visual coordinates
        const dx = ((e.clientX - sizeRef.current.startX) / rect.width) * 100;
        const dy = ((e.clientY - sizeRef.current.startY) / rect.height) * 100;
        // For resize, visual-right = taller (height), visual-down = wider (width) for -90°
        const newH = Math.max(5, Math.min(80, Math.round((sizeRef.current.h + dx) * 10) / 10));
        const newW = Math.max(5, Math.min(80, Math.round((sizeRef.current.w - dy) * 10) / 10));
        onMove({
          ...position,
          width: newW,
          height: newH,
        });
      }
    },
    [dragging, resizing, cardRef, onMove, position]
  );

  const handleMouseUp = useCallback(() => {
    setDragging(false);
    setResizing(false);
  }, []);

  return (
    <div
      className={`isic-photo-overlay ${dragging ? 'isic-dragging' : ''} ${resizing ? 'isic-resizing' : ''}`}
      style={{
        left: `${position.left}%`,
        top: `${position.top}%`,
        width: `${position.width}%`,
        height: `${position.height}%`,
      }}
      onMouseDown={handleDragStart}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {children}
      {/* Move handle (center) */}
      <span className="isic-drag-handle isic-drag-handle--photo" title="Drag to move">
        ⠿
      </span>
      {/* Resize handle (bottom-right corner) */}
      <span
        className="isic-resize-handle"
        title="Drag to resize"
        onMouseDown={handleResizeStart}
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M11 1L1 11M11 7v4H7M7 11h4" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </span>
    </div>
  );
}

/**
 * ISIC Card — template.png background with draggable overlay fields.
 */
export function IsicCard({ data, positions, onPositionChange }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);

  return (
    <div className="isic-card" ref={cardRef}>
      {/* Photo */}
      <DraggablePhoto
        cardRef={cardRef}
        position={positions.photo}
        onMove={pos => onPositionChange('photo', pos)}
      >
        {data.photoUrl ? (
          <img src={data.photoUrl} alt="" className="isic-photo-img" />
        ) : (
          <div className="isic-photo-empty" />
        )}
      </DraggablePhoto>

      {/* Nimi */}
      <DraggableField
        cardRef={cardRef}
        position={positions.nimi}
        onMove={pos => onPositionChange('nimi', pos)}
        className="isic-field-overlay isic-field--nimi"
      >
        <span className="isic-overlay-text">{data.nimi}</span>
      </DraggableField>

      {/* Kõrgkool */}
      <DraggableField
        cardRef={cardRef}
        position={positions.korgkool}
        onMove={pos => onPositionChange('korgkool', pos)}
        className="isic-field-overlay isic-field--korgkool"
      >
        <span className="isic-overlay-text">{data.korgkool}</span>
      </DraggableField>

      {/* Isikukood */}
      <DraggableField
        cardRef={cardRef}
        position={positions.isikukood}
        onMove={pos => onPositionChange('isikukood', pos)}
        className="isic-field-overlay isic-field--isikukood"
      >
        <span className="isic-overlay-text">{data.isikukood}</span>
      </DraggableField>

      {/* Sünniaeg */}
      <DraggableField
        cardRef={cardRef}
        position={positions.synniaeg}
        onMove={pos => onPositionChange('synniaeg', pos)}
        className="isic-field-overlay isic-field--synniaeg"
      >
        <span className="isic-overlay-text">{data.synniaeg}</span>
      </DraggableField>

      {/* Kehtivusaeg */}
      <DraggableField
        cardRef={cardRef}
        position={positions.kehtivusaeg}
        onMove={pos => onPositionChange('kehtivusaeg', pos)}
        className="isic-field-overlay isic-field--kehtivusaeg"
      >
        <span className="isic-overlay-text">{data.kehtivusaeg}</span>
      </DraggableField>
    </div>
  );
}

