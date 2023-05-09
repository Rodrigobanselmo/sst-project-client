import { useState } from 'react';

export function useUpdate() {
  const [update, setUpdate] = useState({});

  function triggerUpdate() {
    setUpdate({});
  }

  return triggerUpdate;
}
