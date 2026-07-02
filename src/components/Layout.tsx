import { useState, useEffect } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import { SearchBar } from './SearchBar';
import { QrModal } from './QrModal';
import { Modal } from './Modal';
import { FichaTecnica } from './FichaTecnica';
import { FormRecambio } from './FormRecambio';
import { btnStyle } from '../styles/theme';
import * as pedidosApi from '../api/pedidos';
import type { Recambio } from '../types';

const navBtn: React.CSSProperties = {
  padding: '8px 18px', background: 'transparent', border: '1px solid rgba(77,184,255,0.3)',
  borderRadius: 8, color: '#a8cce8', cursor: 'pointer', fontSize: 13, fontWeight: 600,
  textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap',
};

export function Layout() {
  const { user, logout, isAdmin } = useAuth();
  const [qrOpen, setQrOpen] = useState(false);
  const [fichaRecambio, setFichaRecambio] = useState<Recambio | null>(null);
  const [crearRecambio, setCrearRecambio] = useState(false);
  const [panelSeleccionado, setPanelSeleccionado] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const outletContext = { panelSeleccionado, setPanelSeleccionado };

  const { data: urgentes } = useQuery({
    queryKey: ['pedidos', 'urgentes'],
    queryFn: () => pedidosApi.getUrgentesCount(),
    refetchInterval: 30000,
  });

  function closeMenu() { setMenuOpen(false); }

  return (
    <div style={{ minHeight: '100vh', background: '#0d1b2e' }}>
      <header style={{
        background: 'linear-gradient(135deg, #0f2744 0%, #1a3a5c 100%)',
        borderBottom: '1px solid #2a5080', padding: '0 1.5rem', height: 64,
        display: 'flex', alignItems: 'center', gap: '1rem', position: 'sticky', top: 0, zIndex: 100,
        boxShadow: '0 2px 20px rgba(0,0,0,0.4)',
      }}>
        <button className="mobile-hamburger" onClick={() => setMenuOpen((p) => !p)} style={{
          background: 'none', border: '1px solid rgba(77,184,255,0.3)', borderRadius: 8,
          color: '#a8cce8', cursor: 'pointer', fontSize: 22, padding: '6px 10px', lineHeight: 1,
          display: 'none',
        }}>
          ☰
        </button>

        <NavLink to="/" onClick={() => { setPanelSeleccionado(null); closeMenu(); }} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}>
          <div style={{
            fontWeight: 800,
            fontSize: 20,
            color: '#4db8ff',
            letterSpacing: '0.05em',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            whiteSpace: 'nowrap',
            cursor: 'pointer',
          }}>
            <img
              src="https://ferreteriastorageacc.blob.core.windows.net/simpleblob/assets/logoCMH_transparent.png"
              width={60}
              height={60}
              alt="Logo"
              style={{ display: 'block', marginTop: 10 }}
            />
            <span>FERRETERÍA</span>
          </div>
        </NavLink>

        <SearchBar onSelect={(r) => { setFichaRecambio(r); closeMenu(); }} placeholder={isMobile ? 'Buscar recambio' : undefined} />
        <button style={navBtn} onClick={() => setQrOpen(true)} title="Buscar por QR">QR</button>

        <nav className="desktop-only" style={{ display: 'flex', gap: 6 }}>
          <NavLink to="/" end onClick={() => setPanelSeleccionado(null)} style={({ isActive }) => ({ ...navBtn, ...(isActive ? { background: 'rgba(77,184,255,0.15)', borderColor: '#4db8ff', color: '#4db8ff' } : {}) })}>
            Almacén
          </NavLink>
          <NavLink to="/pedidos" style={({ isActive }) => ({ ...navBtn, position: 'relative', ...(isActive ? { background: 'rgba(77,184,255,0.15)', borderColor: '#4db8ff', color: '#4db8ff' } : {}) })}>
            Pedidos
            {(urgentes?.count ?? 0) > 0 && (
              <span style={{
                position: 'absolute', top: -4, right: -4, background: '#c0392b', color: '#fff',
                borderRadius: '50%', width: 16, height: 16, fontSize: 9,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700,
              }}>
                {urgentes!.count}
              </span>
            )}
          </NavLink>
        </nav>

        <div className="desktop-only" style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          {isAdmin && (
            <button style={btnStyle('primary')} onClick={() => setCrearRecambio(true)}>+ Nuevo Recambio</button>
          )}
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 12, fontWeight: 600 }}>{user?.name}</div>
            <div style={{ fontSize: 10, color: '#4a7aaa', textTransform: 'uppercase' }}>{user?.role}</div>
          </div>
          <button style={{ ...btnStyle('ghost'), padding: '6px 10px', fontSize: 12 }} onClick={() => logout()}>Salir</button>
        </div>
      </header>

      {/* Mobile drawer — dropdown desde la izquierda del navbar */}
      {menuOpen && (
        <div className="mobile-drawer-overlay" onClick={closeMenu} style={{
          position: 'fixed', inset: 0, zIndex: 99, background: 'rgba(0,0,0,0.5)',
        }} />
      )}
      <div className="mobile-drawer" style={{
        position: 'fixed', top: 0, left: 0, bottom: 0, width: 280,
        background: '#0f2744', borderRight: '1px solid #2a5080', zIndex: 110,
        transform: menuOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.25s ease', display: 'flex', flexDirection: 'column',
        padding: '1rem', gap: 8, boxShadow: '4px 0 20px rgba(0,0,0,0.5)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
          <button onClick={closeMenu} style={{ background: 'none', border: 'none', color: '#a8cce8', fontSize: 24, cursor: 'pointer', padding: 4 }}>✕</button>
        </div>
        <NavLink to="/" end onClick={() => { setPanelSeleccionado(null); closeMenu(); }} style={({ isActive }) => ({
          ...navBtn, justifyContent: 'center', padding: '12px 18px', fontSize: 14,
          ...(isActive ? { background: 'rgba(77,184,255,0.15)', borderColor: '#4db8ff', color: '#4db8ff' } : {}),
        })}>
          Almacén
        </NavLink>
        <NavLink to="/pedidos" onClick={closeMenu} style={({ isActive }) => ({
          ...navBtn, justifyContent: 'center', padding: '12px 18px', fontSize: 14, position: 'relative',
          ...(isActive ? { background: 'rgba(77,184,255,0.15)', borderColor: '#4db8ff', color: '#4db8ff' } : {}),
        })}>
          Pedidos {(urgentes?.count ?? 0) > 0 ? `(${urgentes!.count})` : ''}
        </NavLink>
        {isAdmin && (
          <button style={{ ...btnStyle('primary'), justifyContent: 'center', padding: '12px 18px', fontSize: 14 }} onClick={() => { setCrearRecambio(true); closeMenu(); }}>
            + Nuevo Recambio
          </button>
        )}
        <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(42,80,128,0.5)', paddingTop: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#c8ddf0' }}>{user?.name}</div>
          <div style={{ fontSize: 11, color: '#4a7aaa', textTransform: 'uppercase', marginBottom: 8 }}>{user?.role}</div>
          <button style={{ ...btnStyle('ghost'), width: '100%', justifyContent: 'center', padding: '10px' }} onClick={() => { logout(); closeMenu(); }}>Salir</button>
        </div>
      </div>

      <main><Outlet context={outletContext} /></main>

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
