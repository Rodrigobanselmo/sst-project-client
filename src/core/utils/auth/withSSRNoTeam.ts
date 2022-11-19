import decode from 'jwt-decode';
import {
  GetServerSideProps,
  GetServerSidePropsContext,
  GetServerSidePropsResult,
} from 'next';
import { parseCookies } from 'nookies';

import { RoutesEnum } from '../../enums/routes.enums';

export function withSSRNoTeam(fn: GetServerSideProps<any>): GetServerSideProps {
  return async (
    ctx: GetServerSidePropsContext,
  ): Promise<GetServerSidePropsResult<any>> => {
    const cookies = parseCookies(ctx);
    const token = cookies['nextauth.token'];

    if (!token) {
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

    const user = decode<{ companyId?: string }>(token);

    if (user.companyId)
      return {
        redirect: {
          destination: `${RoutesEnum.DASHBOARD}`,
          permanent: false,
        },
      };

    return await fn(ctx);
  };
}
