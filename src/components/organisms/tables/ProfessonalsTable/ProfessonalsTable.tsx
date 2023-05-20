import { FC, useState } from 'react';

import { BoxProps } from '@mui/material';
import SCheckBox from 'components/atoms/SCheckBox';
import {
  STable,
  STableBody,
  STableHeader,
  STableHRow,
  STableRow,
} from 'components/atoms/STable';
import IconButtonRow from 'components/atoms/STable/components/Rows/IconButtonRow';
import TextIconRow from 'components/atoms/STable/components/Rows/TextIconRow';
import STablePagination from 'components/atoms/STable/components/STablePagination';
import STableSearch from 'components/atoms/STable/components/STableSearch';
import STableTitle from 'components/atoms/STable/components/STableTitle';
import { SPageMenu } from 'components/molecules/SPageMenu';
import { initialProfessionalState } from 'components/organisms/modals/ModalAddProfessional/hooks/useEditProfessionals';
import { StatusSelect } from 'components/organisms/tagSelects/StatusSelect';
import { useRouter } from 'next/router';
import { ProfessionalTypeEnum } from 'project/enum/professional-type.enum';
import { StatusEnum } from 'project/enum/status.enum';

import { SCheckIcon } from 'assets/icons/SCheckIcon';
import { SCloseIcon } from 'assets/icons/SCloseIcon';
import EditIcon from 'assets/icons/SEditIcon';
import { SProfessionalIcon } from 'assets/icons/SProfessionalIcon';

import {
  professionalFiltersMap,
  ProfessionalFilterTypeEnum,
  professionalsFilterOptionsList,
} from 'core/constants/maps/professionals-filter.map';
import { professionalMap } from 'core/constants/maps/professionals.map';
import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { useTableSearchAsync } from 'core/hooks/useTableSearchAsync';
import { IProfessional } from 'core/interfaces/api/IProfessional';
import {
  IQueryProfessionals,
  useQueryProfessionals,
} from 'core/services/hooks/queries/useQueryProfessionals';
import { removeDuplicate } from 'core/utils/helpers/removeDuplicate';
import { cpfMask } from 'core/utils/masks/cpf.mask';

export const getCredential = (row: IProfessional) => {
  if (row?.councils)
    return row?.councils
      ?.map((c) => `${c?.councilUF ? c.councilUF + '-' : ''}${c.councilId}`)
      .join(' / ');

  return `${row?.councilUF ? row.councilUF + '-' : ''}${row.councilId}`;
};

export const getCouncil = (row: IProfessional) => {
  if (row?.councils)
    return removeDuplicate(row?.councils?.map((c) => c?.councilType)).join(
      ' / ',
    );

  return row.councilType;
};

export const getType = (row: IProfessional) => {
  return professionalMap[row.type]?.name || '-';
};

export const ProfessionalsTable: FC<
  { children?: any } & BoxProps & {
      rowsPerPage?: number;
      isClinic?: boolean;
      showResponsible?: boolean;
      loadingResponsible?: boolean;
      onSelectData?: (company: IProfessional) => void;
      onEditResponsible?: (row: IProfessional, selected: boolean) => void;
      selectedData?: IProfessional[];
      query?: IQueryProfessionals;
      filterInitial?: ProfessionalFilterTypeEnum;
      responsibleId?: number;
    }
