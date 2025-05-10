import {
    CanActivate,
    ExecutionContext,
    Injectable,
    ForbiddenException,
  } from '@nestjs/common';
  import { Reflector } from '@nestjs/core';
  import { ROLE_KEY } from 'src/decorator/roles.decorator';
  
  @Injectable()
  export class RoleGuard implements CanActivate {
    constructor(private reflector: Reflector) {}
  
    canActivate(context: ExecutionContext): boolean {
      const requiredRole = this.reflector.get<string>(ROLE_KEY, context.getHandler());
  
      if (!requiredRole) {
        return true; // No role restriction, allow access
      }
   
      const request = context.switchToHttp().getRequest();
      const user = request.user;
      if (!user) {
        throw new ForbiddenException('User not authenticated');
      }
      if (user && user.role === requiredRole) {
        return true;
      }
      console.log(user.role, requiredRole);
      throw new ForbiddenException(`Access denied. Required role: ${requiredRole}`);
    }
  }
  