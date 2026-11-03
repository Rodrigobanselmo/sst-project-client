type LogoutChannel = Pick<
  BroadcastChannel,
  'addEventListener' | 'removeEventListener' | 'close'
>;

/** Cookies have already been removed by the sender in the usual cross-tab
 * logout. Receiving the event must therefore end local state unconditionally,
 * and must never broadcast it back to the other tabs. The caller owns this
 * channel, so unmount detaches the listener and closes it. */
export function subscribeAuthLogout(
  channel: LogoutChannel,
  logout: (options: { broadcast: false }) => unknown,
): () => void {
  let listening = true;
  const receive = (event: MessageEvent<unknown>) => {
    if (listening && event.data === 'signOut')
      void logout({ broadcast: false });
  };
  channel.addEventListener('message', receive);
  return () => {
    if (!listening) return;
    listening = false;
    channel.removeEventListener('message', receive);
    channel.close();
  };
}
