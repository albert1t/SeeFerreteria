interface PlaceholderProps {
  size?: number;
  style?: React.CSSProperties;
  showText?: boolean;
}

function shouldShowText(size: number, showText?: boolean) {
  return showText !== false && size >= 48;
}

export function EmptySlot({ size = 90, style, showText }: PlaceholderProps) {
  const displayText = shouldShowText(size, showText);
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 8,
        border: '1px solid rgba(0,0,0,0.08)',
        background: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#6b7280',
        fontSize: size * 0.12,
        fontWeight: 600,
        gap: displayText ? 4 : 0,
        flexShrink: 0,
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        overflow: 'hidden',
        ...style,
      }}
    >
      <img
        src="/icons/empty-drawer.svg"
        alt="Vacío"
        style={{ width: size * 0.5, height: size * 0.5, objectFit: 'contain' }}
      />
      {displayText && <span>Vacío</span>}
    </div>
  );
}

export function NoImageSlot({ size = 90, style, showText }: PlaceholderProps) {
  const displayText = shouldShowText(size, showText);
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 8,
        border: '1px solid rgba(0,0,0,0.08)',
        background: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#2c5282',
        fontSize: size * 0.11,
        fontWeight: 600,
        gap: displayText ? 4 : 0,
        flexShrink: 0,
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        overflow: 'hidden',
        ...style,
      }}
    >
      <img
        src="/icons/screw.svg"
        alt="Sin imagen"
        style={{ width: size * 0.5, height: size * 0.5, objectFit: 'contain' }}
      />
      {displayText && <span>Sin imagen</span>}
    </div>
  );
}
