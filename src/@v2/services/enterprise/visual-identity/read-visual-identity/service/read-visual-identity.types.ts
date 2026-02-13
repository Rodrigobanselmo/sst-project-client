export interface ReadVisualIdentityParams {
  companyId: string;
}

export interface IVisualIdentityModel {
  companyId: string;
  companyName: string;
  primaryColor: string | null;
  shortName: string | null;
  logoUrl: string | null;
  customLogoUrl: string | null;
  sidebarBackgroundColor: string | null;
  applicationBackgroundColor: string | null;
  visualIdentityEnabled: boolean;
}
