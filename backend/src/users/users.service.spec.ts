import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrismaService = {
  user: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  userDetails: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  userStats: {
    findUnique: jest.fn(),
  },
};

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findById', () => {
    it('should return a user with userDetails', async () => {
      const mockUser = {
        id: 1,
        email: 'test@test.com',
        userDetails: {
          firstName: 'John',
          lastName: 'Doe',
          nickname: 'johndoe',
          categories: [],
          skills: [],
          interests: [],
          socialLinks: [],
        },
      };
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findById(1);
      expect(result).toEqual(mockUser);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: expect.any(Object),
      });
    });
  });

  describe('updateMe', () => {
    it('should update userDetails and call syncLevel', async () => {
      const userId = 1;
      const updateData = { firstName: 'Jane' };
      const mockUpdatedUser = {
        id: 1,
        userDetails: { id: 10, firstName: 'Jane', xpPoints: 100, currentLevel: 1, skills: [], interests: [], socialLinks: [], categories: [] },
      };

      mockPrismaService.user.update.mockResolvedValue(mockUpdatedUser);
      mockPrismaService.userDetails.findUnique.mockResolvedValue(mockUpdatedUser.userDetails);

      const result = await service.updateMe(userId, updateData);
      
      expect(result).toEqual(mockUpdatedUser);
      expect(prisma.user.update).toHaveBeenCalled();
    });
  });
});
