import {
  Controller,
  Get,
  Param,
  Res,
  NotFoundException,
} from '@nestjs/common';
import { Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const sharp = require('sharp');

/**
 * Genera una imagen JPEG para previews de redes sociales (WhatsApp, Facebook,
 * Telegram). Las imágenes del sitio se almacenan en WebP, formato que WhatsApp
 * NO renderiza en sus previews de enlaces. Este endpoint convierte al vuelo la
 * imagen cuadrada (1:1) del evento a JPEG, con caché para no reconvertir cada vez.
 */
@Controller('og')
export class OgImageController {
  constructor(private readonly prisma: PrismaService) {}

  @Get(':id')
  async getEventOgImage(@Param('id') id: string, @Res() res: Response) {
    const event = await this.prisma.event.findFirst({
      where: { OR: [{ slug: id }, { id }] },
      select: {
        squareImageUrl: true,
        bannerImageUrl: true,
        imageUrl: true,
        portraitImageUrl: true,
      },
    });

    // Preferimos la imagen cuadrada 1:1; si no existe, caemos a las demás.
    const source =
      event?.squareImageUrl ||
      event?.bannerImageUrl ||
      event?.imageUrl ||
      event?.portraitImageUrl;

    if (!source) {
      throw new NotFoundException('El evento no tiene imagen disponible.');
    }

    try {
      const upstream = await fetch(source);
      if (!upstream.ok) throw new Error(`fetch ${upstream.status}`);
      const inputBuffer = Buffer.from(await upstream.arrayBuffer());

      // 1080x1080 cuadrado (cover) — tamaño óptimo para previews sociales.
      const jpeg = await sharp(inputBuffer)
        .resize(1080, 1080, { fit: 'cover', position: 'centre' })
        .jpeg({ quality: 85 })
        .toBuffer();

      res.set({
        'Content-Type': 'image/jpeg',
        'Content-Length': String(jpeg.length),
        // Cache 24h en navegador/CDN; los crawlers sociales lo respetan.
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      });
      res.end(jpeg);
    } catch {
      throw new NotFoundException('No se pudo generar la imagen del evento.');
    }
  }
}
