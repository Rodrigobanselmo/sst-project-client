type AuxiliaryUser =
  | {
      id?: number | string;
      permissions?: string[];
      roles?: string[];
    }
  | null
  | undefined;

// Optional company branding/group requests must not require broader company
// rights just to use another module (e.g. an eSocial-only operator). This is a
// UI fetch gate; the API continues to authorize every actual request.
export function canReadCompanyAuxiliaryData(user: AuxiliaryUser): boolean {
  if (!user?.id) return false;
  if (user.roles?.includes('master')) return true;
  return (user.permissions || []).some((permission) => {
    const [code, rights] = permission.split('-');
    return (
      (code === '2' || code === 'master') &&
      /^[crud]+$/.test(rights || '') &&
      rights.includes('r')
    );
  });
}
