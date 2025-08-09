import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalAuthGuard extends AuthGuard('jwt') {
  // Override handleRequest to make authentication optional
  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    // If there's an error or no user, just return null (no authentication)
    // This allows the request to continue without authentication
    if (err || !user) {
      return null;
    }
    return user;
  }

  // Override canActivate to always return true (allow request to proceed)
  canActivate(context: ExecutionContext) {
    // Call the parent canActivate but don't throw on failure
    return super.canActivate(context).then(
      (result) => result,
      () => true // Always allow the request to proceed
    ) as boolean | Promise<boolean>;
  }
}
