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
};

export function withSSRAuth<T>(
  fn: GetServerSideProps<T>,
  options?: WithSSRAuthOptions,
): GetServerSideProps {
  return async (
    ctx: GetServerSidePropsContext,
  ): Promise<GetServerSidePropsResult<T>> => {
    const cookies = parseCookies(ctx);
    const token = cookies['nextauth.token'];
    const refreshToken = cookies['nextauth.refreshToken'];

    if (!cookies['nextauth.token']) {
      return {
        redirect: {
          destination: `${RoutesEnum.LOGIN}?redirect=${ctx.resolvedUrl.replace(
            /[/]/g,
            '|',
          )}`,
          permanent: false,
        },
      };
    }

    if (options) {
      const user =
        decode<{ permissions: string[]; roles: string[]; exp: number }>(token);
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
            destination: `${
              RoutesEnum.LOGIN
            }?redirect=${ctx.resolvedUrl.replace(/[/]/g, '|')}`,
            permanent: false,
          },
        };
      }
      if (!userHasValidPermissions) {
        return {
          redirect: {
            destination: `${
              RoutesEnum.DASHBOARD
            }?redirect=${ctx.resolvedUrl.replace(/[/]/g, '|')}`,
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
          destination: `${RoutesEnum.LOGIN}?redirect=${ctx.resolvedUrl.replace(
            /[/]/g,
            '|',
          )}`,
          permanent: false,
        },
      };
    }
  };
}
