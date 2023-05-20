import React, { useContext, useEffect, useState } from 'react';

const OnlineStatusContext = React.createContext(true);

export const OnlineStatusProvider: React.FC<React.PropsWithChildren<any>> = ({
  children,
}) => {
  const [onlineStatus, setOnlineStatus] = useState<boolean>(true);

  useEffect(() => {
    window.addEventListener('offline', () => {
      setOnlineStatus(false);
    });
    window.addEventListener('online', () => {
      setOnlineStatus(true);
    });

    return () => {
      window.removeEventListener('offline', () => {
        setOnlineStatus(false);
      });
      window.removeEventListener('online', () => {
        setOnlineStatus(true);
      });
    };
  }, []);

  return (
    <OnlineStatusContext.Provider value={onlineStatus}>
      {children}
    </OnlineStatusContext.Provider>
  );
};

export const useOnlineStatus = () => {
  const isLocal = window.location.href.includes('localhost');
  const isOnline = useContext(OnlineStatusContext);

  return { isOnline, isLocal };
};
