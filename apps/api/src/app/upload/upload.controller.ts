
import { Controller, Post, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';

@Controller('upload')
export class UploadController {
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads', 
        filename: (req, file, cb) => {
          const randomName = uuidv4();
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        // Allow any image type
        if (!file.mimetype.startsWith('image/')) {
          return cb(new BadRequestException(`Only image files are allowed! Received: ${file.mimetype}`), false);
        }
        cb(null, true);
      },
    }),
  )
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    // Return the URL to access the file
    // Assuming the server is running on localhost:3000 and serving 'uploads' at root level
    // We will serve static files from '/uploads' route prefix or similar
    const serverUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    // We will configure ServeStatic such that it serves from root,
    // so url is simply /filename
    // BUT usually it's cleaner to have /uploads/filename
    return { 
      url: `${serverUrl}/uploads/${file.filename}`,
      filename: file.filename 
    };
  }
}
