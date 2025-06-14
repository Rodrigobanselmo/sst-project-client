import { useRouter } from 'next/router';

type AppRouterOptionsPath = {
  pathParams?: Record<string, string | number>;
  shallow?: boolean;
};

export const useAppRouter = () => {
  const router = useRouter();
  const params = router.query as Record<string, string>;

  const getPathmame = (path: string, options?: AppRouterOptionsPath) => {
    let pathname = path;
    const pathParams = options?.pathParams;

    if (pathParams) {
      pathname = Object.keys(options.pathParams || {}).reduce((acc, key) => {
        return acc.replace(`[${key}]`, pathParams[key] as string);
      }, pathname);
    }

    return pathname;
  };

  const push = (path: string, options?: AppRouterOptionsPath) => {
    router.push(getPathmame(path, options));
  };

  const replace = (path: string | '', options?: AppRouterOptionsPath) => {
    router.replace(getPathmame(path, options), undefined, {
      shallow: options?.shallow,
    });
  };

  const replaceParams = ({
    pathParams,
    shallow = true,
  }: AppRouterOptionsPath) => {
    const newParams = { ...params, ...pathParams };
    const queries = router.asPath.split('?')?.[1];
    const path = queries ? `${router.pathname}?${queries}` : router.pathname;

    router.replace(getPathmame(path, { pathParams: newParams }), undefined, {
      shallow,
    });
  };

  return {
    push: push,
    replace: replace,
    replaceParams: replaceParams,
    params: params,
  };
};
