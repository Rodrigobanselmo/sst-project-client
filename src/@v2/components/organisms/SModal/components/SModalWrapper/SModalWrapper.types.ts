import { ModalKeyEnum } from '@v2/hooks/useModal';

export interface SModalWrapperProps {
  onSubmit: () => void;
  children: React.ReactNode;
  minWidthDesk?: string | number;
  title: string;
  modalKey: ModalKeyEnum;
}
