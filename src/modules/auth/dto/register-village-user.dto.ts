import { IsEmail, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class RegisterVillageUserDto {
    @IsString()
    fullName: string;

    @IsEmail()
    email: string;

    @IsOptional()
    @IsString()
    phone?: string;

    @IsString()
    @MinLength(8)
    password: string;

    @IsUUID()
    villageUuid: string;

    @IsUUID()
    roleUuid: string;
}