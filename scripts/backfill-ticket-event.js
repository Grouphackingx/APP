// Backfill idempotente de las columnas Ticket.eventId / zoneName / seatNumber.
//
// Contexto: históricamente el eventId y la info de asiento vivían SOLO dentro del
// QR JWT (qrCodeToken). Ahora se denormalizaron a columnas de la tabla Ticket para
// poder filtrar/paginar por evento en BD sin decodificar todos los tokens.
//
// Este script rellena esas columnas en los tickets antiguos (los que aún tienen
// eventId = null). Es idempotente: solo toca filas con eventId nulo, así que se
// puede correr varias veces sin efecto adverso.
//
// Uso:
//   Local:      node scripts/backfill-ticket-event.js
//   Producción: en el contenedor API de Coolify → node scripts/backfill-ticket-event.js
//
// Nota: se decodifica el JWT SIN verificar firma (jwt.decode). Son tokens propios
// y solo necesitamos el payload; así no dependemos de JWT_SECRET en este script.

const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

async function main() {
  const pending = await prisma.ticket.findMany({
    where: { eventId: null },
    select: { id: true, qrCodeToken: true },
  });

  console.log(`Tickets pendientes de backfill: ${pending.length}`);

  let updated = 0;
  let skipped = 0;

  for (const ticket of pending) {
    let payload;
    try {
      payload = jwt.decode(ticket.qrCodeToken);
    } catch {
      payload = null;
    }

    if (!payload || !payload.eventId) {
      skipped++;
      continue;
    }

    await prisma.ticket.update({
      where: { id: ticket.id },
      data: {
        eventId: payload.eventId,
        zoneName: payload.zoneName ?? null,
        seatNumber:
          payload.seatNumber !== undefined && payload.seatNumber !== null
            ? String(payload.seatNumber)
            : null,
      },
    });
    updated++;
  }

  console.log(`Backfill completado. Actualizados: ${updated}, omitidos (token inválido): ${skipped}`);

  await prisma['$disconnect']();
}

main().catch(async (err) => {
  console.error('Error en el backfill:', err);
  await prisma['$disconnect']();
  process.exit(1);
});
