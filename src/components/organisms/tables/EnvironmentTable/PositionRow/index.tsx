// import { FC, useEffect } from 'react';

// import { BoxProps } from '@mui/material';
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
// import { ModalAddEnvironment } from 'components/organisms/modals/ModalAddEnvironment';
// import { ModalAddEpi } from 'components/organisms/modals/ModalAddEpi';
// import { ModalAddGenerateSource } from 'components/organisms/modals/ModalAddGenerateSource';
// import { ModalAddGho } from 'components/organisms/modals/ModalAddGHO';
// import { ModalAddProbability } from 'components/organisms/modals/ModalAddProbability';
// import { ModalAddQuantity } from 'components/organisms/modals/ModalAddQuantity';
// import { ModalAddRecMed } from 'components/organisms/modals/ModalAddRecMed';
// import { ModalAddRisk } from 'components/organisms/modals/ModalAddRisk';
// import { ModalAddWorkspace } from 'components/organisms/modals/ModalAddWorkspace';
// import { ModalExcelHierarchies } from 'components/organisms/modals/ModalExcelHierarchies';
// import { ModalSelectDocPgr } from 'components/organisms/modals/ModalSelectDocPgr';
// import { ModalSelectHierarchy } from 'components/organisms/modals/ModalSelectHierarchy';
// import { ModalSingleInput } from 'components/organisms/modals/ModalSingleInput';
// import dayjs from 'dayjs';
// import { StatusEnum } from 'project/enum/status.enum';

// import EditIcon from 'assets/icons/SEditIcon';
// import SEnvironmentIcon from 'assets/icons/SEnvironmentIcon';

// import { environmentMap } from 'core/constants/maps/environment.map';
// import { ModalEnum } from 'core/enums/modal.enums';
// import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
// import { useHierarchyTreeActions } from 'core/hooks/useHierarchyTreeActions';
// import { useModal } from 'core/hooks/useModal';
// import { useTableSearch } from 'core/hooks/useTableSearch';
// import { IEnvironment } from 'core/interfaces/api/IEnvironment';
// import { useQueryCompany } from 'core/services/hooks/queries/useQueryCompany';
// import { useQueryEnvironments } from 'core/services/hooks/queries/useQueryEnvironments';
// import { useQueryHierarchies } from 'core/services/hooks/queries/useQueryHierarchies';
// import { sortData } from 'core/utils/sorts/data.sort';

// export const PositionRow: FC<BoxProps> = () => {
//   const { data, isLoading } = useQueryEnvironments();
//   const { onOpenModal } = useModal();
//   const { companyId, workspaceId } = useGetCompanyId();

//   const { data: company } = useQueryCompany();
//   const { data: hierarchies } = useQueryHierarchies();
//   const { setTree, transformToTreeMap } = useHierarchyTreeActions();

//   useEffect(() => {
//     if (hierarchies && company)
//       setTree(transformToTreeMap(hierarchies, company));
//   }, [setTree, company, transformToTreeMap, hierarchies]);

//   const { handleSearchChange, results } = useTableSearch({
//     data,
//     keys: ['name'],
//     sort: (a, b) => sortData(a, b, 'created_at'),
//   });

//   const handleEditStatus = (status: StatusEnum) => {
//     console.log(status); // TODO edit checklist status
//   };

//   const handleEdit = (data: IEnvironment) => {
//     onOpenModal(ModalEnum.ENVIRONMENT_ADD, { ...data });
//   };

//   const getParentName = (id?: string) => {
//     if (!id) return '--';

//     const parent = data.find((item) => item.id === id);
//     if (!parent) return '--';

//     return parent.name || '--';
//   };

//   return (
//      <STagSelect
//           options={environmentsQuery.map((_, index) => ({
//             name: `posição ${index + 1}`,
//             value: index + 1,
//           }))}
//           tooltipTitle={
//             'escolha a posição que o ambiente deve aparecer no documento'
//           }
//           text={`Posição ${
//             !environmentData?.order ? '' : environmentData?.order
//           }`}
//           large
//           maxWidth={120}
//           mb={10}
//           handleSelectMenu={(option) =>
//             setEnvironmentData((old) => ({
//               ...old,
//               order: option.value,
//             }))
//           }
//           icon={SOrderIcon}
//         />
//   );
// };
