import decode from 'jwt-decode';
import {
  GetServerSideProps,
  GetServerSidePropsContext,
  GetServerSidePropsResult,
} from 'next';
import { parseCookies } from 'nookies';

import { RoutesEnum } from '../../enums/routes.enums';

export function withSSRGuest(fn: GetServerSideProps<any>): GetServerSideProps {
  return async (
    ctx: GetServerSidePropsContext,
  ): Promise<GetServerSidePropsResult<any>> => {
    const cookies = parseCookies(ctx);

    const token = cookies['nextauth.token'];
    const refreshToken = cookies['nextauth.refreshToken'];

    if (token && refreshToken) {
      const refresh = decode<{ exp: number }>(refreshToken);

      if (new Date(refresh.exp * 1000) > new Date())
        return {
          redirect: {
            destination: `${RoutesEnum.DASHBOARD}`,
            permanent: false,
          },
        };
    }

    return await fn(ctx);
  };
}
