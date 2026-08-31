interface PlaceholderProps {
  size?: number;
  style?: React.CSSProperties;
  showText?: boolean;
}

function shouldShowText(size: number, showText?: boolean) {
  return showText !== false && size >= 48;
}

export function ScrewIcon({ style }: { style?: React.CSSProperties }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      style={{ width: '1em', height: '1em', ...style }}
    >
      <path
        fill="currentColor"
        d="M13.5 17v2L12 22l-1.5-3zm1-10.7l-1 .7V6h-3v3l-1 .7v1l5-3.3zm0 4l-1 .7V9l-3 2v2l-1 .7v1l5-3.3zm0 4l-1 .7v-2l-3 2v2l-1 .7v1l5-3.3zM8 2S7 2 7 3l3 2h4l3-2s0-1-1-1z"
      />
    </svg>
  );
}

export function EmptyDrawerIcon({ style }: { style?: React.CSSProperties }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      style={{ width: '1em', height: '1em', ...style }}
    >
      <path
        fill="currentColor"
        d="M20 21H4V10h2v9h12v-9h2zM3 3h18v6H3zm6.5 8h5c.28 0 .5.22.5.5V13H9v-1.5c0-.28.22-.5.5-.5M5 5v2h14V5z"
      />
    </svg>
  );
}

export function EmptySlot({ size = 90, style, showText }: PlaceholderProps) {
  const displayText = shouldShowText(size, showText);
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 8,
        border: '1px solid var(--border-soft-2)',
        background: 'var(--bg-input)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text-dim)',
        fontSize: size * 0.12,
        fontWeight: 600,
        gap: displayText ? 4 : 0,
        flexShrink: 0,
        boxShadow: 'var(--shadow-soft)',
        overflow: 'hidden',
        ...style,
      }}
    >
      <EmptyDrawerIcon style={{ width: size * 0.5, height: size * 0.5 }} />
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
        border: '1px solid var(--border-soft-2)',
        background: 'var(--bg-input)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--accent-dark)',
        fontSize: size * 0.11,
        fontWeight: 600,
        gap: displayText ? 4 : 0,
        flexShrink: 0,
        boxShadow: 'var(--shadow-soft)',
        overflow: 'hidden',
        ...style,
      }}
    >
      <ScrewIcon style={{ width: size * 0.5, height: size * 0.5 }} />
      {displayText && <span>Sin image</span>}
    </div>
  );
}
