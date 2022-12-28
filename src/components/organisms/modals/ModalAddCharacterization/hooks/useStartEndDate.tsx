/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

import { yupResolver } from '@hookform/resolvers/yup/dist/yup';
import { Box } from '@mui/material';
import { SDatePicker } from 'components/atoms/SDatePicker/SDatePicker';
import SFlex from 'components/atoms/SFlex';
import { useOpenRiskTool } from 'components/organisms/main/Tree/OrgTree/components/RiskTool/hooks/useOpenRiskTool';
import { ITreeMapObject } from 'components/organisms/main/Tree/OrgTree/interfaces';
import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';
import { CharacterizationTypeEnum } from 'project/enum/characterization-type.enum';
import { ParagraphEnum } from 'project/enum/paragraph.enum';

import { IdsEnum } from 'core/enums/ids.enums';
import { ModalEnum } from 'core/enums/modal.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useAppDispatch } from 'core/hooks/useAppDispatch';
import { useModal } from 'core/hooks/useModal';
import { usePreventAction } from 'core/hooks/usePreventAction';
import { useRegisterModal } from 'core/hooks/useRegisterModal';
import { ICharacterization } from 'core/interfaces/api/ICharacterization';
import { ICompany, IWorkspace } from 'core/interfaces/api/ICompany';
import { IHierarchy, IHierarchyChildren } from 'core/interfaces/api/IHierarchy';
import { IRiskGroupData } from 'core/interfaces/api/IRiskData';
import { useMutAddCharacterizationPhoto } from 'core/services/hooks/mutations/manager/useMutAddCharacterizationPhoto';
import { useMutCopyCharacterization } from 'core/services/hooks/mutations/manager/useMutCopyCharacterization';
import { useMutDeleteCharacterization } from 'core/services/hooks/mutations/manager/useMutDeleteCharacterization';
import { useMutDeleteCharacterizationPhoto } from 'core/services/hooks/mutations/manager/useMutDeleteCharacterizationPhoto';
import {
  IUpdateCharacterizationPhoto,
  useMutUpdateCharacterizationPhoto,
} from 'core/services/hooks/mutations/manager/useMutUpdateCharacterizationPhoto';
import {
  IAddCharacterizationPhoto,
  IUpsertCharacterization,
  useMutUpsertCharacterization,
} from 'core/services/hooks/mutations/manager/useMutUpsertCharacterization';
import { useQueryCharacterization } from 'core/services/hooks/queries/useQueryCharacterization';
import { useQueryCharacterizations } from 'core/services/hooks/queries/useQueryCharacterizations';
import { useQueryGHOAll } from 'core/services/hooks/queries/useQueryGHOAll';
import { queryClient } from 'core/services/queryClient';
import { cleanObjectValues } from 'core/utils/helpers/cleanObjectValues';
import { removeDuplicate } from 'core/utils/helpers/removeDuplicate';
import { characterizationSchema } from 'core/utils/schemas/characterization.schema';
import { sortDate } from 'core/utils/sorts/data.sort';

import { ViewsDataEnum } from '../../../main/Tree/OrgTree/components/RiskTool/utils/view-data-type.constant';
import { initialBlankState } from '../../ModalBlank/ModalBlank';
import { initialCharacterizationSelectState } from '../../ModalSelectCharacterization';
import { initialCompanySelectState } from '../../ModalSelectCompany';
import { initialDocPgrSelectState } from '../../ModalSelectDocPgr';
import { initialHierarchySelectState } from '../../ModalSelectHierarchy';
import { initialWorkspaceSelectState } from '../../ModalSelectWorkspace';
import { initialInputModalState } from '../../ModalSingleInput';
import { initialPhotoState } from '../../ModalUploadPhoto';

interface IOptions {
  startDate?: Date | null;
  endDate?: Date | null;
}

export const useStartEndDate = () => {
  const { onStackOpenModal } = useModal();

  const selectStartEndDate = (cb: (d: any) => void, options?: IOptions) => {
    const content = (setData: any, data: any) => (
      <SFlex direction="row" gap={10} mb={150}>
        <SDatePicker
          inputProps={{
            labelPosition: 'top',
            ...((data?.errorMessage || data?.error) && {
              error: true,
              helperText: data?.errorMessage,
            }),
          }}
          placeholderText="__/__/__"
          selected={data.startDate}
          label={'Data de início'}
          onChange={(date) => {
            setData((d: any) => ({ ...d, startDate: date }));
          }}
        />
        <SDatePicker
          inputProps={{
            labelPosition: 'top',
            ...((data?.errorMessage || data?.error) && {
              error: true,
              helperText: data?.errorMessage,
            }),
          }}
          placeholderText="__/__/__"
          selected={data.endDate}
          label={'Data fim'}
          onChange={(date) => {
            setData((d: any) => ({ ...d, endDate: date }));
          }}
        />
      </SFlex>
    );

    const onSelect = (d: any) => {
      if (d.startDate && d.endDate && d.startDate > d.endDate) {
        setTimeout(() => {
          onStackOpenModal(ModalEnum.MODAL_BLANK, {
            onSelect,
            content,
            errorMessage: 'Data de fim antes da data de início',
            endDate: d?.endDate,
            startDate: d?.startDate,
          } as Partial<typeof initialBlankState>);
        }, 100);
        return;
      }
      // if ((!d.startDate && !d.endDate) || d.startDate > d.endDate) {
      //   setTimeout(() => {
      //     onStackOpenModal(ModalEnum.MODAL_BLANK, {
      //       onSelect,
      //       content,
      //       error: true,
      //     } as Partial<typeof initialBlankState>);
      //   }, 100);
      //   return;
      // }
      cb(d);
    };

    onStackOpenModal(ModalEnum.MODAL_BLANK, {
      onSelect,
      content,
      endDate: options?.endDate,
      startDate: options?.startDate,
      title: 'Selecionar data',
    } as Partial<typeof initialBlankState>);
  };

  return { selectStartEndDate };
};

export type IUseStartEndDate = ReturnType<typeof useStartEndDate>;
