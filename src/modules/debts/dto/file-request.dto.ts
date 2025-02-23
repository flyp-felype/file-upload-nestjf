import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsUUID,
  IsDateString,
} from 'class-validator';

export class FileDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  governmentId: string;

  @IsEmail()
  email: string;

  @IsNumber()
  debtAmount: number;

  @IsDateString()
  debtDueDate: string;

  @IsUUID()
  debtId: string;
}
