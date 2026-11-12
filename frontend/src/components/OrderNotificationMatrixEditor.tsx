import { ORDER_NOTIFICATION_EVENTS, ORDER_TYPES, type OrderNotificationMatrix } from '../types';

const EVENT_LABELS: Record<(typeof ORDER_NOTIFICATION_EVENTS)[number], string> = {
  created: 'Al crear el pedido',
  'Pedido realizado': 'Pasa a Pedido realizado',
  'Pedido recibido': 'Pasa a Pedido recibido',
  Finalizado: 'Pasa a Finalizado',
};

interface OrderNotificationMatrixEditorProps {
  value: OrderNotificationMatrix;
  onChange: (next: OrderNotificationMatrix) => void;
  disabled?: boolean;
}

export function OrderNotificationMatrixEditor({ value, onChange, disabled }: OrderNotificationMatrixEditorProps) {
  function toggle(type: (typeof ORDER_TYPES)[number], event: (typeof ORDER_NOTIFICATION_EVENTS)[number]) {
    onChange({
      ...value,
      [type]: { ...value[type], [event]: !value[type][event] },
    });
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: '6px 10px', color: 'var(--text-muted)', fontWeight: 600 }}>Tipo de pedido</th>
            {ORDER_NOTIFICATION_EVENTS.map((event) => (
              <th key={event} style={{ padding: '6px 10px', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'center' }}>
                {EVENT_LABELS[event]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ORDER_TYPES.map((type) => (
            <tr key={type} style={{ borderTop: '1px solid var(--border)' }}>
              <td style={{ padding: '6px 10px' }}>{type}</td>
              {ORDER_NOTIFICATION_EVENTS.map((event) => (
                <td key={event} style={{ padding: '6px 10px', textAlign: 'center' }}>
                  <input
                    type="checkbox"
                    checked={value[type][event]}
                    disabled={disabled}
                    onChange={() => toggle(type, event)}
                    style={{ width: 16, height: 16, accentColor: 'var(--accent)' }}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
