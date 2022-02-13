export type IUser = {
  readonly id: number;
  readonly email: string;
  readonly yourCompany: string;
  readonly actualCompany: string;
  readonly companies: {
    readonly permissions: string[];
    readonly roles: string[];
    readonly companyId: string;
  }[];
};
