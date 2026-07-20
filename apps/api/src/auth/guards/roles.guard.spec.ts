import {
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';
import { RolesGuard } from './roles.guard';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { SessionUser } from '../auth.service';

describe('RolesGuard', () => {
  let reflector: { getAllAndOverride: jest.Mock };
  let guard: RolesGuard;

  beforeEach(() => {
    reflector = { getAllAndOverride: jest.fn() };
    guard = new RolesGuard(reflector as unknown as Reflector);
  });

  function createContext(user?: SessionUser): ExecutionContext {
    return {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
    } as ExecutionContext;
  }

  it('allows when no roles metadata is set', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);
    expect(guard.canActivate(createContext())).toBe(true);
  });

  it('allows ADMIN when ADMIN role is required', () => {
    reflector.getAllAndOverride.mockReturnValue([UserRole.ADMIN]);
    const user: SessionUser = {
      id: 'a1',
      email: 'admin@bookspace.local',
      role: UserRole.ADMIN,
      slug: 'admin',
    };
    expect(guard.canActivate(createContext(user))).toBe(true);
    expect(reflector.getAllAndOverride).toHaveBeenCalledWith(ROLES_KEY, [
      expect.anything(),
      expect.anything(),
    ]);
  });

  it('forbids USER when ADMIN role is required', () => {
    reflector.getAllAndOverride.mockReturnValue([UserRole.ADMIN]);
    const user: SessionUser = {
      id: 'u1',
      email: 'user@bookspace.local',
      role: UserRole.USER,
      slug: 'user',
    };
    expect(() => guard.canActivate(createContext(user))).toThrow(
      ForbiddenException,
    );
  });

  it('rejects when user is missing on request', () => {
    reflector.getAllAndOverride.mockReturnValue([UserRole.ADMIN]);
    expect(() => guard.canActivate(createContext(undefined))).toThrow(
      UnauthorizedException,
    );
  });
});
