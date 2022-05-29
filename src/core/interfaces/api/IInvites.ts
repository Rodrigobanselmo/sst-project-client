export type IInvites = {
  id: string;
  expires_date: Date;
  companyId: string;
  email: string;
  roles: string[];
  permissions: string[];
};
