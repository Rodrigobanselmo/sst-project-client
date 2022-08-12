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
import { cpfMask } from 'core/utils/masks/cpf.mask';

export const getCredential = (row: IProfessional) => {
  if (row?.crm && row?.crea) {
    return `${row.crm} / ${row.crea}`;
  }

  if (row?.crm && !row?.crea) {
    return row.crm;
  }

  if (row?.crea && !row?.crm) {
    return row.crea;
  }

  if (row?.councilId) {
    return `${row?.councilUF ? row.councilUF + '-' : ''}${row.councilId}`;
  }

  return '-';
};

export const getCouncil = (row: IProfessional) => {
  if (row?.crm && row?.crea) {
    if (row?.type == ProfessionalTypeEnum.ENGINEER) return 'CREA';
    return 'CRM';
  }

  if (row?.crm) {
    return 'CRM';
  }

  if (row?.crea) {
    return 'CREA';
  }

  if (row?.councilType) {
    return row.councilType || '-';
  }

  return '-';
};

export const getType = (row: IProfessional) => {
  // if (row.crm && row.crea) {
  //   return 'CRM / CREA';
  // }

  // if (row.crm && !row.crea) {
  //   return `${professionalMap[ProfessionalTypeEnum.DOCTOR]?.name}`;
  // }

  // if (row.crea && !row.crm) {
  //   return `${professionalMap[ProfessionalTypeEnum.ENGINEER]?.name}`;
  // }

  return professionalMap[row.type]?.name || '-';
};

export const ProfessionalsTable: FC<
  BoxProps & {
    rowsPerPage?: number;
    isClinic?: boolean;
    onSelectData?: (company: IProfessional) => void;
    selectedData?: IProfessional[];
    query?: IQueryProfessionals;
    filterInitial?: ProfessionalFilterTypeEnum;
  }
> = ({
  rowsPerPage = 8,
  onSelectData,
  selectedData,
  filterInitial,
  isClinic,
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
    console.log(status); // TODO edit checklist status
  };

  const onAddProfessional = () => {
    onStackOpenModal(ModalEnum.PROFESSIONALS_ADD, {
      isClinic,
      companyId: query?.companyId || undefined,
    } as typeof initialProfessionalState);
  };

  const onEditProfessional = (professional: IProfessional) => {
    onStackOpenModal(ModalEnum.PROFESSIONALS_ADD, {
      certifications: professional.certifications,
      cpf: professional.cpf,
      email: professional.email,
      id: professional.id,
      name: professional.name,
      phone: professional.phone,
      councilUF: professional.councilUF,
      councilId: professional.councilId,
      councilType: professional.councilType,
      crea: professional.crea,
      crm: professional.crm,
      type: professional.type,
      status: professional.status,
      formation: professional.formation,
      companyId: professional.companyId,
      isClinic,
    } as typeof initialProfessionalState);
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

  return (
    <>
      {!isSelect && (
        <STableTitle icon={SProfessionalIcon}>Profissionais</STableTitle>
      )}
      <STableSearch
        onAddClick={onAddProfessional}
        onChange={(e) => handleSearchChange(e.target.value)}
      />
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
        columns={`${
          selectedData ? '15px ' : ''
        }minmax(200px, 5fr) minmax(200px, 4fr) minmax(120px, 2fr) 80px minmax(110px, 150px) minmax(110px, 150px) minmax(110px, 150px) 90px 80px`}
      >
        <STableHeader>
          {selectedData && <STableHRow></STableHRow>}
          <STableHRow>Nome</STableHRow>
          <STableHRow>email</STableHRow>
          <STableHRow>CPF</STableHRow>
          <STableHRow>Conselho</STableHRow>
          <STableHRow>Registro</STableHRow>
          <STableHRow>Telefone</STableHRow>
          <STableHRow>Profissional</STableHRow>
          <STableHRow justifyContent="center">Status</STableHRow>
          <STableHRow justifyContent="center">Editar</STableHRow>
        </STableHeader>
        <STableBody<typeof professionals[0]>
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
                  selected={'status' in row ? row.status : StatusEnum.ACTIVE}
                  statusOptions={[StatusEnum.ACTIVE, StatusEnum.INACTIVE]}
                  handleSelectMenu={(option) => handleEditStatus(option.value)}
                  disabled
                />
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
