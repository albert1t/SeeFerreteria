import { useState, useEffect } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { SearchBar } from './SearchBar';
import { QrModal } from './QrModal';
import { Modal } from './Modal';
import { FichaTecnica } from './FichaTecnica';
import { FormRecambio } from './FormRecambio';
import { Footer } from './Footer';
import { ThemeToggle } from './ThemeToggle';
import { btnStyle } from '../styles/theme';
import logoBlue from '../assets/logoCMH_blue_300.png';
import logoWhite from '../assets/logoCMH_white_300.png';
import * as pedidosApi from '../api/pedidos';
import * as importacionesApi from '../api/importaciones';
import type { Recambio } from '../types';

const TARIFA_OBSOLESCENCIA_DIAS = 180;

const navBtn: React.CSSProperties = {
  padding: '8px 18px', background: 'transparent', border: '1px solid var(--border-input-strong)',
  borderRadius: 8, color: 'var(--text-nav)', cursor: 'pointer', fontSize: 13, fontWeight: 600,
  textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap',
};

export function Layout() {
  const { user, logout, isAdmin, can } = useAuth();
  const { resolved } = useTheme();
  const [qrOpen, setQrOpen] = useState(false);
  const [fichaRecambio, setFichaRecambio] = useState<Recambio | null>(null);
  const [crearRecambio, setCrearRecambio] = useState(false);
  const [panelSeleccionado, setPanelSeleccionado] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [tarifaAlertDescartada, setTarifaAlertDescartada] = useState(false);

  const puedeTarifas = can('tarifas', 'edit');

  const { data: tarifaStatus } = useQuery({
    queryKey: ['importaciones', 'festo', 'status'],
    queryFn: () => importacionesApi.getImportacionStatus('festo'),
    enabled: puedeTarifas,
    refetchInterval: 30_000,
  });

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const outletContext = { panelSeleccionado, setPanelSeleccionado, setCrearRecambio };

  const { data: urgentes } = useQuery({
    queryKey: ['pedidos', 'urgentes'],
    queryFn: () => pedidosApi.getUrgentesCount(),
    refetchInterval: 30000,
  });

  function closeMenu() { setMenuOpen(false); }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)', overflow: 'hidden' }}>
      <header style={{
        background: 'var(--header-bg)',
        borderBottom: '1px solid var(--border-strong)', padding: '0 1.5rem', height: 64, flexShrink: 0,
        display: 'flex', alignItems: 'center', gap: '1rem', position: 'sticky', top: 0, zIndex: 100,
        boxShadow: '0 2px 20px var(--shadow-strong)',
      }}>
        <button className="mobile-hamburger" onClick={() => setMenuOpen((p) => !p)} style={{
          background: 'none', border: '1px solid var(--border-input-strong)', borderRadius: 8,
          color: 'var(--text-nav)', cursor: 'pointer', fontSize: 22, padding: '6px 10px', lineHeight: 1,
          display: 'none',
        }}>
          ☰
        </button>

        <NavLink to="/" onClick={() => { setPanelSeleccionado(null); closeMenu(); }} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}>
          <div style={{
            fontWeight: 800,
            fontSize: 20,
            color: 'var(--accent)',
            letterSpacing: '0.05em',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            whiteSpace: 'nowrap',
            cursor: 'pointer',
          }}>
            <img
              src={resolved === 'light' ? logoBlue : logoWhite}
              width={60}
              height={60}
              alt="Logo"
              style={{ display: 'block', marginTop: 10 }}
            />
            <span>FERRETERÍA</span>
          </div>
        </NavLink>

        <SearchBar onSelect={(r) => { setFichaRecambio(r); closeMenu(); }} placeholder={isMobile ? 'Búsqueda' : undefined} />
        <button className="qr-btn" style={{
          ...navBtn,
          background: 'var(--accent)',
          borderColor: 'var(--accent)',
          color: '#ffffff',
          fontFamily: 'inherit',
          fontWeight: 800,
          fontSize: 14,
          letterSpacing: '0.05em',
          boxShadow: '0 2px 12px var(--shadow-strong)',
        }} onClick={() => setQrOpen(true)} title="Buscar por QR">QR</button>

        <nav className="desktop-only" style={{ display: 'flex', gap: 6 }}>
          <NavLink to="/" end onClick={() => setPanelSeleccionado(null)} style={({ isActive }) => ({ ...navBtn, ...(isActive ? { background: 'var(--bg-hover-strong)', borderColor: 'var(--accent)', color: 'var(--accent)' } : {}) })}>
            Almacén
          </NavLink>
          <NavLink to="/pedidos" style={({ isActive }) => ({ ...navBtn, position: 'relative', ...(isActive ? { background: 'var(--bg-hover-strong)', borderColor: 'var(--accent)', color: 'var(--accent)' } : {}) })}>
            Pedidos
            {(urgentes?.count ?? 0) > 0 && (
              <span style={{
                position: 'absolute', top: -4, right: -4, background: 'var(--danger)', color: '#fff',
                borderRadius: '50%', width: 16, height: 16, fontSize: 9,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700,
              }}>
                {urgentes!.count}
              </span>
            )}
          </NavLink>
          {isAdmin && (
            <NavLink to="/usuarios" style={({ isActive }) => ({ ...navBtn, ...(isActive ? { background: 'var(--bg-hover-strong)', borderColor: 'var(--accent)', color: 'var(--accent)' } : {}) })}>
              Usuarios
            </NavLink>
          )}
          {can('recambios', 'viewDataPage') && (
            <NavLink to="/datos" style={({ isActive }) => ({ ...navBtn, ...(isActive ? { background: 'var(--bg-hover-strong)', borderColor: 'var(--accent)', color: 'var(--accent)' } : {}) })}>
              Datos
            </NavLink>
          )}
        </nav>

        <div className="desktop-only" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ThemeToggle />
        </div>
        <div className="desktop-only" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 18, fontWeight: 600 }}>{user?.name}</div>
            <div style={{ fontSize: 14, color: 'var(--text-dim)', textTransform: 'uppercase' }}>{user?.role}</div>
          </div>
          <button style={{ ...btnStyle('ghost'), padding: '6px 10px', fontSize: 12 }} onClick={() => logout()}>Salir</button>
        </div>
      </header>

      {puedeTarifas && tarifaStatus?.diasDesdeUltima != null && tarifaStatus.diasDesdeUltima > TARIFA_OBSOLESCENCIA_DIAS && !tarifaAlertDescartada && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12, margin: '0 1.5rem',
          marginTop: '1rem', padding: '0.75rem 1rem',
          background: 'var(--bg-danger-soft)', border: '1px solid var(--border-danger-strong)',
          borderRadius: 8, color: 'var(--danger-text)', fontSize: 13,
        }}>
          <span style={{ flex: 1 }}>
            ⚠️ La tarifa de precios de Festo tiene más de 6 meses de antigüedad ({tarifaStatus.diasDesdeUltima} días). Importa un nuevo CSV para mantener los PVP orientativos al día.{' '}
            <NavLink to="/admin/importar-tarifas-festo" onClick={closeMenu} style={{ color: 'var(--danger-text)', fontWeight: 700 }}>Ir a importar</NavLink>
          </span>
          <button
            type="button"
            onClick={() => setTarifaAlertDescartada(true)}
            style={{
              background: 'none', border: 'none', color: 'var(--danger-text)', cursor: 'pointer',
              fontSize: 16, lineHeight: 1, padding: 2, flexShrink: 0,
            }}
            title="Descartar"
          >
            ✕
          </button>
        </div>
      )}

      {/* Mobile drawer — dropdown desde la izquierda del navbar */}
      {menuOpen && (
        <div className="mobile-drawer-overlay" onClick={closeMenu} style={{
          position: 'fixed', inset: 0, zIndex: 99, background: 'var(--overlay-soft)',
        }} />
      )}
      <div className="mobile-drawer" style={{
        position: 'fixed', top: 0, left: 0, bottom: 0, width: 280,
        background: 'var(--bg-elevated)', borderRight: '1px solid var(--border-strong)', zIndex: 110,
        transform: menuOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.25s ease', display: 'flex', flexDirection: 'column',
        padding: '1rem', gap: 8, boxShadow: '4px 0 20px var(--shadow-strong)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
          <button onClick={closeMenu} style={{ background: 'none', border: 'none', color: 'var(--text-nav)', fontSize: 24, cursor: 'pointer', padding: 4 }}>✕</button>
        </div>
        <NavLink to="/" end onClick={() => { setPanelSeleccionado(null); closeMenu(); }} style={({ isActive }) => ({
          ...navBtn, justifyContent: 'center', padding: '12px 18px', fontSize: 14,
          ...(isActive ? { background: 'var(--bg-hover-strong)', borderColor: 'var(--accent)', color: 'var(--accent)' } : {}),
        })}>
          Almacén
        </NavLink>
        <NavLink to="/pedidos" onClick={closeMenu} style={({ isActive }) => ({
          ...navBtn, justifyContent: 'center', padding: '12px 18px', fontSize: 14, position: 'relative',
          ...(isActive ? { background: 'var(--bg-hover-strong)', borderColor: 'var(--accent)', color: 'var(--accent)' } : {}),
        })}>
          Pedidos {(urgentes?.count ?? 0) > 0 ? `(${urgentes!.count})` : ''}
        </NavLink>
        {isAdmin && (
          <NavLink to="/usuarios" onClick={closeMenu} style={({ isActive }) => ({
            ...navBtn, justifyContent: 'center', padding: '12px 18px', fontSize: 14,
            ...(isActive ? { background: 'var(--bg-hover-strong)', borderColor: 'var(--accent)', color: 'var(--accent)' } : {}),
          })}>
            Usuarios
          </NavLink>
        )}
        {can('recambios', 'viewDataPage') && (
          <NavLink to="/datos" onClick={closeMenu} style={({ isActive }) => ({
            ...navBtn, justifyContent: 'center', padding: '12px 18px', fontSize: 14,
            ...(isActive ? { background: 'var(--bg-hover-strong)', borderColor: 'var(--accent)', color: 'var(--accent)' } : {}),
          })}>
            Datos
          </NavLink>
        )}
        <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border-soft)', paddingTop: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-light)' }}>{user?.name}</div>
          <div style={{ fontSize: 11, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: 8 }}>{user?.role}</div>
          <div style={{ marginBottom: 8 }}>
            <ThemeToggle />
          </div>
          <button style={{ ...btnStyle('ghost'), width: '100%', justifyContent: 'center', padding: '10px' }} onClick={() => { logout(); closeMenu(); }}>Salir</button>
        </div>
      </div>

      <main style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}><Outlet context={outletContext} /></div>
        <Footer />
      </main>

      <QrModal open={qrOpen} onClose={() => setQrOpen(false)} onFound={setFichaRecambio} />

      <Modal
        open={!!fichaRecambio}
        onClose={() => setFichaRecambio(null)}
        title={fichaRecambio ? `Ficha Técnica - ${fichaRecambio.referenciaCMH}` : ''}
        wide
      >
        {fichaRecambio && (
          <FichaTecnica
            recambio={fichaRecambio}
            onClose={() => setFichaRecambio(null)}
            onUpdated={setFichaRecambio}
          />
        )}
      </Modal>

        <Modal open={crearRecambio} onClose={() => setCrearRecambio(false)} title="Nuevo Recambio" wide>
        <FormRecambio
          onSave={() => setCrearRecambio(false)}
          onCancel={() => setCrearRecambio(false)}
        />
      </Modal>
    </div>
  );
}
