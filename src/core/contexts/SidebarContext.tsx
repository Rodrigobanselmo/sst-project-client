import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from 'react';

import useMediaQuery from '@mui/material/useMediaQuery';
import { useRouter } from 'next/router';

import { useDisclosure } from '../hooks/useDisclosure';

interface SidebarDrawerContextData {
  isMobile: boolean;
  isTablet: boolean;
  alwaysOpen: boolean;
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

  const disclosure = useDisclosure(true);
  const router = useRouter();

  const [urlRouter, setUrlRouter] = useState(router.asPath);
  const [alwaysOpen, setAlwaysOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (urlRouter !== router.asPath && isMobile) {
      disclosure.close();
      setUrlRouter(router.asPath);
    }
  }, [disclosure, router.asPath, urlRouter, isMobile]);

  return (
    <SidebarDrawerContext.Provider
      value={{
        ...disclosure,
        isMobile: !!isMobile,
        isTablet: !!isTablet,
        alwaysOpen,
        isOpen: disclosure.isOpen || alwaysOpen || isSearching,
        setAlwaysOpen,
        setIsSearching,
      }}
    >
      {children}
    </SidebarDrawerContext.Provider>
  );
}

export const useSidebarDrawer = (): SidebarDrawerContextData =>
  useContext(SidebarDrawerContext);
