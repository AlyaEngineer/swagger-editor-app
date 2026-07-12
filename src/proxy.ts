import { createServerClient } from '@supabase/ssr';
import createIntlMiddleware from 'next-intl/middleware';
import { type NextRequest, NextResponse } from 'next/server';

import { ROUTES } from '@/constants/routes';

import { routing } from './i18n/routing';

const AUTH_ROUTES = [ROUTES.signIn, ROUTES.signUp];

const handleIntl = createIntlMiddleware(routing);

export async function proxy(request: NextRequest) {
  let response = handleIntl(request);

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

          response = NextResponse.next({ request });

          cookiesToSet.forEach(({ name, options, value }) => {
            response.cookies.set(name, value, options);
          });

          if (headers) {
            Object.entries(headers).forEach(([key, value]) => {
              response.headers.set(key, value);
            });
          }
        },
      },
    },
  );

  let isAuthenticated = false;

  try {
    const { data, error } = await supabase.auth.getClaims();

    if (error) {
      console.error('Failed to refresh Supabase session in proxy:', error);
    }

    isAuthenticated = !!data && !error;
  } catch (unexpectedError) {
    console.error('Unexpected error while checking Supabase session in proxy:', unexpectedError);
  }

  const isAuthRoute = matchesRoute(request.nextUrl.pathname, AUTH_ROUTES);

  if (isAuthRoute && isAuthenticated) {
    const currentLocale = getCurrentLocale(request.nextUrl.pathname);
    const mainUrl = new URL(`/${currentLocale}`, request.url);

    const redirectResponse = NextResponse.redirect(mainUrl);

    response.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie);
    });

    response.headers.forEach((value, key) => {
      redirectResponse.headers.set(key, value);
    });

    return redirectResponse;
  }

  return response;
}

function getCurrentLocale(pathname: string): string {
  const currentLocale = pathname.split('/')[1];

  return routing.locales.find((locale) => locale === currentLocale) ?? routing.defaultLocale;
}

function matchesRoute(pathname: string, routes: string[]) {
  const segments = pathname.split('/');

  return routes.some((route) => segments.includes(route.replace('/', '')));
}

export const config = {
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)',
};
