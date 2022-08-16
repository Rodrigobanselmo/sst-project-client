import {
  headerRowColumnsMap,
  RowColumnsTypeEnum,
} from '../utils/header.constants';

export const useRowColumns = () => {
  const columns = [
    headerRowColumnsMap[RowColumnsTypeEnum.GS],
    headerRowColumnsMap[RowColumnsTypeEnum.EPI],
    headerRowColumnsMap[RowColumnsTypeEnum.EPC],
    headerRowColumnsMap[RowColumnsTypeEnum.MED],
    headerRowColumnsMap[RowColumnsTypeEnum.PROB],
    headerRowColumnsMap[RowColumnsTypeEnum.RO],
    // headerRowColumnsMap[RowColumnsTypeEnum.EXAM],
    headerRowColumnsMap[RowColumnsTypeEnum.REC],
    headerRowColumnsMap[RowColumnsTypeEnum.PROB_AFTER],
    headerRowColumnsMap[RowColumnsTypeEnum.RO_AFTER],
  ];

  return { columns };
};
