export interface EditManyCommentsParams {
  companyId: string;
  ids: string[];
  isApproved: boolean;
  approvedComment?: string | null;
}
