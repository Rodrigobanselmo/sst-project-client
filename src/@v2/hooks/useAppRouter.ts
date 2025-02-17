import { useRouter } from 'next/router';

type AppRouterOptionsPath = {
  pathParams?: Record<string, string | number>;
};

export const useAppRouter = () => {
  const router = useRouter();

  const push = (path: string, options?: AppRouterOptionsPath) => {
    let pathname = path;
    const pathParams = options?.pathParams;

    if (pathParams) {
      pathname = Object.keys(options.pathParams || {}).reduce((acc, key) => {
        return acc.replace(`:${key}`, pathParams[key] as string);
      }, pathname);
    }

    router.push(pathname);
  };

  return {
    push,
  };
};
