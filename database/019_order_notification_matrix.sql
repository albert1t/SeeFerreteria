-- Sustituye el modo simple de avisos (all / urgent_only / none) por una matriz
-- configurable: para cada tipo de pedido (Reposición, Solicitud, Solicitud Express),
-- qué eventos avisan (creación + cada cambio de estado). El concepto de "solo urgentes"
-- desaparece (se logra ahora activando solo los eventos de Solicitud Express).
-- Ejecutar una vez en la base MySQL antes de desplegar esta versión.

ALTER TABLE Users ADD COLUMN orderNotificationPrefs JSON NULL;

UPDATE Users SET orderNotificationPrefs = CASE emailOrdersMode
  WHEN 'none' THEN JSON_OBJECT(
    'Reposición', JSON_OBJECT('created', FALSE, 'Pedido realizado', FALSE, 'Pedido recibido', FALSE, 'Finalizado', FALSE),
    'Solicitud', JSON_OBJECT('created', FALSE, 'Pedido realizado', FALSE, 'Pedido recibido', FALSE, 'Finalizado', FALSE),
    'Solicitud Express', JSON_OBJECT('created', FALSE, 'Pedido realizado', FALSE, 'Pedido recibido', FALSE, 'Finalizado', FALSE)
  )
  WHEN 'urgent_only' THEN JSON_OBJECT(
    'Reposición', JSON_OBJECT('created', FALSE, 'Pedido realizado', FALSE, 'Pedido recibido', FALSE, 'Finalizado', FALSE),
    'Solicitud', JSON_OBJECT('created', FALSE, 'Pedido realizado', FALSE, 'Pedido recibido', FALSE, 'Finalizado', FALSE),
    'Solicitud Express', JSON_OBJECT('created', TRUE, 'Pedido realizado', TRUE, 'Pedido recibido', TRUE, 'Finalizado', TRUE)
  )
  ELSE JSON_OBJECT(
    'Reposición', JSON_OBJECT('created', TRUE, 'Pedido realizado', TRUE, 'Pedido recibido', TRUE, 'Finalizado', TRUE),
    'Solicitud', JSON_OBJECT('created', TRUE, 'Pedido realizado', TRUE, 'Pedido recibido', TRUE, 'Finalizado', TRUE),
    'Solicitud Express', JSON_OBJECT('created', TRUE, 'Pedido realizado', TRUE, 'Pedido recibido', TRUE, 'Finalizado', TRUE)
  )
END;

ALTER TABLE Users MODIFY COLUMN orderNotificationPrefs JSON NOT NULL;
ALTER TABLE Users DROP COLUMN emailOrdersMode;

-- Ajuste global: mismo criterio, basado en el valor actual de la clave 'emailOrdersMode'.
INSERT INTO Settings (settingKey, settingValue)
SELECT 'orderNotificationMatrix', CASE (SELECT settingValue FROM Settings WHERE settingKey = 'emailOrdersMode')
  WHEN 'none' THEN JSON_OBJECT(
    'Reposición', JSON_OBJECT('created', FALSE, 'Pedido realizado', FALSE, 'Pedido recibido', FALSE, 'Finalizado', FALSE),
    'Solicitud', JSON_OBJECT('created', FALSE, 'Pedido realizado', FALSE, 'Pedido recibido', FALSE, 'Finalizado', FALSE),
    'Solicitud Express', JSON_OBJECT('created', FALSE, 'Pedido realizado', FALSE, 'Pedido recibido', FALSE, 'Finalizado', FALSE)
  )
  WHEN 'urgent_only' THEN JSON_OBJECT(
    'Reposición', JSON_OBJECT('created', FALSE, 'Pedido realizado', FALSE, 'Pedido recibido', FALSE, 'Finalizado', FALSE),
    'Solicitud', JSON_OBJECT('created', FALSE, 'Pedido realizado', FALSE, 'Pedido recibido', FALSE, 'Finalizado', FALSE),
    'Solicitud Express', JSON_OBJECT('created', TRUE, 'Pedido realizado', TRUE, 'Pedido recibido', TRUE, 'Finalizado', TRUE)
  )
  ELSE JSON_OBJECT(
    'Reposición', JSON_OBJECT('created', TRUE, 'Pedido realizado', TRUE, 'Pedido recibido', TRUE, 'Finalizado', TRUE),
    'Solicitud', JSON_OBJECT('created', TRUE, 'Pedido realizado', TRUE, 'Pedido recibido', TRUE, 'Finalizado', TRUE),
    'Solicitud Express', JSON_OBJECT('created', TRUE, 'Pedido realizado', TRUE, 'Pedido recibido', TRUE, 'Finalizado', TRUE)
  )
END
ON DUPLICATE KEY UPDATE settingValue = VALUES(settingValue);

DELETE FROM Settings WHERE settingKey = 'emailOrdersMode';
