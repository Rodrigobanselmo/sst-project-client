export type IUser = {
  readonly userId: number;
  readonly email: string;
  readonly companies: {
    readonly permissions: string[];
    readonly roles: string[];
    readonly companyId: string;
  }[];
};
