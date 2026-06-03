import { Module } from '@nestjs/common';
import { OgImageController } from './og-image.controller';

@Module({
  controllers: [OgImageController],
})
export class OgImageModule {}
