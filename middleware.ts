import { authMiddleware } from '@clerk/nextjs';

// This middleware protects routes based on your configuration
export default authMiddleware({
    // Public routes that don't require authentication
    publicRoutes: [
        '/',
        '/sign-in(.*)',
        '/sign-up(.*)',
        '/welcome',
        '/charts',
        '/api/tokens(.*)',
        '/api/health',
    ],
    // Routes that can be accessed while signed out but show different content when signed in
    ignoredRoutes: [
        '/api/tokens(.*)',
        '/api/health',
        '/api/rate-limiter-status',
    ],
});

export const config = {
    // Matcher for Next.js middleware
    matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
