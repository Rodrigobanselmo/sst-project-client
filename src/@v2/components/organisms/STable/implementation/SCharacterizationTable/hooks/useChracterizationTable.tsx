// import { FC, useEffect, useMemo } from 'react';

// import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
// import { BoxProps } from '@mui/material';
// import SCharacterizationIcon from 'assets/icons/SCharacterizationIcon';
// import EditIcon from 'assets/icons/SEditIcon';
// import SOrderIcon from 'assets/icons/SOrderIcon';
// import SCheckBox from 'components/atoms/SCheckBox';
// import {
//   STable,
//   STableBody,
//   STableHeader,
//   STableHRow,
//   STableRow,
// } from 'components/atoms/STable';
// import IconButtonRow from 'components/atoms/STable/components/Rows/IconButtonRow';
// import TextIconRow from 'components/atoms/STable/components/Rows/TextIconRow';
// import STableSearch from 'components/atoms/STable/components/STableSearch';
// import STableTitle from 'components/atoms/STable/components/STableTitle';
// import { STagSelect } from 'components/molecules/STagSelect';
// import { initialCharacterizationState } from 'components/organisms/modals/ModalAddCharacterization/hooks/useEditCharacterization';
// import {
//   CharacterizationTypeEnum,
//   getIsEnvironment,
// } from 'project/enum/characterization-type.enum';

// import { CheckBox } from '@mui/icons-material';
// import STablePagination from 'components/atoms/STable/components/STablePagination';
// import { characterizationMap } from 'core/constants/maps/characterization.map';
// import { ModalEnum } from 'core/enums/modal.enums';
// import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
// import { useModal } from 'core/hooks/useModal';
// import { useTableSearch } from 'core/hooks/useTableSearch';
// import { ICharacterization } from 'core/interfaces/api/ICharacterization';
// import { useMutUpsertCharacterization } from 'core/services/hooks/mutations/manager/useMutUpsertCharacterization';
// import { useQueryCharacterizations } from 'core/services/hooks/queries/useQueryCharacterizations';
// import { dateToString } from 'core/utils/date/date-format';
// import { sortNumber } from 'core/utils/sorts/number.sort';
// import { sortString } from 'core/utils/sorts/string.sort';
// import { stringNormalize } from 'core/utils/strings/stringNormalize';

// export interface ICharacterizationTableTableProps extends BoxProps {
//   filterType?: CharacterizationTypeEnum;
//   onSelectData?: (notification: ICharacterization) => void;
//   selectedData?: ICharacterization[];
//   companyId?: string;
//   workspaceId?: string;
// }

// export const useChracterizationTable = ({
//   onSelectData,
//   selectedData,
//   companyId: _companyId,
//   workspaceId: _workspaceId,
// }) => {
//   const { onOpenModal } = useModal();
//   const { companyId: __companyId, workspaceId: __workspaceId } =
//     useGetCompanyId();

//   const companyId = _companyId || __companyId;
//   const workspaceId = _workspaceId || __workspaceId;

//   const { data, isLoading } = useQueryCharacterizations(1, {
//     companyId,
//     workspaceId,
//   });

//   const isSelect = !!onSelectData;
//   const upsertMutation = useMutUpsertCharacterization();

//   const handleEdit = (data: ICharacterization) => {
//     if (isSelect) {
//       onSelectData(data);
//     } else
//       onOpenModal(ModalEnum.CHARACTERIZATION_ADD, { ...data } as Partial<
//         typeof initialCharacterizationState
//       >);
//   };

//   const handleEditPosition = async (
//     { id, name, type }: ICharacterization,
//     order: number,
//   ) => {
//     await upsertMutation
//       .mutateAsync({ id, name, type, order, companyId, workspaceId })
//       .catch(() => {});
//   };

//   const handleEditDone = async ({
//     id,
//     name,
//     type,
//     done_at,
//   }: ICharacterization) => {
//     await upsertMutation
//       .mutateAsync({
//         id,
//         name,
//         type,
//         done_at: done_at ? '' : new Date(),
//         companyId,
//         workspaceId,
//       })
//       .catch(() => {});
//   };

//   const normalizedSearchValue = stringNormalize(search).toLowerCase();
//   const resultsFilter = results.filter((item) => {
//     const normalizedTitle = stringNormalize(item.name).toLowerCase();
//     return normalizedTitle.includes(normalizedSearchValue);
//   });

//   return {};
// };
