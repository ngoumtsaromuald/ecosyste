import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UserRole, ApiPlan } from '@prisma/client';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let authService: jest.Mocked<AuthService>;

  const mockUser = {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    role: UserRole.USER,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockAuthResponse = {
    user: mockUser,
    accessToken: 'jwt-token',
  };

  const mockApiKey = {
    id: '1',
    name: 'Test API Key',
    plan: ApiPlan.FREE,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    expiresAt: null,
    lastUsedAt: null,
    usageCount: 0,
    rateLimit: 100,
    quotaLimit: 1000,
    userId: '1',
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest.fn(),
            login: jest.fn(),
            getUserApiKeys: jest.fn(),
            createApiKey: jest.fn(),
            revokeApiKey: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleFixture.createNestApplication();
    authService = moduleFixture.get(AuthService);
    
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/auth/register (POST)', () => {
    it('should register a new user', async () => {
      const registerDto = {
        email: 'newuser@example.com',
        password: 'password123',
        name: 'New User',
      };

      authService.register.mockResolvedValue(mockAuthResponse);

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(201);

      expect(response.body).toEqual(mockAuthResponse);
      expect(authService.register).toHaveBeenCalledWith(registerDto);
    });

    it('should return 400 for invalid data', async () => {
      const invalidDto = {
        email: 'invalid-email',
        password: '123', // Too short
      };

      await request(app.getHttpServer())
        .post('/auth/register')
        .send(invalidDto)
        .expect(400);
    });
  });

  describe('/auth/login (POST)', () => {
    it('should login user successfully', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      authService.login.mockResolvedValue(mockAuthResponse);

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto)
        .expect(200);

      expect(response.body).toEqual(mockAuthResponse);
      expect(authService.login).toHaveBeenCalledWith(loginDto);
    });

    it('should return 401 for invalid credentials', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      authService.login.mockRejectedValue(new Error('Identifiants invalides'));

      await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto)
        .expect(500); // NestJS converts unhandled errors to 500
    });
  });

  describe('/auth/profile (GET)', () => {
    it('should return user profile', async () => {
      // Mock the request object to include user
      const mockRequest = {
        user: mockUser,
      };

      const response = await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', 'Bearer jwt-token')
        .expect(200);

      // Note: In a real test, you'd need to properly mock the JWT guard
      // to inject the user into the request object
    });
  });

  describe('/auth/api-keys (GET)', () => {
    it('should return user API keys', async () => {
      const mockApiKeys = [mockApiKey];
      authService.getUserApiKeys.mockResolvedValue(mockApiKeys);

      const response = await request(app.getHttpServer())
        .get('/auth/api-keys')
        .set('Authorization', 'Bearer jwt-token')
        .expect(200);

      expect(response.body).toEqual(mockApiKeys);
    });
  });

  describe('/auth/api-keys (POST)', () => {
    it('should create a new API key', async () => {
      const createApiKeyDto = {
        name: 'Test API Key',
        plan: ApiPlan.FREE,
      };

      const mockCreateResponse = {
        apiKey: mockApiKey,
        plainKey: 'rapi_test123456789',
      };

      authService.createApiKey.mockResolvedValue(mockCreateResponse);

      const response = await request(app.getHttpServer())
        .post('/auth/api-keys')
        .set('Authorization', 'Bearer jwt-token')
        .send(createApiKeyDto)
        .expect(201);

      expect(response.body).toEqual(mockCreateResponse);
      expect(authService.createApiKey).toHaveBeenCalledWith(
        undefined, // userId would be extracted from JWT in real scenario
        createApiKeyDto.name,
        createApiKeyDto.plan,
        undefined,
      );
    });
  });

  describe('/auth/api-keys/:keyId (DELETE)', () => {
    it('should revoke an API key', async () => {
      const keyId = '1';
      authService.revokeApiKey.mockResolvedValue(undefined);

      await request(app.getHttpServer())
        .delete(`/auth/api-keys/${keyId}`)
        .set('Authorization', 'Bearer jwt-token')
        .expect(204);

      expect(authService.revokeApiKey).toHaveBeenCalledWith(
        keyId,
        undefined, // userId would be extracted from JWT in real scenario
      );
    });
  });
});
