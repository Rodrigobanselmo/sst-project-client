/** Tab-local async ownership. An old /me, login or refresh must not restore a
 * session after logout, nor overwrite a later explicit login. Server requests
 * must not use the browser singleton below. */
export function createAuthSessionLifecycle() {
  let generation = 0;
  let ended = false;
  let logoutInFlight: Promise<void> | undefined;
  const end = () => {
    if (!ended) generation++;
    ended = true;
  };

  return {
    capture: () => generation,
    isCurrent: (value: number) => value === generation && !ended,
    isGeneration: (value: number) => value === generation,
    isEnded: () => ended,
    begin: () => {
      generation++;
      ended = false;
      logoutInFlight = undefined;
      return generation;
    },
    end,
    logout(
      effect: (value: number) => unknown | Promise<unknown>,
    ): Promise<void> {
      if (logoutInFlight) return logoutInFlight;
      end();
      const owner = generation;
      let resolve!: () => void;
      let reject!: (error: unknown) => void;
      // Store the barrier before invoking synchronous cleanup: even a reentrant
      // auth error or channel event shares the same cleanup/navigation.
      const pending = new Promise<void>((done, fail) => {
        resolve = done;
        reject = fail;
      });
      logoutInFlight = pending;
      try {
        Promise.resolve(effect(owner)).then(() => resolve(), reject);
      } catch (error) {
        reject(error);
      }
      return pending;
    },
  };
}

export const browserAuthSession = createAuthSessionLifecycle();
