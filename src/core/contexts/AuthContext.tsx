/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable indent */
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
} from 'react';
import { useStore } from 'react-redux';

import Router, { useRouter } from 'next/router';
import { destroyCookie, parseCookies, setCookie } from 'nookies';
import { createUser, selectUser } from 'store/reducers/user/userSlice';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { useAppDispatch } from 'core/hooks/useAppDispatch';
import { useAppSelector } from 'core/hooks/useAppSelector';

import { RoutesEnum } from '../enums/routes.enums';
import { IUser } from '../interfaces/api/IUser';
import { api } from '../services/apiClient';

export type SignInCredentials = {
  email: string;
  password: string;
};

type AuthContextData = {
  signIn(credentials: SignInCredentials): Promise<void>;
  signOut: () => void;
  user: IUser | null;
  isAuthenticated: boolean;
};

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthContext = createContext({} as AuthContextData);

let authChannel: BroadcastChannel;

export function signOut(ctx?: any) {
  destroyCookie(ctx, 'nextauth.token');
  destroyCookie(ctx, 'nextauth.refreshToken');

  if (authChannel) authChannel.postMessage('signOut');

  Router.push(RoutesEnum.LOGIN);
}

export function AuthProvider({ children }: AuthProviderProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const user = useAppSelector(selectUser);
  const store = useStore();

  const isAuthenticated = !!user;

  const signOutFunc = useCallback(() => {
    signOut();
    dispatch(createUser(null));
  }, [dispatch]);

  useEffect(() => {
    const { 'nextauth.token': token } = parseCookies();

    if (token) {
      api
        .get(ApiRoutesEnum.ME)
        .then((response) => {
          const { email, id, permissions, roles, companyId } = response.data;
          dispatch(
            createUser({
              email,
              id,
              permissions,
              roles,
              companyId,
            }),
          );
        })
        .catch(() => {
          signOutFunc();
        });
    }
  }, [dispatch, store, signOutFunc]);

  useEffect(() => {
    authChannel = new BroadcastChannel('auth');

    authChannel.onmessage = (message) => {
      switch (message.data) {
        case 'signOut':
          if (parseCookies()['nextauth.token']) signOutFunc();
          break;
        default:
          break;
      }
    };
  }, [signOutFunc]);

  async function signIn({ email, password }: SignInCredentials) {
    const response = await api.post(ApiRoutesEnum.SESSION, { email, password });
    const {
      token,
      refresh_token,
      permissions,
      roles,
      companyId,
      user: { id },
    } = response.data;

    setCookie(undefined, 'nextauth.token', token, {
      maxAge: 60 * 60 * 25 * 30, // 30 days
      path: '/',
    });

    setCookie(undefined, 'nextauth.refreshToken', refresh_token, {
      maxAge: 60 * 60 * 25 * 30, // 30 days
      path: '/',
    });

    dispatch(
      createUser({
        email,
        id,
        permissions,
        roles,
        companyId,
      }),
    );

    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    router.push(RoutesEnum.DASHBOARD);

    authChannel.postMessage('signIn');
  }

  return (
    <AuthContext.Provider
      value={{ signIn, signOut: signOutFunc, user, isAuthenticated }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = (): AuthContextData => useContext(AuthContext);
