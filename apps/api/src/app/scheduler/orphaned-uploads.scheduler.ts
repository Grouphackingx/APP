import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { join, basename } from 'path';
import * as fs from 'fs';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Limpieza periódica de imágenes huérfanas en `./uploads`.
 *
 * Un archivo queda huérfano cuando el usuario lo sube desde un formulario (crear
 * evento, logo, avatar, banner…) pero abandona el flujo sin guardar: el archivo
 * existe en disco pero ningún registro de BD lo referencia.
 *
 * Estrategia segura (sin falsos positivos):
 *   1. Recolecta todos los nombres de archivo referenciados en BD.
 *   2. Recorre `./uploads` y borra los archivos que NO estén referenciados…
 *   3. …y SOLO si tienen más de GRACE_HOURS de antigüedad (mtime). El periodo de
 *      gracia evita borrar un archivo recién subido que aún espera que el usuario
 *      guarde el formulario.
 *
 * No corre con Cloudinary (los archivos no viven en disco local).
 */
@Injectable()
export class OrphanedUploadsScheduler {
  private readonly logger = new Logger(OrphanedUploadsScheduler.name);
  private readonly uploadsRoot = join(process.cwd(), 'uploads');
  private static readonly GRACE_HOURS = 24;

  constructor(private prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async cleanOrphanedUploads() {
    if (process.env.STORAGE_PROVIDER === 'cloudinary') return;
    if (!fs.existsSync(this.uploadsRoot)) return;

    const referenced = await this.collectReferencedFilenames();
    const cutoff = Date.now() - OrphanedUploadsScheduler.GRACE_HOURS * 60 * 60 * 1000;

    let deleted = 0;
    let freedBytes = 0;
    for (const filePath of this.walk(this.uploadsRoot)) {
      if (referenced.has(basename(filePath))) continue;
      try {
        const stat = fs.statSync(filePath);
        if (stat.mtimeMs > cutoff) continue; // dentro del periodo de gracia
        fs.unlinkSync(filePath);
        deleted++;
        freedBytes += stat.size;
      } catch {
        /* ignore — archivo ya borrado o sin permisos */
      }
    }

    if (deleted > 0) {
      const mb = (freedBytes / (1024 * 1024)).toFixed(2);
      this.logger.log(`Deleted ${deleted} orphaned upload(s), freed ${mb} MB.`);
    }
  }

  /** Set de basenames (uuid.webp) referenciados por cualquier registro de BD. */
  private async collectReferencedFilenames(): Promise<Set<string>> {
    const names = new Set<string>();
    const add = (url: string | null | undefined) => {
      if (typeof url === 'string' && url) names.add(basename(url));
    };

    const [events, users, members, organizers, banners] = await Promise.all([
      this.prisma.event.findMany({
        select: {
          imageUrl: true, bannerImageUrl: true, squareImageUrl: true,
          portraitImageUrl: true, seatingMapImageUrl: true, galleryUrls: true,
        },
      }),
      this.prisma.user.findMany({ select: { avatarUrl: true } }),
      this.prisma.organizerMember.findMany({ select: { avatarUrl: true } }),
      this.prisma.organizerProfile.findMany({ select: { organizationLogo: true } }),
      this.prisma.banner.findMany({ select: { imageUrl: true } }),
    ]);

    for (const e of events) {
      add(e.imageUrl); add(e.bannerImageUrl); add(e.squareImageUrl);
      add(e.portraitImageUrl); add(e.seatingMapImageUrl);
      for (const g of e.galleryUrls) add(g);
    }
    for (const u of users) add(u.avatarUrl);
    for (const m of members) add(m.avatarUrl);
    for (const o of organizers) add(o.organizationLogo);
    for (const b of banners) add(b.imageUrl);

    return names;
  }

  /** Recorre recursivamente un directorio y emite cada ruta de archivo. */
  private *walk(dir: string): Generator<string> {
    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        yield* this.walk(full);
      } else if (entry.isFile()) {
        yield full;
      }
    }
  }
}
