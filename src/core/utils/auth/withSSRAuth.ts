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
      const user = decode<{ permissions: string[]; roles: string[] }>(token);
      const { permissions, roles } = options;

      const userHasValidPermissions = validateUserPermissions({
        user,
        permissions,
        roles,
      });

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
        destroyCookie(ctx, 'nextauth.token');
        destroyCookie(ctx, 'nextauth.refreshToken');
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
