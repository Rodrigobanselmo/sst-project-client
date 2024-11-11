/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { FC } from 'react';

import { Divider, Icon } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import SIconButton from 'components/atoms/SIconButton';
import { STag } from 'components/atoms/STag';
import { STagButton } from 'components/atoms/STagButton';
import SText from 'components/atoms/SText';
import STooltip from 'components/atoms/STooltip';
import { SRadio } from 'components/molecules/form/radio';
import { SPageMenu } from 'components/molecules/SPageMenu';
import { ViewsDataSelect } from 'components/organisms/tagSelects/ViewsDataSelect';
import { ViewsRiskSelect } from 'components/organisms/tagSelects/ViewsRiskSelect';
import { useRouter } from 'next/router';
import { setGhoOpen } from 'store/reducers/hierarchy/ghoSlice';
import {
  selectRisk,
  selectRisks,
  setRiskAddToggleExpand,
} from 'store/reducers/hierarchy/riskAddSlice';

import SArrowBack from 'assets/icons/SArrowBackIcon';
import SCloseIcon from 'assets/icons/SCloseIcon';
import SExpandIcon from 'assets/icons/SExpandIcon';
import SUploadIcon from 'assets/icons/SUploadIcon';

import { ModalEnum } from 'core/enums/modal.enums';
import { RoutesEnum } from 'core/enums/routes.enums';
import { ViewsRiskEnum } from 'core/enums/views-risk.enum';
import { useAppDispatch } from 'core/hooks/useAppDispatch';
import { useAppSelector } from 'core/hooks/useAppSelector';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { useModal } from 'core/hooks/useModal';
import { IRiskFactors } from 'core/interfaces/api/IRiskFactors';

import {
  IViewsDataOption,
  ViewsDataEnum,
  viewsDataOptionsConstant,
} from '../../utils/view-data-type.constant';
import {
  IViewsRiskOption,
  viewsRiskOptionsConstant,
  ViewTypeEnum,
} from '../../utils/view-risk-type.constant';
import { RiskToolTopButtonsSelectRisk } from './SelectRisk';
import { SideTopProps } from './types';

