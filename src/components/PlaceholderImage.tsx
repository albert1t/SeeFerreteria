interface PlaceholderProps {
  size?: number;
  style?: React.CSSProperties;
}

export function EmptySlot({ size = 90, style }: PlaceholderProps) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 8,
        border: '2px dashed rgba(255,255,255,0.15)',
        background: 'rgba(255,255,255,0.02)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'rgba(255,255,255,0.25)',
        fontSize: size * 0.12,
        fontWeight: 600,
        gap: 4,
        flexShrink: 0,
        ...style,
      }}
    >
      <svg width={size * 0.35} height={size * 0.35} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="6" width="18" height="12" rx="2" />
        <path d="M3 10h18" strokeDasharray="2 2" />
      </svg>
      Vacío
    </div>
  );
}

export function NoImageSlot({ size = 90, style }: PlaceholderProps) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 8,
        border: '1px solid rgba(255,255,255,0.08)',
        background: 'rgba(255,255,255,0.04)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'rgba(255,255,255,0.35)',
        fontSize: size * 0.11,
        fontWeight: 500,
        gap: 4,
        flexShrink: 0,
        ...style,
      }}
    >
      <svg width={size * 0.35} height={size * 0.35} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
      </svg>
      Sin imagen
    </div>
  );
}
