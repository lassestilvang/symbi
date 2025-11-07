/**
 * AuthService Tests
 *
 * Tests authentication functionality for cloud sync.
 */

import { AuthService } from '../AuthService';
import { StorageService } from '../StorageService';

// Mock StorageService
jest.mock('../StorageService');

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('signUp', () => {
    it('should create a new user account with valid credentials', async () => {
      const email = 'test@example.com';
      const password = 'password123';

      (StorageService.set as jest.Mock).mockResolvedValue(true);

      const result = await AuthService.signUp(email, password);

      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
      expect(result.user?.email).toBe(email);
      expect(result.user?.uid).toBeDefined();
      expect(StorageService.set).toHaveBeenCalledTimes(2); // User and token
    });

    it('should reject invalid email format', async () => {
      const result = await AuthService.signUp('invalid-email', 'password123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid email format');
      expect(StorageService.set).not.toHaveBeenCalled();
    });

    it('should reject short passwords', async () => {
      const result = await AuthService.signUp('test@example.com', 'short');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Password must be at least 8 characters');
      expect(StorageService.set).not.toHaveBeenCalled();
    });
  });

  describe('signIn', () => {
    it('should sign in existing user with correct credentials', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      const mockUser = {
        uid: 'user123',
        email,
        createdAt: new Date(),
      };

      (StorageService.get as jest.Mock).mockResolvedValue(mockUser);
      (StorageService.set as jest.Mock).mockResolvedValue(true);

      const result = await AuthService.signIn(email, password);

      expect(result.success).toBe(true);
      expect(result.user).toEqual(mockUser);
    });

    it('should reject sign in with incorrect email', async () => {
      (StorageService.get as jest.Mock).mockResolvedValue(null);

      const result = await AuthService.signIn('wrong@example.com', 'password123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid email or password');
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user if authenticated', async () => {
      const mockUser = {
        uid: 'user123',
        email: 'test@example.com',
        createdAt: new Date(),
      };

      (StorageService.get as jest.Mock)
        .mockResolvedValueOnce('token123') // Token
        .mockResolvedValueOnce(mockUser); // User

      const user = await AuthService.getCurrentUser();

      expect(user).toEqual(mockUser);
    });

    it('should return null if no token exists', async () => {
      (StorageService.get as jest.Mock).mockResolvedValue(null);

      const user = await AuthService.getCurrentUser();

      expect(user).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when user is authenticated', async () => {
      const mockUser = {
        uid: 'user123',
        email: 'test@example.com',
        createdAt: new Date(),
      };

      (StorageService.get as jest.Mock)
        .mockResolvedValueOnce('token123')
        .mockResolvedValueOnce(mockUser);

      const isAuth = await AuthService.isAuthenticated();

      expect(isAuth).toBe(true);
    });

    it('should return false when user is not authenticated', async () => {
      (StorageService.get as jest.Mock).mockResolvedValue(null);

      const isAuth = await AuthService.isAuthenticated();

      expect(isAuth).toBe(false);
    });
  });

  describe('signOut', () => {
    it('should remove auth token on sign out', async () => {
      (StorageService.remove as jest.Mock).mockResolvedValue(true);

      const result = await AuthService.signOut();

      expect(result).toBe(true);
      expect(StorageService.remove).toHaveBeenCalled();
    });
  });

  describe('deleteAccount', () => {
    it('should remove user data and token', async () => {
      (StorageService.remove as jest.Mock).mockResolvedValue(true);

      const result = await AuthService.deleteAccount();

      expect(result).toBe(true);
      expect(StorageService.remove).toHaveBeenCalledTimes(2);
    });
  });
});
