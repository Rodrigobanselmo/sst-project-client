/* eslint-disable @typescript-eslint/no-unused-vars */
import { verify } from 'jsonwebtoken';
import type { NextFetchEvent, NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { RoutesEnum } from '../core/enums/routes.enums';

export function middleware(req: NextRequest, ev: NextFetchEvent) {
  if (req.headers.get('accept')?.includes('text/html')) {
    const token = req.cookies['nextauth.token'];
    const secret = process.env.TOKEN_SECRET;
    let isValidToken = true;

    if (secret && token) {
      try {
        verify(token, secret, {
          algorithms: ['HS256'],
        });
      } catch (e) {
        isValidToken = false;
      }
    }

    if (
      (!token || !isValidToken) &&
      req.nextUrl.pathname.includes(RoutesEnum.DASHBOARD)
    ) {
      return NextResponse.redirect(RoutesEnum.LOGIN);
    }

    if (
      token &&
      isValidToken &&
      !req.nextUrl.pathname.includes(RoutesEnum.DASHBOARD) &&
      !req.nextUrl.pathname.includes(RoutesEnum.PUBLIC)
    ) {
      return NextResponse.redirect(RoutesEnum.DASHBOARD);
    }
  }
}
