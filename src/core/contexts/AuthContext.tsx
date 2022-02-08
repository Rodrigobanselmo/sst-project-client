/* eslint-disable indent */
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';

import Router, { useRouter } from 'next/router';
import { destroyCookie, parseCookies, setCookie } from 'nookies';

import { RoutesEnum } from '../enums/routes.enums';
import { IUser } from '../interfaces/IUser';
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

export function signOut() {
  destroyCookie(undefined, 'nextauth.token');
  destroyCookie(undefined, 'nextauth.refreshToken');

  authChannel.postMessage('signOut');

  Router.push(RoutesEnum.LOGIN);
}

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  const [user, setUser] = useState<IUser | null>(null);

  const isAuthenticated = !!user;

  useEffect(() => {
    const { 'nextauth.token': token } = parseCookies();

    if (token) {
      api
        .get('/users/me')
        .then((response) => {
          const { email, id: userId, companies } = response.data;

          setUser({
            email,
            userId,
            companies,
          });
        })
        .catch(() => {
          signOut();
        });
    }
  }, [setUser]);

  useEffect(() => {
    authChannel = new BroadcastChannel('auth');

    authChannel.onmessage = (message) => {
      switch (message.data) {
        case 'signOut':
          signOut();
          break;
        default:
          break;
      }
    };
  }, []);

  async function signIn({ email, password }: SignInCredentials) {
    const response = await api.post('session', { email, password });
    const {
      token,
      refresh_token,
      user: { id: userId, companies },
    } = response.data;

    setCookie(undefined, 'nextauth.token', token, {
      maxAge: 60 * 60 * 25 * 30, // 30 days
      path: '/',
    });

    setCookie(undefined, 'nextauth.refreshToken', refresh_token, {
      maxAge: 60 * 60 * 25 * 30, // 30 days
      path: '/',
    });

    setUser({
      email,
      userId,
      companies,
    });

    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    router.push(RoutesEnum.DASHBOARD);

    authChannel.postMessage('signIn');
  }

  return (
    <AuthContext.Provider value={{ signIn, signOut, user, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = (): AuthContextData => useContext(AuthContext);
