export interface EditActionPlanInfoParams {
  companyId: string;
  workspaceId: string;

  coordinatorId?: number | null;
  validityStart?: Date;
  validityEnd?: Date | null;
  monthsLevel_2?: number;
  monthsLevel_3?: number;
  monthsLevel_4?: number;
  monthsLevel_5?: number;
}
