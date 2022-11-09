import decode from 'jwt-decode';
import {
  GetServerSideProps,
  GetServerSidePropsContext,
  GetServerSidePropsResult,
} from 'next';
import { destroyCookie, parseCookies } from 'nookies';

import { RoutesEnum } from '../../enums/routes.enums';
import { AuthTokenError } from '../../services/errors/AuthTokenError';
import { validateUserPermissions } from './validateUserPermissions';

type WithSSRAuthOptions = {
  permissions?: string[];
  roles?: string[];
  skipCompanyCheck?: boolean;
};

export function withSSRAuth(
  fn: GetServerSideProps<any>,
  options?: WithSSRAuthOptions,
): GetServerSideProps {
  return async (
    ctx: GetServerSidePropsContext,
  ): Promise<GetServerSidePropsResult<any>> => {
    const cookies = parseCookies(ctx);
    const token = cookies['nextauth.token'];
    const refreshToken = cookies['nextauth.refreshToken'];
    if (!token) {
      return {
        redirect: {
          destination: `${RoutesEnum.LOGIN}?redirect=${ctx.resolvedUrl
            .replace(/[/]/g, '|')
            .replace(/[&]/g, '$')}`,
          permanent: false,
        },
      };
    }

    const user = decode<{
      permissions: string[];
      roles: string[];
      exp: number;
      companyId?: string;
    }>(token);

    if (!user.companyId && !options?.skipCompanyCheck)
      return {
        redirect: {
          destination: `${RoutesEnum.ONBOARD_NO_TEAM}?redirect=${ctx.resolvedUrl
            .replace(/[/]/g, '|')
            .replace(/[&]/g, '$')}`,
          permanent: false,
        },
      };

    if (options) {
      const refresh = decode<{ exp: number }>(refreshToken);
      const { permissions, roles } = options;
      const isExpiredTokens =
        new Date(refresh.exp * 1000) < new Date() &&
        new Date(user.exp * 1000) < new Date();

      const userHasValidPermissions = validateUserPermissions({
        user,
        permissions,
        roles,
      });

      if (isExpiredTokens) {
        destroyCookie(null, 'nextauth.token', { path: '/' });
        destroyCookie(null, 'nextauth.refreshToken', { path: '/' });

        return {
          redirect: {
            destination: `${RoutesEnum.LOGIN}?redirect=${ctx.resolvedUrl
              .replace(/[/]/g, '|')
              .replace(/[&]/g, '$')}`,
            permanent: false,
          },
        };
      }
      if (!userHasValidPermissions) {
        return {
          redirect: {
            destination: `${RoutesEnum.DASHBOARD}?redirect=${ctx.resolvedUrl
              .replace(/[/]/g, '|')
              .replace(/[&]/g, '$')}`,
            permanent: false,
          },
        };
      }
    }

    try {
      return await fn(ctx);
    } catch (err) {
      if (err instanceof AuthTokenError) {
        destroyCookie(null, 'nextauth.token', { path: '/' });
        destroyCookie(null, 'nextauth.refreshToken', { path: '/' });
      }
      return {
        redirect: {
          destination: `${RoutesEnum.LOGIN}?redirect=${ctx.resolvedUrl
            .replace(/[/]/g, '|')
            .replace(/[&]/g, '$')}`,
          permanent: false,
        },
      };
    }
  };
}
