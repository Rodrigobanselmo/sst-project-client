import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import useMediaQuery from '@mui/material/useMediaQuery';
import { useRouter } from 'next/router';

import { useDisclosure } from '../hooks/useDisclosure';

interface SidebarDrawerContextData {
  isMobile: boolean;
  isTablet: boolean;
  alwaysOpen: boolean;
  isAlwaysClose: boolean;
  setAlwaysOpen: Dispatch<SetStateAction<boolean>>;
  setIsSearching: Dispatch<SetStateAction<boolean>>;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

interface ISidebarDrawerProps {
  children: ReactNode;
}

const SidebarDrawerContext = createContext({} as SidebarDrawerContextData);

export function SidebarDrawerProvider({
  children,
}: ISidebarDrawerProps): JSX.Element {
  const isMobile = !useMediaQuery('(min-width:600px)');
  const isTablet = !useMediaQuery('(min-width:1100px)');
  const isDesktop = !useMediaQuery('(min-width:5000px)');

  const disclosure = useDisclosure(true);
  const router = useRouter();

  const [urlRouter, setUrlRouter] = useState(router.asPath);
  const [alwaysOpen, setAlwaysOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (urlRouter !== router.asPath && isTablet) {
      disclosure.close();
      setUrlRouter(router.asPath);
    }
  }, [disclosure, router.asPath, urlRouter, isTablet]);

  useEffect(() => {
    if (isTablet && !isDesktop) {
      disclosure.close();
    }
  }, [disclosure, isDesktop, isTablet]);

  const isAlwaysClose = useMemo(() => {
    if (isTablet || isMobile) return false;
    return router.asPath.includes('hierarquia');
  }, [isMobile, isTablet, router.asPath]);

  const isOpen = useMemo(() => {
    return (disclosure.isOpen || alwaysOpen || isSearching) && !isAlwaysClose;
  }, [alwaysOpen, disclosure.isOpen, isAlwaysClose, isSearching]);

  return (
    <SidebarDrawerContext.Provider
      value={{
        ...disclosure,
        isMobile: !!isMobile,
        isTablet: !!isTablet,
        alwaysOpen,
        isOpen,
        setAlwaysOpen,
        setIsSearching,
        isAlwaysClose,
      }}
    >
      {children}
    </SidebarDrawerContext.Provider>
  );
}

export const useSidebarDrawer = (): SidebarDrawerContextData =>
  useContext(SidebarDrawerContext);
