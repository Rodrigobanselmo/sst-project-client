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
  signOut: () => void;
  refreshUser: (companyId?: string) => Promise<void>;
  user: Partial<IUser> | null;
  isAuthenticated: boolean;
};

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthContext = createContext({} as AuthContextData);

let authChannel: BroadcastChannel;

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
export async function signOut(ctx?: any) {
  destroyCookie(null, 'nextauth.token', { path: '/' });

  destroyCookie(null, 'nextauth.refreshToken', { path: '/' });
  if (authChannel) authChannel.postMessage('signOut');

  await firebaseAuth.signOut();

  Router.push(RoutesEnum.LOGIN);
}

export async function refreshToken(companyId?: string) {
  const { 'nextauth.refreshToken': refresh_token } = parseCookies();

  const refresh = await api.post('/refresh', { refresh_token, companyId });

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
  const store = useStore<any>();
  const redirect = useAppSelector(selectRedirectRoute);
  const { enqueueSnackbar } = useSnackbar();
  const { onErrorMessage, onSuccessMessage } = useApiResponseHandler();
  const isAuthenticated = !!user;

  const signOutFunc = useCallback(() => {
    dispatch(createUser(null));
    signOut().then(() => {
      dispatch(setIsFetchingData(false));
    });
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, store]);

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
    { token, refresh_token, permissions, roles, companyId, user }: ISession,
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
        permissions,
        roles,
        companyId,
        ...user,
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

  async function signIn({ email, password, googleToken }: SignInCredentials) {
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

    signToken(response.data, 'signIn');
  }

  async function signUp({
    email,
    password,
    googleToken,
    name,
    photoUrl,
    token,
  }: SignInCredentials) {
    await signInService({
      token: token || '',
      email,
      password,
      googleToken,
    });

    await signIn({ email, password, googleToken });
  }

  async function googleSignIn() {
    const result = await signInWithPopup(firebaseAuth, firebaseProvider).catch(
      (error) => {
        enqueueSnackbar('Erro ao tentar fazer login com o Google', {
          variant: 'error',
        });
      },
    );
    if (result) {
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
    const result = await signInWithPopup(firebaseAuth, firebaseProvider).catch(
      (error) => {
        enqueueSnackbar('Erro ao tentar fazer entrar com o Google', {
          variant: 'error',
        });
      },
    );

    if (result) {
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
    await refreshToken(companyId || user?.companyId);

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
        googleSignUp,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = (): AuthContextData => useContext(AuthContext);
