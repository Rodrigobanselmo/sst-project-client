/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { SDatePicker } from 'components/atoms/SDatePicker/SDatePicker';
import SFlex from 'components/atoms/SFlex';

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';

import { initialBlankState } from '../../ModalBlank/ModalBlank';

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
