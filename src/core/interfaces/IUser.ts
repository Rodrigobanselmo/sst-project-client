export type IUser = {
  readonly id: number;
  readonly email: string;
  readonly permissions: string[];
  readonly roles: string[];
  readonly companyId: string;
};
