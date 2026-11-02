import { sstEditSession } from '@v2/features/sst-operational/edit-session';
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useStore } from 'react-redux';
import { flushSync } from 'react-dom';
import axios from 'axios';

import {
  GoogleAuthProvider,
  signInWithPopup,
  UserCredential,
} from 'firebase/auth';
import Router, { useRouter } from 'next/router';
import { destroyCookie, parseCookies, setCookie } from 'nookies';
import { useSnackbar } from 'notistack';
import {
  selectRedirectRoute,
  setIsFetchingData,
} from 'store/reducers/routeLoad/routeLoadSlice';
import { createUser, selectUser } from 'store/reducers/user/userSlice';

import { firebaseAuth, firebaseProvider } from 'configs/firebase';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { useAppDispatch } from 'core/hooks/useAppDispatch';
import { useAppSelector } from 'core/hooks/useAppSelector';
import { ISession } from 'core/interfaces/api/ISession';
import { useMutUpdateUser } from 'core/services/hooks/mutations/user/useMutUpdateUser';

import { RoutesEnum } from '../enums/routes.enums';
import { IUser } from '../interfaces/api/IUser';
import { api } from '../services/apiClient';
import { signInService } from '@v2/services/auth/session/sign-in/service/sign-in.service';
import { useMutateSignIn } from '@v2/services/auth/session/sign-in/hooks/useMutateSignIn';
import { useApiResponseHandler } from '@v2/hooks/api/useApiResponseHandler';
import { queryClient } from '../services/queryClient';
import { v2QueryClient } from '@v2/services/query-client';
import { resolveActiveCompanyContext } from '../utils/auth/resolve-active-company-context';
import { subscribeAuthLogout } from './auth-broadcast';
import { browserAuthSession } from './auth-session-lifecycle';
import { purgeSessionDrafts } from './auth-session-policy';

export type SignInCredentials = {
  email: string;
  password: string;
  token?: string;
  googleToken?: string;
  name?: string;
  photoUrl?: string;
};

type AuthContextData = {
  signIn(credentials: SignInCredentials): Promise<void>;
  signUp(credentials: SignInCredentials): Promise<void>;
  googleSignUp: (token?: string) => Promise<void | UserCredential>;
  googleSignIn: () => Promise<void | UserCredential>;
  googleSignLink: () => Promise<void | UserCredential>;
  signOut: (options?: { redirect?: boolean }) => Promise<void>;
  clearAuthSession: () => void;
  refreshUser: (companyId?: string) => Promise<void>;
  user: Partial<IUser> | null;
  isAuthenticated: boolean;
  isInitializingAuth: boolean;
  token: string | undefined;
};

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthContext = createContext({} as AuthContextData);

let authChannel: BroadcastChannel | undefined;
type LogoutOptions = { redirect?: boolean; broadcast?: boolean };
let providerSignOut: ((options?: LogoutOptions) => Promise<void>) | undefined;

