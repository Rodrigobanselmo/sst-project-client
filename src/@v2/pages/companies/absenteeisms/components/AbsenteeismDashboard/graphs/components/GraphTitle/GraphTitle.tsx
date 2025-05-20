import { SText } from '@v2/components/atoms/SText/SText';
import { STextProps } from '@v2/components/atoms/SText/SText.types';

export const GraphTitle = ({
  title,
  textProps,
}: {
  title: string;
  textProps?: STextProps;
}) => {
  return (
    <SText {...textProps} fontSize={17} fontWeight="bold">
      {title}
    </SText>
  );
};
