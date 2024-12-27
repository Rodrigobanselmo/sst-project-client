export interface EditManyCommentsParams {
  companyId: string;
  ids: string[];
  isApproved: boolean | null;
  approvedComment?: string | null;
}
