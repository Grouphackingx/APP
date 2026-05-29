import { Controller, Post, UseInterceptors, UploadedFile, BadRequestException, Req, Query, HttpStatus } from '@nestjs/common';
import { Catch, ArgumentsHost, ExceptionFilter, UseFilters } from '@nestjs/common';
import { MulterError } from 'multer';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, dirname, basename, join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as os from 'os';
import { v2 as cloudinary } from 'cloudinary';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const sharp = require('sharp') as (input: string) => import('sharp').Sharp;

// ── Config from .env ──────────────────────────────────────────────────────────
const USE_CLOUDINARY   = process.env.STORAGE_PROVIDER === 'cloudinary';
const MAX_UPLOAD_MB    = parseFloat(process.env.NEXT_PUBLIC_MAX_UPLOAD_MB || '2.5');
const MAX_UPLOAD_BYTES = MAX_UPLOAD_MB * 1024 * 1024;
const ALLOWED_TYPES    = (process.env.NEXT_PUBLIC_ALLOWED_IMAGE_TYPES || 'image/jpeg,image/png,image/webp').split(',');
const IMAGE_QUALITY = parseInt(process.env.UPLOAD_IMAGE_QUALITY || '80', 10);

// ── Cloudinary config ─────────────────────────────────────────────────────────
if (USE_CLOUDINARY) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

// ── Multer exception filter ───────────────────────────────────────────────────
@Catch(MulterError)
class MulterExceptionFilter implements ExceptionFilter {
  catch(error: MulterError, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse();
    const message = error.code === 'LIMIT_FILE_SIZE'
      ? `La imagen supera el tamaño máximo permitido de ${MAX_UPLOAD_MB} MB.`
      : 'Error al procesar el archivo.';
    res.status(HttpStatus.BAD_REQUEST).json({ statusCode: 400, message });
  }
}

// ── Sharp: optimize to WebP ───────────────────────────────────────────────────
async function optimizeImage(inputPath: string): Promise<string> {
  const nameWithoutExt = basename(inputPath, extname(inputPath));
  const outputPath = join(dirname(inputPath), `${nameWithoutExt}.webp`);

  await sharp(inputPath)
    .webp({ quality: IMAGE_QUALITY })
    .toFile(outputPath);

  // Remove original only if it was a different format
  if (inputPath !== outputPath) {
    try { fs.unlinkSync(inputPath); } catch { /* ignore */ }
  }

  return outputPath;
}

// ── Local storage helpers ─────────────────────────────────────────────────────
function clearDir(dir: string) {
  if (fs.existsSync(dir)) {
    for (const f of fs.readdirSync(dir)) {
      try { fs.unlinkSync(`${dir}/${f}`); } catch { /* ignore */ }
    }
  }
}

function getLocalDir(req: any, type: string, eventId: string, organizerId: string): string {
  const user = req.user;
  let dir: string;

  if (type === 'user-avatar') {
    const userId = user ? user.sub : (req.query.userId || 'temp');
    dir = `./uploads/users/${userId}/avatar`;
    clearDir(dir);
  } else if (type === 'member-avatar') {
    const memberId = req.query.memberId || 'temp';
    const orgUserId = user ? user.sub : 'temp';
    dir = `./uploads/organizers/${orgUserId}/members/${memberId}/avatar`;
    clearDir(dir);
  } else if (type === 'banner') {
    dir = `./uploads/banners`;
  } else {
    const orgId = user ? user.sub : (organizerId || 'temp');
    dir = `./uploads/organizers/${orgId}`;
    if (type === 'logo') {
      dir += '/logo';
      clearDir(dir);
    } else if (type === 'event' && eventId) {
      dir += `/events/${eventId}`;
    } else {
      dir += '/misc';
    }
  }

  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function getLocalPathPart(req: any, type: string, eventId: string, organizerId: string): string {
  const user = req.user;
  if (type === 'user-avatar') {
    const userId = user ? user.sub : (req.query.userId || 'temp');
    return `/users/${userId}/avatar`;
  }
  if (type === 'member-avatar') {
    const memberId = req.query.memberId || 'temp';
    const orgUserId = user ? user.sub : 'temp';
    return `/organizers/${orgUserId}/members/${memberId}/avatar`;
  }
  if (type === 'banner') return `/banners`;

  const orgId = user ? user.sub : (organizerId || 'temp');
  const base = `/organizers/${orgId}`;
  if (type === 'logo') return base + '/logo';
  if (type === 'event' && eventId) return base + `/events/${eventId}`;
  return base + '/misc';
}

// ── Controller ────────────────────────────────────────────────────────────────
@Controller('upload')
@UseFilters(MulterExceptionFilter)
export class UploadController {
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req: any, file, cb) => {
          if (USE_CLOUDINARY) { cb(null, os.tmpdir()); return; }
          const type       = req.query.type as string;
          const eventId    = req.query.eventId as string;
          const organizerId = req.query.organizerId as string;
          cb(null, getLocalDir(req, type, eventId, organizerId));
        },
        filename: (req, file, cb) => {
          cb(null, `${uuidv4()}${extname(file.originalname)}`);
        },
      }),
      limits: { fileSize: MAX_UPLOAD_BYTES },
      fileFilter: (req, file, cb) => {
        if (!ALLOWED_TYPES.includes(file.mimetype)) {
          const allowed = ALLOWED_TYPES.map(t => t.replace('image/', '').toUpperCase()).join(', ');
          return cb(new BadRequestException(`Formato no permitido. Solo se aceptan: ${allowed}.`), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
    @Query('type') type?: string,
    @Query('eventId') eventId?: string,
    @Query('organizerId') organizerId?: string,
  ) {
    if (!file) throw new BadRequestException('No se recibió ningún archivo.');
    if (file.size > MAX_UPLOAD_BYTES) {
      throw new BadRequestException(`La imagen supera el tamaño máximo permitido de ${MAX_UPLOAD_MB} MB.`);
    }

    // ── Optimize with Sharp (always, before storing anywhere) ─────────────────
    let optimizedPath: string;
    try {
      optimizedPath = await optimizeImage(file.path);
    } catch {
      try { fs.unlinkSync(file.path); } catch { /* ignore */ }
      throw new BadRequestException('Error al procesar la imagen.');
    }

    const webpFilename = basename(optimizedPath); // e.g. uuid.webp

    // ── Cloudinary ────────────────────────────────────────────────────────────
    if (USE_CLOUDINARY) {
      try {
        const result = await cloudinary.uploader.upload(optimizedPath, {
          folder: `afroeventos/${type || 'misc'}`,
          resource_type: 'image',
        });
        try { fs.unlinkSync(optimizedPath); } catch { /* ignore */ }
        return { url: result.secure_url, filename: result.public_id };
      } catch {
        try { fs.unlinkSync(optimizedPath); } catch { /* ignore */ }
        throw new BadRequestException('Error al subir la imagen al CDN. Verifica las credenciales de Cloudinary.');
      }
    }

    // ── Local (VPS / desarrollo) ──────────────────────────────────────────────
    const apiUrl    = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
    const serverUrl = apiUrl.replace(/\/api$/, '');
    const pathPart  = getLocalPathPart(req, type, eventId, organizerId);

    return {
      url: `${serverUrl}/uploads${pathPart}/${webpFilename}`,
      filename: webpFilename,
    };
  }
}
