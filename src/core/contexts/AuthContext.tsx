/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable indent */
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
} from 'react';
import { useStore } from 'react-redux';

import {
  GoogleAuthProvider,
  signInWithPopup,
  UserCredential,
} from 'firebase/auth';
import { route } from 'next/dist/server/router';
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

export type SignInCredentials = {
  email: string;
  password: string;
  token?: string;
  google_token_id?: string;
};

type AuthContextData = {
  signIn(credentials: SignInCredentials): Promise<void>;
  signUp(credentials: SignInCredentials): Promise<void>;
  googleSignIn: () => Promise<void | UserCredential>;
  googleSignLink: () => Promise<void | UserCredential>;
  signOut: () => void;
  refreshUser: () => void;
  user: Partial<IUser> | null;
  isAuthenticated: boolean;
};

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthContext = createContext({} as AuthContextData);

let authChannel: BroadcastChannel;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function signOut(ctx?: any) {
  destroyCookie(null, 'nextauth.token', { path: '/' });

  destroyCookie(null, 'nextauth.refreshToken', { path: '/' });
  if (authChannel) authChannel.postMessage('signOut');

  Router.push(RoutesEnum.LOGIN);
}

export async function refreshToken() {
  const { 'nextauth.refreshToken': refresh_token } = parseCookies();

  const refresh = await api.post('/refresh', { refresh_token });

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

export function AuthProvider({ children }: AuthProviderProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const user = useAppSelector(selectUser);
  const store = useStore();
  const redirect = useAppSelector(selectRedirectRoute);
  const { enqueueSnackbar } = useSnackbar();
  const isAuthenticated = !!user;

  const signOutFunc = useCallback(() => {
    signOut();
    dispatch(createUser(null));
  }, [dispatch]);

  const getMe = useCallback(async () => {
    try {
      const response = await api.get(ApiRoutesEnum.ME);

      dispatch(
        createUser({
          ...response.data,
        }),
      );

      if (
        !response.data.name &&
        !router.asPath.includes(RoutesEnum.ONBOARD_USER)
      ) {
        router.replace(RoutesEnum.ONBOARD_USER);
      }
    } catch (error) {
      signOutFunc();
    }
  }, [dispatch, router, signOutFunc]);

  useEffect(() => {
    const { 'nextauth.token': token } = parseCookies();

    if (token) getMe();
  }, [dispatch, store, signOutFunc, router, getMe]);

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

  const signToken = (
    {
      token,
      refresh_token,
      permissions,
      roles,
      companyId,
      user: { id, email },
    }: ISession,
    type: 'signIn' | 'signUp',
  ) => {
    setCookie(null, 'nextauth.token', token, {
      maxAge: 60 * 60 * 25 * 30, // 30 days
      path: '/',
    });

    setCookie(null, 'nextauth.refreshToken', refresh_token, {
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (api.defaults.headers as any)['Authorization'] = `Bearer ${token}`;

    if (type === 'signIn') {
      router.push(redirect || RoutesEnum.DASHBOARD);
    }

    if (type === 'signUp') {
      router.push(RoutesEnum.ONBOARD_USER);
    }

    authChannel.postMessage('signIn');
  };

  async function signIn({
    email,
    password,
    google_token_id,
  }: SignInCredentials) {
    const path = google_token_id
      ? ApiRoutesEnum.SESSION_GOOGLE
      : ApiRoutesEnum.SESSION;

    const payload = google_token_id
      ? { token: google_token_id }
      : {
          email,
          password,
        };

    const response = await api.post<ISession>(path, payload);

    signToken(response.data, 'signIn');
  }

  async function signUp({ email, password, token }: SignInCredentials) {
    const response = await api.post<ISession>(ApiRoutesEnum.USERS, {
      email,
      password,
      token,
    });

    signToken(response.data, 'signUp');
  }

  async function googleSignIn() {
    const result = await signInWithPopup(firebaseAuth, firebaseProvider).catch(
      (error) => {
        // Handle Errors here.
        // const errorCode = error.code;
        // const errorMessage = error.message;
        // The email of the user's account used.
        // const email = error.customData.email;
        // The AuthCredential type that was used.
        // const credential = GoogleAuthProvider.credentialFromError(error);
      },
    );
    if (result) {
      // This gives you a Google Access Token. You can use it to access the Google API.
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential) {
        const token = credential.idToken;

        try {
          dispatch(setIsFetchingData(true));
          await signIn({ email: '', password: '', google_token_id: token });
          dispatch(setIsFetchingData(false));
        } catch (error) {
          if ((error as any)?.response)
            enqueueSnackbar((error as any)?.response.data.message, {
              variant: 'error',
            });
          dispatch(setIsFetchingData(false));
        }
      }
    }

    return result;
  }

  async function googleSignLink() {
    const result = await signInWithPopup(firebaseAuth, firebaseProvider).catch(
      (error) => {
        // const errorMessage = error.message;
      },
    );

    return result;
  }

  async function refreshUser() {
    refreshToken();

    await getMe();
  }

  return (
    <AuthContext.Provider
      value={{
        signIn,
        signOut: signOutFunc,
        refreshUser,
        user,
        isAuthenticated,
        signUp,
        googleSignLink,
        googleSignIn,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = (): AuthContextData => useContext(AuthContext);
