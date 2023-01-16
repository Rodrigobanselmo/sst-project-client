export type IUf = {
  code: string;
  uf: string;
  name: string;
};
export type ICities = {
  code: string;
  name: string;
  ufCode: string | null;
  uf?: IUf;
};
