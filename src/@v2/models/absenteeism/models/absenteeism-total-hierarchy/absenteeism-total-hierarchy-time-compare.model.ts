import { string } from 'yup';
import {
  AbsenteeismTotalHierarchyTimeCompareResultModel,
  IAbsenteeismTotalHierarchyTimeCompareResultModel,
} from './absenteeism-total-hierarchy-time-compare-result.model';
import { AbsenteeismHierarchyTotalOrderByEnum } from '@v2/services/absenteeism/dashboard/browse-absenteeism-hierarchy/service/browse-absenteeism-hierarchy.service';

export type IAbsenteeismTotalHierarchyTimeCompareModel = {
  results: IAbsenteeismTotalHierarchyTimeCompareResultModel[][];
};

export class AbsenteeismTotalHierarchyTimeCompareModel {
  results: AbsenteeismTotalHierarchyTimeCompareResultModel[][];

  constructor(params: IAbsenteeismTotalHierarchyTimeCompareModel) {
    this.results = params.results.map((group) =>
      group.map(
        (item) => new AbsenteeismTotalHierarchyTimeCompareResultModel(item),
      ),
    );
  }

  graphData(type: AbsenteeismHierarchyTotalOrderByEnum) {
    const keys = {} as Record<string, string>;
    const data = {} as Record<string, any>;

    this.results.forEach((group) => {
      group.forEach((item) => {
        keys[item.name] = item.name;

        if (!data[item.rangeString])
          data[item.rangeString] = { date: item.rangeString };

        const value =
          type === AbsenteeismHierarchyTotalOrderByEnum.TOTAL
            ? item.total
            : type === AbsenteeismHierarchyTotalOrderByEnum.TOTAL_DAYS
              ? item.totalDays
              : (item.averageDays * 100).toFixed(0);

        data[item.rangeString] = {
          ...data[item.rangeString],
          [item.name]: value,
        };
      });
    });

    return {
      keys: Object.values(keys),
      results: Object.values(data).reverse(),
    };
  }
}