export const RiskToolTopButtons: FC<{ children?: any } & SideTopProps> = ({
  riskInit,
  handleSelectGHO,
  onChangeView,
  viewType,
  viewDataType,
  onChangeViewData,
  riskGroupId,
}) => {
  const dispatch = useAppDispatch();
  const { asPath, push } = useRouter();
  const { onOpenModal, onCloseModal } = useModal();
  const { companyId } = useGetCompanyId();
  const selectedRisks = useAppSelector(selectRisks);
  const selectedRiskStore = useAppSelector(selectRisk);

  const isViewTypeSelect = viewType == ViewTypeEnum.MULTIPLE;
  const documentId = riskGroupId as string | undefined;

  const selectedRisk: IRiskFactors | null = isViewTypeSelect
    ? selectedRisks[0]
    : selectedRiskStore;

  const handleCloseRisk = () => {
    if (asPath?.split('?')?.[1]?.includes?.('riskGroupId')) {
      const url = new URL(window.location.href);
      url.searchParams.delete('riskGroupId');
      push(url.pathname + url.search, undefined, { shallow: true });
    }
    dispatch(setGhoOpen(false));
    handleSelectGHO(null, []);
    onCloseModal(ModalEnum.RISK_TOOL);
  };

  const handleGoBackDocument = () => {
    if (companyId && documentId)
      push({
        pathname: RoutesEnum.PGR_DOCUMENT.replace(
          ':companyId',
          companyId,
        ).replace(':riskGroupId', documentId),
      });
    dispatch(setGhoOpen(false));
    handleSelectGHO(null, []);
    onCloseModal(ModalEnum.RISK_TOOL);
  };

  const severity = selectedRisks.length > 1 ? '-' : selectedRisk?.severity;
  const isOnHierarchyPage =
    companyId &&
    asPath.includes(RoutesEnum.HIERARCHY.replace(':companyId', companyId));

  return (
    <SFlex direction="column">
      <SFlex align="center" gap="1" mb={2}>
        {companyId && documentId && isOnHierarchyPage && (
          <STooltip withWrapper title="Voltar para documento PGR">
            <SIconButton onClick={handleGoBackDocument} size="small">
              <Icon component={SArrowBack} sx={{ fontSize: '1.2rem' }} />
            </SIconButton>
          </STooltip>
        )}
        <SIconButton onClick={handleCloseRisk} size="small">
          <Icon component={SCloseIcon} sx={{ fontSize: '1.2rem' }} />
        </SIconButton>

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

            {/*<STooltip title="Adicionar GSE e Cargos por planilha excel">
              <STagButton
                large
                icon={SUploadIcon}
                onClick={() =>
                  onOpenModal(ModalEnum.HIERARCHIES_EXCEL_ADD, companyId)
                }
              />
            </STooltip> */}
            {/* <ViewsRiskSelect
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
            /> */}

            <SFlex align="center" mr={10}>
              <SText fontSize={15} color="text.light" mr={5}>
                Visualização:
              </SText>
              <SPageMenu
                active={viewType}
                options={[
                  ViewsRiskEnum.SIMPLE_BY_GROUP,
                  ViewsRiskEnum.SIMPLE_BY_RISK,
                  ViewsRiskEnum.MULTIPLE,
                ].map((key) => ({
                  ...viewsRiskOptionsConstant[key],
                  label: viewsRiskOptionsConstant[key].short,
                }))}
                onChange={(option) =>
                  onChangeView &&
                  viewsRiskOptionsConstant[
                    option as unknown as ViewsRiskEnum
                  ] &&
                  onChangeView(
                    viewsRiskOptionsConstant[
                      option as unknown as ViewsRiskEnum
                    ],
                  )
                }
              />
            </SFlex>

            <RiskToolTopButtonsSelectRisk
              riskGroupId={riskGroupId}
              viewType={viewType}
            />

            {/* <SIconButton
            onClick={() => {
              dispatch(setRiskAddToggleExpand());
            }}
            size="small"
          >
            <Icon component={SExpandIcon} sx={{ fontSize: '1.2rem' }} />
          </SIconButton> */}
            <SIconButton onClick={handleCloseRisk} size="small">
              <Icon component={SCloseIcon} sx={{ fontSize: '1.2rem' }} />
            </SIconButton>
          </SFlex>
        )}
      </SFlex>
      {/* <Divider sx={{ mb: 5, mt: 3 }} /> */}
      <SFlex align="center">
        <SText ml={4} fontSize={15} color="text.light" mr={5}>
          Adicionar Risco por:
        </SText>
        <SPageMenu
          active={viewDataType}
          options={[
            ViewsDataEnum.GSE,
            ViewsDataEnum.HIERARCHY,
            ViewsDataEnum.ENVIRONMENT,
            ViewsDataEnum.CHARACTERIZATION,
            ViewsDataEnum.EMPLOYEE,
          ].map((key) => ({
            ...viewsDataOptionsConstant[key],
            label: viewsDataOptionsConstant[key].short,
          }))}
          onChange={(option) =>
            onChangeViewData &&
            viewsDataOptionsConstant[option as unknown as ViewsDataEnum] &&
            onChangeViewData(
              viewsDataOptionsConstant[option as unknown as ViewsDataEnum],
            )
          }
        />
      </SFlex>
      <Divider sx={{ mb: 0, mt: 5 }} />
    </SFlex>
  );
};
// {/* <SRadio
//   value={viewDataType}
//   valueField="value"
//   row
//   formControlProps={{
//     sx: {
//       '& .MuiSvgIcon-root': {
//         fontSize: 18,
//       },
//     },
//   }}
//   labelField="short"
//   onChange={(option) =>
//     onChangeViewData &&
//     viewsDataOptionsConstant[
//       (option.target as any).value as ViewsDataEnum
//     ] &&
//     onChangeViewData(
//       viewsDataOptionsConstant[
//         (option.target as any).value as ViewsDataEnum
//       ],
//     )
//   }
//   options={[
//     ViewsDataEnum.GSE,
//     ViewsDataEnum.HIERARCHY,
//     ViewsDataEnum.ENVIRONMENT,
//     ViewsDataEnum.CHARACTERIZATION,
//     ViewsDataEnum.EMPLOYEE,
//   ].map((key) => ({
//     ...viewsDataOptionsConstant[key],
//   }))}
// /> */}
