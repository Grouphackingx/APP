
import { Controller, Post, UseInterceptors, UploadedFile, BadRequestException, Req, Query } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';

@Controller('upload')
export class UploadController {
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req: any, file, cb) => {
          const user = req.user;
          const type = req.query.type as string;
          const eventId = req.query.eventId as string;
          const organizerId = req.query.organizerId as string;

          let dir: string;

          if (type === 'user-avatar') {
            const userId = user ? user.sub : (req.query.userId || 'temp');
            dir = `./uploads/users/${userId}/avatar`;
            if (fs.existsSync(dir)) {
              for (const f of fs.readdirSync(dir)) {
                try { fs.unlinkSync(`${dir}/${f}`); } catch { /* ignore */ }
              }
            }
          } else if (type === 'member-avatar') {
            const memberId = req.query.memberId || 'temp';
            const orgUserId = user ? user.sub : 'temp';
            dir = `./uploads/organizers/${orgUserId}/members/${memberId}/avatar`;
            if (fs.existsSync(dir)) {
              for (const f of fs.readdirSync(dir)) {
                try { fs.unlinkSync(`${dir}/${f}`); } catch { /* ignore */ }
              }
            }
          } else if (type === 'banner') {
            dir = `./uploads/banners`;
          } else {
            const orgId = user ? user.sub : (organizerId || 'temp');
            dir = `./uploads/organizers/${orgId}`;
            if (type === 'logo') {
              dir += '/logo';
              if (fs.existsSync(dir)) {
                for (const f of fs.readdirSync(dir)) {
                  try { fs.unlinkSync(`${dir}/${f}`); } catch { /* ignore */ }
                }
              }
            } else if (type === 'event' && eventId) {
              dir += `/events/${eventId}`;
            } else {
              dir += '/misc';
            }
          }

          fs.mkdirSync(dir, { recursive: true });
          cb(null, dir);
        },
        filename: (req, file, cb) => {
          cb(null, `${uuidv4()}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
          return cb(new BadRequestException(`Only image files are allowed! Received: ${file.mimetype}`), false);
        }
        cb(null, true);
      },
    }),
  )
  uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
    @Query('type') type?: string,
    @Query('eventId') eventId?: string,
    @Query('organizerId') organizerId?: string,
  ) {
    if (!file) throw new BadRequestException('File is required');

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
    const serverUrl = apiUrl.replace(/\/api$/, '');
    const user = req.user;

    let pathPart: string;

    if (type === 'user-avatar') {
      const userId = user ? user.sub : (req.query.userId || 'temp');
      pathPart = `/users/${userId}/avatar`;
    } else if (type === 'member-avatar') {
      const memberId = req.query.memberId || 'temp';
      const orgUserId = user ? user.sub : 'temp';
      pathPart = `/organizers/${orgUserId}/members/${memberId}/avatar`;
    } else if (type === 'banner') {
      pathPart = `/banners`;
    } else {
      const orgId = user ? user.sub : (organizerId || 'temp');
      pathPart = `/organizers/${orgId}`;
      if (type === 'logo') {
        pathPart += '/logo';
      } else if (type === 'event' && eventId) {
        pathPart += `/events/${eventId}`;
      } else {
        pathPart += '/misc';
      }
    }

    return {
      url: `${serverUrl}/uploads${pathPart}/${file.filename}`,
      filename: file.filename,
    };
  }
}
