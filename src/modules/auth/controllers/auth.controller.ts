import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { LoginDto } from '../dto/login.dto';
import { RegisterFirstAccountDto } from '../dto/register-first-account.dto';
import { RegisterVillageUserDto } from '../dto/register-village-user.dto';

@Controller('v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('register-first-account')
  async registerFirstAccount(@Body() payload: RegisterFirstAccountDto) {
    return this.authService.registerFirstAccount(payload);
  }

  @Post('login')
  async login(@Body() payload: LoginDto) {
    return this.authService.login(payload);
  }

  /**
   * Aktifkan guard ini jika JwtStrategy sudah dibuat.
   *
   * @UseGuards(AuthGuard('jwt'))
   */
  @Post('register')
  async registerVillageUser(
    @Body() payload: RegisterVillageUserDto,
    @Req() req: any,
  ) {
    /**
     * Sementara currentUser diambil dari req.user.
     * Setelah JwtStrategy aktif, req.user harus berisi:
     * id, uuid, email, village_id, roles, permissions.
     */
    return this.authService.registerVillageUser(payload, req.user);
  }
}