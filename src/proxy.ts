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

    intlResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie);
    });

    return redirectResponse;
  }

  return intlResponse;
}

function getCurrentLocale(pathname: string) {
  const localePattern = routing.locales.join('|');
  const match = pathname.match(new RegExp(`^/(${localePattern})(?:/|$)`));

  return match?.[1] ?? routing.defaultLocale;
}

function matchesRoute(pathname: string, routes: string[]) {
  return routes.some((route) => {
    const pattern = new RegExp(`(^|/)${route.replace('/', '')}(/|$)`);

    return pattern.test(pathname);
  });
}

export const config = {
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)',
};
