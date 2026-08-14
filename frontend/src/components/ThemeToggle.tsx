import { useTheme, type ResolvedTheme } from '../hooks/useTheme';

export function ThemeToggle() {
  const { choice, resolved, setChoice } = useTheme();
  const active: ResolvedTheme = choice === 'system' ? resolved : choice;

  const thumbTranslate = active === 'dark' ? 30 : 0;

  return (
    <div
      role="group"
      aria-label="Tema"
      title="Cambiar entre tema claro y oscuro"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        position: 'relative',
        padding: 3,
        borderRadius: 999,
        border: '1px solid var(--border-input-strong)',
        background: 'var(--bg-input-dark)',
        width: 70,
        height: 32,
        boxSizing: 'border-box',
        flexShrink: 0,
      }}
    >
      <div style={{
        position: 'absolute',
        top: 3,
        left: 3,
        width: 30,
        height: 24,
        borderRadius: 999,
        background: 'var(--accent)',
        boxShadow: '0 2px 8px var(--shadow-strong)',
        transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: `translateX(${thumbTranslate}px)`,
      }} />
      <button
        type="button"
        title="Tema claro"
        aria-label="Tema claro"
        aria-pressed={active === 'light'}
        onClick={() => setChoice('light')}
        style={{
          flex: 1,
          height: '100%',
          border: 'none',
          background: 'transparent',
          cursor: 'pointer',
          borderRadius: 999,
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 14,
          lineHeight: 1,
          padding: 0,
          filter: active === 'light' ? 'none' : 'grayscale(1) opacity(0.55)',
          transition: 'filter 0.2s',
        }}
      >
        ☀️
      </button>
      <button
        type="button"
        title="Tema oscuro"
        aria-label="Tema oscuro"
        aria-pressed={active === 'dark'}
        onClick={() => setChoice('dark')}
        style={{
          flex: 1,
          height: '100%',
          border: 'none',
          background: 'transparent',
          cursor: 'pointer',
          borderRadius: 999,
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 14,
          lineHeight: 1,
          padding: 0,
          filter: active === 'dark' ? 'none' : 'grayscale(1) opacity(0.55)',
          transition: 'filter 0.2s',
        }}
      >
        🌙
      </button>
    </div>
  );
}