export function clearAuthSession(ctx?: any) {
  if (typeof window !== 'undefined') browserAuthSession.end();
  sstEditSession.clear();
  if (typeof window !== 'undefined') purgeSessionDrafts(window);

  destroyCookie(ctx, 'nextauth.token', { path: '/' });
  destroyCookie(ctx, 'nextauth.refreshToken', { path: '/' });

  delete api.defaults.headers.common['Authorization'];
  if (typeof window !== 'undefined') {
    delete (api.defaults.headers as any)['Authorization'];
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
export async function signOut(ctx?: any, options?: { redirect?: boolean }) {
  if (typeof window !== 'undefined') {
    if (providerSignOut) return providerSignOut(options);
    return browserAuthSession.logout(async (generation) => {
      clearAuthSession(ctx);
      authChannel?.postMessage('signOut');
      await firebaseAuth.signOut().catch(() => {});
      if (
        browserAuthSession.isGeneration(generation) &&
        options?.redirect !== false &&
        Router.pathname !== RoutesEnum.LOGIN
      )
        await Router.replace(RoutesEnum.LOGIN);
    });
  }
  // A server request owns only its cookies, never another request's lifecycle.
  clearAuthSession(ctx);
}

export async function refreshToken(companyId?: string) {
  const generation = browserAuthSession.capture();
  const { 'nextauth.refreshToken': refresh_token } = parseCookies();
  if (
    typeof window !== 'undefined' &&
    (!refresh_token || !browserAuthSession.isCurrent(generation))
  )
    throw new axios.Cancel('A sessão foi encerrada.');

  const refresh = await api.post('/refresh', { refresh_token, companyId });
  if (
    typeof window !== 'undefined' &&
    (!browserAuthSession.isCurrent(generation) ||
      parseCookies()['nextauth.refreshToken'] !== refresh_token)
  )
    throw new axios.Cancel('A sessão foi encerrada.');

  const { token } = refresh.data;

  setCookie(null, 'nextauth.token', token, {
    maxAge: 60 * 60 * 25 * 30, // 30 days
    path: '/',
  });

  setCookie(null, 'nextauth.refreshToken', refresh.data.refresh_token, {
    maxAge: 60 * 60 * 25 * 30, // 30 days
    path: '/',
  });

  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (api.defaults.headers as any)['Authorization'] = `Bearer ${token}`;

  return { token, refresh, api };
}

export function extractUrlTokens() {
  const url = new URL(window.location.href);
  const accessToken = url.searchParams.get('accessToken') || undefined;
  const refreshToken = url.searchParams.get('refreshToken') || undefined;

  return { accessToken, refreshToken };
}

export function removeUrlTokens() {
  const url = new URL(window.location.href);
  url.searchParams.delete('accessToken');
  url.searchParams.delete('refreshToken');
  Router.replace(url.pathname + url.search, undefined, { shallow: true });
}

export function AuthProvider({ children }: AuthProviderProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const user = useAppSelector(selectUser);
  const store = useStore<any>();
  const redirect = useAppSelector(selectRedirectRoute);
  const { enqueueSnackbar } = useSnackbar();
  const { onErrorMessage, onSuccessMessage } = useApiResponseHandler();
  const isAuthenticated = !!user;
  const [isInitializingAuth, setIsInitializingAuth] = useState(() => {
    if (typeof window === 'undefined') return false;
    return !!parseCookies()['nextauth.token'];
  });

  const signOutFunc = useCallback(
    (options?: LogoutOptions) =>
      browserAuthSession.logout(async (generation) => {
        // Unmount private observers before clearing caches. Clearing first can
        // recreate their queries against the route's company after token removal.
        flushSync(() => {
          dispatch(createUser(null));
          dispatch(setIsFetchingData(false));
          setIsInitializingAuth(false);
        });
        clearAuthSession();
        void queryClient.cancelQueries();
        void v2QueryClient.cancelQueries();
        queryClient.clear();
        v2QueryClient.clear();
        if (options?.broadcast !== false) authChannel?.postMessage('signOut');
        await firebaseAuth.signOut().catch(() => {});
        if (
          browserAuthSession.isGeneration(generation) &&
          options?.redirect !== false &&
          process.browser &&
          Router.pathname !== RoutesEnum.LOGIN
        )
          await Router.replace(RoutesEnum.LOGIN);
      }),
    [dispatch],
  );

  const getMe = useCallback(async () => {
    const generation = browserAuthSession.capture();
    if (!browserAuthSession.isCurrent(generation)) return;
    try {
      const response = await api.get(ApiRoutesEnum.ME);
      if (
        !browserAuthSession.isCurrent(generation) ||
        !parseCookies()['nextauth.token']
      )
        return;
      const activeCompany = resolveActiveCompanyContext(response.data);

      dispatch(
        createUser({
          ...response.data,
          ...activeCompany,
        }),
      );

      if (response.data.mustChangePassword) {
        if (!router.asPath.includes(RoutesEnum.CHANGE_REQUIRED_PASSWORD)) {
          router.replace(RoutesEnum.CHANGE_REQUIRED_PASSWORD);
        }
        return;
      }

      if (
        !response.data.name &&
        !router.asPath.includes(RoutesEnum.ONBOARD_USER)
      ) {
        router.replace(RoutesEnum.ONBOARD_USER);
      }
    } catch (error) {
      if (browserAuthSession.isCurrent(generation) && !axios.isCancel(error))
        await signOutFunc({ redirect: true });
    } finally {
      if (browserAuthSession.isGeneration(generation))
        setIsInitializingAuth(false);
    }
  }, [dispatch, router, signOutFunc]);

  useEffect(() => {
    const { 'nextauth.token': token } = parseCookies();

    if (!token) {
      setIsInitializingAuth(false);
      return;
    }

    setIsInitializingAuth(true);
    void getMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, store]);

  useEffect(() => {
    providerSignOut = signOutFunc;
    const channel = new BroadcastChannel('auth');
    authChannel = channel;
    const unsubscribe = subscribeAuthLogout(channel, signOutFunc);
    return () => {
      unsubscribe();
      if (providerSignOut === signOutFunc) providerSignOut = undefined;
      if (authChannel === channel) authChannel = undefined;
    };
  }, [signOutFunc]);

  const signToken = (
    { token, refresh_token, permissions, roles, companyId, user }: ISession,
    type: 'signIn' | 'signUp',
    generation: number,
  ) => {
    if (!browserAuthSession.isCurrent(generation)) return;
    setCookie(null, 'nextauth.token', token, {
      maxAge: 60 * 60 * 25 * 30, // 30 days
      path: '/',
    });

    setCookie(null, 'nextauth.refreshToken', refresh_token, {
      maxAge: 60 * 60 * 25 * 30, // 30 days
      path: '/',
    });

    const activeCompany = resolveActiveCompanyContext(user, {
      companyId,
      permissions,
      roles,
    });

    dispatch(
      createUser({
        ...user,
        ...activeCompany,
      }),
    );

    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (api.defaults.headers as any)['Authorization'] = `Bearer ${token}`;

    setIsInitializingAuth(false);

    if (user?.mustChangePassword) {
      router.push(RoutesEnum.CHANGE_REQUIRED_PASSWORD);
    } else if (type === 'signIn') {
      router.push(redirect || RoutesEnum.DASHBOARD);
    }

    if (type === 'signUp') {
      router.push(RoutesEnum.ONBOARD_USER);
    }

    authChannel?.postMessage('signIn');
  };

  async function signIn({ email, password, googleToken }: SignInCredentials) {
    const generation = browserAuthSession.begin();
    const path = googleToken
      ? ApiRoutesEnum.SESSION_GOOGLE
      : ApiRoutesEnum.SESSION;

    const payload = googleToken
      ? { googleToken, email }
      : {
          email,
          password,
        };

    const response = await api.post<ISession>(path, payload);

    signToken(response.data, 'signIn', generation);
  }

  async function signUp({
    email,
    password,
    googleToken,
    name,
    photoUrl,
    token,
  }: SignInCredentials) {
    const generation = browserAuthSession.begin();
    await signInService({
      token: token || '',
      email,
      password,
      googleToken,
    });

    if (browserAuthSession.isCurrent(generation))
      await signIn({ email, password, googleToken });
  }

  async function googleSignIn() {
    const generation = browserAuthSession.begin();
    const result = await signInWithPopup(firebaseAuth, firebaseProvider).catch(
      (error) => {
        enqueueSnackbar('Erro ao tentar fazer login com o Google', {
          variant: 'error',
        });
      },
    );
    if (result && browserAuthSession.isCurrent(generation)) {
      // This gives you a Google Access Token. You can use it to access the Googl e API.
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential) {
        const googleToken = credential.idToken;

        try {
          dispatch(setIsFetchingData(true));
          await signIn({
            email: result.user.email || '',
            password: '',
            googleToken,
          });
          dispatch(setIsFetchingData(false));
        } catch (error) {
          if ((error as any)?.response)
            enqueueSnackbar((error as any)?.response.data.message, {
              variant: 'error',
            });

          await firebaseAuth.signOut();
          dispatch(setIsFetchingData(false));
        }
      }
    }

    return result;
  }

  async function googleSignUp(token?: string) {
    const generation = browserAuthSession.begin();
    const result = await signInWithPopup(firebaseAuth, firebaseProvider).catch(
      (error) => {
        enqueueSnackbar('Erro ao tentar fazer entrar com o Google', {
          variant: 'error',
        });
      },
    );

    if (result && browserAuthSession.isCurrent(generation)) {
      dispatch(setIsFetchingData(true));

      if (!result.user.email) {
        enqueueSnackbar('Você precisa permitir o acesso ao seu e-mail', {
          variant: 'error',
        });
        await firebaseAuth.signOut();
        dispatch(setIsFetchingData(false));
        return;
      }
      // This gives you a Google Access Token. You can use it to access the Googl e API.
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential) {
        const googleToken = credential.idToken;

        try {
          await signUp({
            email: result.user.email,
            password: '',
            googleToken: googleToken,
            token,
            ...(result.user.displayName && {
              name: result.user.displayName,
            }),
            ...(result.user.photoURL && {
              photoUrl: result.user.photoURL,
            }),
          });
        } catch (error) {
          if ((error as any)?.response)
            enqueueSnackbar((error as any)?.response.data.message, {
              variant: 'error',
            });

          await firebaseAuth.signOut();
        }
      }

      dispatch(setIsFetchingData(false));
    }

    return result;
  }

  async function googleSignLink() {
    const result = await signInWithPopup(firebaseAuth, firebaseProvider).catch(
      (error) => {
        enqueueSnackbar('Erro ao tentar fazer login com o Google', {
          variant: 'error',
        });
      },
    );

    return result;
  }

  async function refreshUser(companyId?: string) {
    const generation = browserAuthSession.capture();
    await refreshToken(companyId || user?.companyId);

    if (browserAuthSession.isCurrent(generation)) await getMe();
  }

  return (
    <AuthContext.Provider
      value={{
        signIn,
        signOut: signOutFunc,
        clearAuthSession,
        refreshUser,
        user,
        isAuthenticated,
        isInitializingAuth,
        signUp,
        googleSignLink,
        googleSignIn,
        googleSignUp: googleSignUp,
        token: parseCookies()['nextauth.token'],
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = (): AuthContextData => useContext(AuthContext);
