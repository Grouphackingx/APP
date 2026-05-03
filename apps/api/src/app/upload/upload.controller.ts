
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
          const organizerId = user ? user.sub : (req.query.organizerId || 'temp');
          const type = req.query.type as string; // 'logo' or 'event'
          const eventId = req.query.eventId as string;

          let dir = `./uploads/organizers/${organizerId}`;
          if (type === 'logo') {
             dir += `/logo`;
          } else if (type === 'event' && eventId) {
             dir += `/events/${eventId}`;
          } else {
             dir += `/misc`;
          }
          
          fs.mkdirSync(dir, { recursive: true });
          cb(null, dir);
        },
        filename: (req, file, cb) => {
          const randomName = uuidv4();
          cb(null, `${randomName}${extname(file.originalname)}`);
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
  uploadFile(@UploadedFile() file: Express.Multer.File, @Req() req: any, @Query('type') type?: string, @Query('eventId') eventId?: string) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    const serverUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    
    const user = req.user;
    const organizerId = user ? user.sub : (req.query.organizerId || 'temp');
    
    let pathPart = `/organizers/${organizerId}`;
    if (type === 'logo') {
       pathPart += `/logo`;
    } else if (type === 'event' && eventId) {
       pathPart += `/events/${eventId}`;
    } else {
       pathPart += `/misc`;
    }

    return { 
      url: `${serverUrl}/uploads${pathPart}/${file.filename}`,
      filename: file.filename 
    };
  }
}
