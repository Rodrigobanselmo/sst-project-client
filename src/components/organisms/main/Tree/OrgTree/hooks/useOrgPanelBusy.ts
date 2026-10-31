import { useSyncExternalStore } from 'react';
import { queryClient } from 'core/services/queryClient';
import { useGseVisualAssistance } from '../components/GseVisualAssistance/GseVisualAssistance.context';

const subscribe = (notify: () => void) =>
  queryClient.getMutationCache().subscribe(notify);
const mutating = () => queryClient.isMutating() > 0;
/** Includes conventional linking and the characterization modal's mutations, plus additive saves. */
export function useOrgPanelBusy() {
  const assistance = useGseVisualAssistance();
  const conventionalBusy = useSyncExternalStore(subscribe, mutating, mutating);
  return conventionalBusy || !!assistance?.persistenceBusy;
}
