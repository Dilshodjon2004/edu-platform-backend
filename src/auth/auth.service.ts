import { Model } from 'mongoose';
import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from 'src/user/user.model';
import { genSalt, hash, compare } from 'bcryptjs';
import { RegisterAuthDto } from './dto/register.dto';
import { LoginAuthDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { TokenDto } from './dto/token.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly jwtService: JwtService,
  ) {}
  async register(dto: RegisterAuthDto) {
    const existUser = await this.isExistUser(dto.email);
    if (existUser) throw new BadRequestException('User with this email already exists!');

    const salt = await genSalt(10);
    const passwordHash = await hash(dto.password, salt);

    const newUser = await this.userModel.create({
      ...dto,
      password: dto.password.length ? passwordHash : '',
    });

    const token = await this.issueTokenPair(String(newUser._id));

    return { user: this.getUserField(newUser), ...token };
  }

  async login(dto: LoginAuthDto) {
    const existUser = await this.isExistUser(dto.email);
    if (!existUser) throw new BadRequestException('User with this email does not exist!');
    if (dto.password.length) {
      const currentPassword = await compare(dto.password, existUser.password);
      if (!currentPassword) throw new BadRequestException('Incorrect password!');
    }

    const token = await this.issueTokenPair(String(existUser._id));

    return { user: this.getUserField(existUser), ...token };
  }

  async checkUser(email: string) {
    const user = await this.isExistUser(email);

    if (user) {
      return 'user';
    } else {
      return 'not-user';
    }
  }

  async getNewTokens({ refreshToken }: TokenDto) {
    if (!refreshToken) throw new UnauthorizedException('Please sign in!');

    const result = await this.jwtService.verifyAsync<{ _id: string }>(refreshToken);

    if (!result) throw new UnauthorizedException('Invalid refresh token!');

    const user = await this.userModel.findById(result._id);
    if (!user) throw new UnauthorizedException('User not found!');

    const token = await this.issueTokenPair(String(user._id));

    return { user: this.getUserField(user), ...token };
  }

  async isExistUser(email: string): Promise<UserDocument | null> {
    const existUser = await this.userModel.findOne({ email });
    return existUser;
  }

  async issueTokenPair(userId: string) {
    const data = { _id: userId };
    const refreshToken = await this.jwtService.signAsync(data, {
      expiresIn: '15d',
    });

    const accessToken = await this.jwtService.signAsync(data, {
      expiresIn: '1h',
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  getUserField(user: UserDocument) {
    return {
      id: user._id,
      email: user.email,
      fullName: user.fullName,
    };
  }
}
