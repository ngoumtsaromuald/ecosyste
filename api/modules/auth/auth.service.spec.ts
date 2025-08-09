import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole, ApiPlan } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

// Mock bcrypt
jest.mock('bcryptjs');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: jest.Mocked<PrismaService>;
  let jwtService: jest.Mocked<JwtService>;

  const mockUser = {
    id: '1',
    email: 'test@example.com',
    password: 'hashedPassword',
    name: 'Test User',
    role: UserRole.USER,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockApiKey = {
    id: '1',
    name: 'Test API Key',
    key: 'hashedApiKey',
    plan: ApiPlan.FREE,
    isActive: true,
    userId: '1',
    createdAt: new Date(),
    updatedAt: new Date(),
    expiresAt: null,
    lastUsedAt: null,
    usageCount: 0,
    rateLimit: 100,
    quotaLimit: 1000,
    user: mockUser,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              create: jest.fn(),
            },
            apiKey: {
              findUnique: jest.fn(),
              findFirst: jest.fn(),
              findMany: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
            },
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get(PrismaService);
    jwtService = module.get(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const registerDto = {
        email: 'newuser@example.com',
        password: 'password123',
        name: 'New User',
      };

      prismaService.user.findUnique.mockResolvedValue(null);
      mockedBcrypt.hash.mockResolvedValue('hashedPassword');
      prismaService.user.create.mockResolvedValue(mockUser);
      jwtService.sign.mockReturnValue('jwt-token');

      const result = await service.register(registerDto);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken');
      expect(result.user).not.toHaveProperty('password');
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: registerDto.email },
      });
    });

    it('should throw BadRequestException if user already exists', async () => {
      const registerDto = {
        email: 'existing@example.com',
        password: 'password123',
        name: 'Existing User',
      };

      prismaService.user.findUnique.mockResolvedValue(mockUser);

      await expect(service.register(registerDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      prismaService.user.findUnique.mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(true);
      jwtService.sign.mockReturnValue('jwt-token');

      const result = await service.login(loginDto);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken');
      expect(result.user).not.toHaveProperty('password');
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      prismaService.user.findUnique.mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for non-existent user', async () => {
      const loginDto = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      prismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('validateApiKey', () => {
    it('should validate API key successfully', async () => {
      const apiKey = 'rapi_test123';
      
      mockedBcrypt.hashSync.mockReturnValue('hashedApiKey');
      prismaService.apiKey.findUnique.mockResolvedValue(mockApiKey);
      prismaService.apiKey.update.mockResolvedValue(mockApiKey);

      const result = await service.validateApiKey(apiKey);

      expect(result).toEqual(mockApiKey);
      expect(prismaService.apiKey.update).toHaveBeenCalledWith({
        where: { id: mockApiKey.id },
        data: {
          lastUsedAt: expect.any(Date),
          usageCount: { increment: 1 },
        },
      });
    });

    it('should return null for invalid API key', async () => {
      const apiKey = 'invalid_key';
      
      mockedBcrypt.hashSync.mockReturnValue('hashedInvalidKey');
      prismaService.apiKey.findUnique.mockResolvedValue(null);

      const result = await service.validateApiKey(apiKey);

      expect(result).toBeNull();
    });

    it('should return null for expired API key', async () => {
      const apiKey = 'rapi_expired123';
      const expiredApiKey = {
        ...mockApiKey,
        expiresAt: new Date(Date.now() - 1000), // Expired 1 second ago
      };
      
      mockedBcrypt.hashSync.mockReturnValue('hashedApiKey');
      prismaService.apiKey.findUnique.mockResolvedValue(expiredApiKey);

      const result = await service.validateApiKey(apiKey);

      expect(result).toBeNull();
    });
  });

  describe('createApiKey', () => {
    it('should create API key successfully', async () => {
      const userId = '1';
      const name = 'Test API Key';
      const plan = ApiPlan.FREE;

      prismaService.apiKey.create.mockResolvedValue(mockApiKey);
      mockedBcrypt.hashSync.mockReturnValue('hashedApiKey');

      const result = await service.createApiKey(userId, name, plan);

      expect(result).toHaveProperty('apiKey');
      expect(result).toHaveProperty('plainKey');
      expect(result.plainKey).toMatch(/^rapi_/);
      expect(prismaService.apiKey.create).toHaveBeenCalled();
    });
  });

  describe('revokeApiKey', () => {
    it('should revoke API key successfully', async () => {
      const keyId = '1';
      const userId = '1';

      prismaService.apiKey.findFirst.mockResolvedValue(mockApiKey);
      prismaService.apiKey.update.mockResolvedValue({
        ...mockApiKey,
        isActive: false,
      });

      await service.revokeApiKey(keyId, userId);

      expect(prismaService.apiKey.update).toHaveBeenCalledWith({
        where: { id: keyId },
        data: { isActive: false },
      });
    });

    it('should throw BadRequestException for non-existent API key', async () => {
      const keyId = 'nonexistent';
      const userId = '1';

      prismaService.apiKey.findFirst.mockResolvedValue(null);

      await expect(service.revokeApiKey(keyId, userId)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
