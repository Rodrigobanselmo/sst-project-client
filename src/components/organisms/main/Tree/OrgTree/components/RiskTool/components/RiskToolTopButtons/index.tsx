/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { FC } from 'react';

import { Icon } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import SIconButton from 'components/atoms/SIconButton';
import { STag } from 'components/atoms/STag';
import { STagButton } from 'components/atoms/STagButton';
import SText from 'components/atoms/SText';
import STooltip from 'components/atoms/STooltip';
import { ViewsDataSelect } from 'components/organisms/tagSelects/ViewsDataSelect';
import { ViewsRiskSelect } from 'components/organisms/tagSelects/ViewsRiskSelect';
import { useRouter } from 'next/router';
import { setGhoOpen } from 'store/reducers/hierarchy/ghoSlice';
import {
  selectRisk,
  selectRisks,
  setRiskAddToggleExpand,
} from 'store/reducers/hierarchy/riskAddSlice';

import SArrowBack from 'assets/icons/SArrowBack';
import SCloseIcon from 'assets/icons/SCloseIcon';
import SExpandIcon from 'assets/icons/SExpandIcon';
import SUploadIcon from 'assets/icons/SUploadIcon';

import { ModalEnum } from 'core/enums/modal.enums';
import { RoutesEnum } from 'core/enums/routes.enums';
import { useAppDispatch } from 'core/hooks/useAppDispatch';
import { useAppSelector } from 'core/hooks/useAppSelector';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { useModal } from 'core/hooks/useModal';
import { IRiskFactors } from 'core/interfaces/api/IRiskFactors';

import { IViewsDataOption } from '../../utils/view-data-type.constant';
import {
  IViewsRiskOption,
  ViewTypeEnum,
} from '../../utils/view-risk-type.constant';
import { RiskToolTopButtonsSelectRisk } from './SelectRisk';
import { SideTopProps } from './types';

export const RiskToolTopButtons: FC<SideTopProps> = ({
  riskInit,
  handleSelectGHO,
  onChangeView,
  viewType,
  viewDataType,
  onChangeViewData,
}) => {
  const dispatch = useAppDispatch();
  const { asPath, push, query } = useRouter();
  const { onOpenModal } = useModal();
  const { companyId } = useGetCompanyId();
  const selectedRisks = useAppSelector(selectRisks);
  const selectedRiskStore = useAppSelector(selectRisk);

  const isViewTypeSelect = viewType == ViewTypeEnum.MULTIPLE;
  const documentId = query.riskGroupId as string | undefined;

  const selectedRisk: IRiskFactors | null = isViewTypeSelect
    ? selectedRisks[0]
    : selectedRiskStore;

  const handleCloseRisk = () => {
    push({ pathname: asPath.split('?')[0] }, undefined, { shallow: true });
    dispatch(setGhoOpen(false));
    handleSelectGHO(null, []);
  };

  const handleGoBackDocument = () => {
    if (companyId && documentId)
      push({
        pathname: RoutesEnum.COMPANY_PGR_DOCUMENT.replace(
          ':companyId',
          companyId,
        ).replace(':docId', documentId),
      });
    dispatch(setGhoOpen(false));
    handleSelectGHO(null, []);
  };

  const severity = selectedRisks.length > 1 ? '-' : selectedRisk?.severity;

  return (
    <SFlex align="center" gap="1" mb={2}>
      {companyId && documentId && (
        <STooltip withWrapper title="Voltar para documento PGR">
          <SIconButton onClick={handleGoBackDocument} size="small">
            <Icon component={SArrowBack} sx={{ fontSize: '1.2rem' }} />
          </SIconButton>
        </STooltip>
      )}
      <SIconButton onClick={handleCloseRisk} size="small">
        <Icon component={SCloseIcon} sx={{ fontSize: '1.2rem' }} />
      </SIconButton>
      <SText fontSize="0.9rem" color="GrayText">
        Grupo similar de exposição
      </SText>

      {riskInit && (
        <SFlex center sx={{ ml: 'auto' }}>
          <SText fontSize={15} color="text.light" mr={2}>
            Severidade
          </SText>
          <STag
            sx={{ px: 4, mr: 15, fontWeight: 'bold' }}
            text={severity ? String(severity) : '0'}
            action={String(severity) as any}
          />
          <ViewsRiskSelect
            viewType={viewType}
            handleSelectMenu={(option: IViewsRiskOption) =>
              onChangeView && onChangeView(option)
            }
          />
          <ViewsDataSelect
            viewDataType={viewDataType}
            handleSelectMenu={(option: IViewsDataOption) =>
              onChangeViewData && onChangeViewData(option)
            }
          />

          <STooltip title="Adicionar GSE e Cargos por planilha excel">
            <STagButton
              large
              icon={SUploadIcon}
              onClick={() =>
                onOpenModal(ModalEnum.HIERARCHIES_EXCEL_ADD, companyId)
              }
            />
          </STooltip>

          <RiskToolTopButtonsSelectRisk viewType={viewType} />

          <SIconButton
            onClick={() => {
              dispatch(setRiskAddToggleExpand());
            }}
            size="small"
          >
            <Icon component={SExpandIcon} sx={{ fontSize: '1.2rem' }} />
          </SIconButton>
        </SFlex>
      )}
    </SFlex>
  );
};
