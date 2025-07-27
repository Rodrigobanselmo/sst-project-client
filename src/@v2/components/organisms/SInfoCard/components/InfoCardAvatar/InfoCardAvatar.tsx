import { SIconUser } from '@v2/assets/icons/SIconUser/SIconUser';
import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import palette from 'configs/theme/palette';
import { ReactNode } from 'react';

export const InfoCardAvatar = ({
  icon = <SIconUser />,
}: {
  icon?: ReactNode;
}) => {
  return (
    <SFlex
      center
      fontSize={22}
      sx={{
        border: '1px solid',
        borderColor: palette.grey[600],
        height: '36px',
        color: palette.grey[600],
        width: '36px',
        borderRadius: '100px',
      }}
    >
      {icon}
    </SFlex>
  );
};