> = ({
  rowsPerPage = 8,
  onSelectData,
  responsibleId,
  showResponsible,
  selectedData,
  filterInitial,
  isClinic,
  query: queryProfessionals,
  onEditResponsible,
  loadingResponsible,
  children,
}) => {
  const { handleSearchChange, search, page, setPage } = useTableSearchAsync();
  const { push, query, asPath } = useRouter();
  const [filter, setFilter] = useState<ProfessionalFilterTypeEnum | null>(
    filterInitial || null,
  );

  const isSelect = !!onSelectData;

  const pageData = () => {
    const type = filter || (query.filter?.[0] as ProfessionalFilterTypeEnum);
    let data = professionalFiltersMap[type];

    if (!data) {
      data = professionalFiltersMap[ProfessionalFilterTypeEnum.ALL];
    }
    return data;
  };

  const {
    data: professionals,
    isLoading: loadProfessionals,
    count,
  } = useQueryProfessionals(
    page,
    {
      search,
      type: pageData().filters,
      ...queryProfessionals,
      ...(isClinic
        ? {
            companies:
              typeof query.companyId === 'string'
                ? [query.companyId]
                : undefined,
          }
        : {}),
    },
    rowsPerPage,
  );

  const { onStackOpenModal } = useModal();

  const handleEditStatus = (status: StatusEnum) => {
    // TODO edit checklist status
  };

  const onAddProfessional = () => {
    onStackOpenModal(ModalEnum.PROFESSIONALS_ADD, {
      isClinic,
      companyId: query?.companyId || undefined,
      ...(isClinic && {
        type: ProfessionalTypeEnum.DOCTOR,
      }),
    } as typeof initialProfessionalState);
  };

  const onEditProfessional = (professional: IProfessional) => {
    onStackOpenModal(ModalEnum.PROFESSIONALS_ADD, {
      ...professional,
      ...(professional?.professionalId && { id: professional.professionalId }),
      isClinic,
    } as unknown as typeof initialProfessionalState);
  };

  const handleEditResponsible = (
    professional: IProfessional,
    selected: boolean,
  ) => {
    onEditResponsible?.(professional, selected);
  };

  const onChangeRoute = (type: string) => {
    const pathSplit = asPath.split('/');
    const values = Object.values(ProfessionalFilterTypeEnum);
    const hasFilter = !!query.filter?.[0];

    if (filterInitial) {
      return setFilter(type as unknown as ProfessionalFilterTypeEnum);
    }

    if (values.includes(type as unknown as ProfessionalFilterTypeEnum))
      push(
        `${pathSplit
          .splice(0, pathSplit.length - (hasFilter ? 1 : 0))
          .join('/')}/${type}`,
        undefined,
        { shallow: true },
      );
  };

  const onSelectRow = (professional: IProfessional) => {
    if (isSelect) {
      onSelectData(professional);
    } else onEditProfessional(professional);
  };

  const header: (BoxProps & { text: string; column: string })[] = [
    { text: 'Nome', column: 'minmax(200px, 5fr)' },
    { text: 'email', column: 'minmax(200px, 4fr)' },
    { text: 'CPF', column: 'minmax(120px, 2fr)' },
    { text: 'Conselho', column: '80px' },
    { text: 'Registro', column: 'minmax(110px, 150px)' },
    { text: 'Telefone', column: 'minmax(110px, 150px)' },
    { text: 'Profissional', column: 'minmax(110px, 150px)' },
    { text: 'Usuário', column: '100px', justifyContent: 'center' },
    { text: 'Status', column: '100px', justifyContent: 'center' },
    ...(showResponsible
      ? [{ text: 'Responsável', column: '80px', justifyContent: 'center' }]
      : []),
    { text: 'Editar', column: '80px', justifyContent: 'center' },
  ];

  if (selectedData) header.unshift({ text: '', column: '15px' });

  return (
    <>
      {!isSelect && (
        <STableTitle icon={SProfessionalIcon}>Profissionais</STableTitle>
      )}
      <STableSearch
        onAddClick={onAddProfessional}
        onChange={(e) => handleSearchChange(e.target.value)}
      />
      {children}
      {!isClinic && (
        <SPageMenu
          active={pageData().value}
          options={professionalsFilterOptionsList}
          onChange={onChangeRoute}
          mb={10}
        />
      )}
      <STable
        loading={loadProfessionals}
        rowsNumber={rowsPerPage}
        columns={header.map(({ column }) => column).join(' ')}
      >
        <STableHeader>
          {header.map(({ text, ...props }) => (
            <STableHRow key={text} {...props}>
              {text}
            </STableHRow>
          ))}
        </STableHeader>
        <STableBody<(typeof professionals)[0]>
          rowsData={professionals}
          hideLoadMore
          rowsInitialNumber={rowsPerPage}
          renderRow={(row) => {
            return (
              <STableRow
                onClick={() => onSelectRow(row)}
                clickable
                key={row.id}
              >
                {selectedData && (
                  <SCheckBox
                    label=""
                    checked={
                      !!selectedData.find(
                        (professional) => professional.id === row.id,
                      )
                    }
                  />
                )}
                <TextIconRow clickable text={row.name || '-'} />
                <TextIconRow clickable text={row.email || '-'} />
                <TextIconRow clickable text={cpfMask.mask(row.cpf) || '-'} />
                <TextIconRow clickable text={getCouncil(row) || '-'} />
                <TextIconRow clickable text={getCredential(row) || '-'} />
                <TextIconRow clickable text={row.phone || '-'} />
                <TextIconRow clickable text={getType(row) || '-'} />
                <StatusSelect
                  large={false}
                  sx={{ maxWidth: '90px' }}
                  selected={
                    'userId' in row
                      ? row.userId
                        ? StatusEnum.ACTIVE
                        : StatusEnum.PENDING
                      : StatusEnum.ACTIVE
                  }
                  statusOptions={[StatusEnum.ACTIVE, StatusEnum.PENDING]}
                  handleSelectMenu={(option) => handleEditStatus(option.value)}
                  disabled
                />
                <StatusSelect
                  large={false}
                  sx={{ maxWidth: '90px' }}
                  selected={'status' in row ? row.status : StatusEnum.ACTIVE}
                  statusOptions={[StatusEnum.ACTIVE, StatusEnum.INACTIVE]}
                  handleSelectMenu={(option) => handleEditStatus(option.value)}
                  disabled
                />
                {showResponsible && (
                  <IconButtonRow
                    loading={loadingResponsible}
                    icon={
                      responsibleId && row.id == responsibleId ? (
                        <SCheckIcon sx={{ color: 'success.main' }} />
                      ) : (
                        <SCloseIcon sx={{ fontSize: 18 }} />
                      )
                    }
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditResponsible(
                        row,
                        !(responsibleId && row.id == responsibleId),
                      );
                    }}
                  />
                )}
                <IconButtonRow
                  icon={<EditIcon />}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditProfessional(row);
                  }}
                />
              </STableRow>
            );
          }}
        />
      </STable>{' '}
      <STablePagination
        mt={2}
        registersPerPage={rowsPerPage}
        totalCountOfRegisters={loadProfessionals ? undefined : count}
        currentPage={page}
        onPageChange={setPage}
      />
    </>
  );
};
