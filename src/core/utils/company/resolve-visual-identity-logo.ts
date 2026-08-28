export type VisualIdentityLogoSource = {
  visualIdentityEnabled?: boolean;
  logoUrl?: string | null;
  customLogoUrl?: string | null;
  logoLightUrl?: string | null;
  logoDarkUrl?: string | null;
};

function standardInterfaceLogo(
  identity: VisualIdentityLogoSource,
): string | undefined {
  return identity.customLogoUrl || identity.logoUrl || undefined;
}

/**
 * Logo da sidebar: padrão da interface, igual em Claro e Escuro.
 * customLogoUrl → logoUrl. Nunca usa logoLightUrl / logoDarkUrl.
 */
export function resolveSidebarLogo(
  identity: VisualIdentityLogoSource | null | undefined,
): string | undefined {
  if (!identity?.visualIdentityEnabled) return undefined;
  return standardInterfaceLogo(identity);
}

/**
 * Logo do header junto do usuário, específica do modo.
 * logoLightUrl | logoDarkUrl → customLogoUrl → logoUrl.
 */
export function resolveHeaderLogo(
  identity: VisualIdentityLogoSource | null | undefined,
  mode: 'light' | 'dark',
): string | undefined {
  if (!identity?.visualIdentityEnabled) return undefined;

  const fallback = standardInterfaceLogo(identity);
  const modeLogo =
    mode === 'dark' ? identity.logoDarkUrl : identity.logoLightUrl;

  return modeLogo || fallback;
}
