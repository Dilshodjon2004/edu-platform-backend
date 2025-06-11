import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type OtpDocument = HydratedDocument<Otp>;

@Schema({ timestamps: true })
export class Otp {
  @Prop()
  email: string;

  @Prop()
  otp: string;

  @Prop()
  expiresAt: Date;
}

export const OtpSchema = SchemaFactory.createForClass(Otp);
