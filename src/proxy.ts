import { createServerClient } from '@supabase/ssr';
import createIntlMiddleware from 'next-intl/middleware';
import { type NextRequest, NextResponse } from 'next/server';

import { routing } from './i18n/routing';

const AUTH_ROUTES = ['/sign-in', '/sign-up'];

const handleIntl = createIntlMiddleware(routing);

export async function proxy(request: NextRequest) {
  const intlResponse = handleIntl(request);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          cookiesToSet.forEach(({ name, options, value }) => {
            intlResponse.cookies.set(name, value, options);
          });

          if (headers) {
            Object.entries(headers).forEach(([key, value]) => {
              intlResponse.headers.set(key, value);
            });
          }
        },
      },
    },
  );

  const { data, error } = await supabase.auth.getClaims();

  if (error) {
    console.error('Failed to refresh Supabase session in proxy:', error);
  }

  const isAuthenticated = !!data && !error;

  const isAuthRoute = AUTH_ROUTES.some((route) => request.nextUrl.pathname.includes(route));

  if (isAuthRoute && isAuthenticated) {
    const mainUrl = new URL('/', request.url);

    return NextResponse.redirect(mainUrl);
  }

  return intlResponse;
}

export const config = {
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)',
};
