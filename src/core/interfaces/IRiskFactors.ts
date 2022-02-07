export type IRiskTypes = 'bio' | 'qui' | 'fis' | 'erg' | 'aci';

export interface IRiskFactors {
  id: string;
  name: string;
  type: IRiskTypes;
  system: boolean;
}
