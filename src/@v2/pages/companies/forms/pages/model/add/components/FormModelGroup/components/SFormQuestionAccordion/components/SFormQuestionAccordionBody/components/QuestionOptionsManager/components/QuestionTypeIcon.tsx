import CheckBoxOutlinedIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import ListOutlinedIcon from '@mui/icons-material/ListOutlined';
import { Box } from '@mui/material';
import { FormQuestionTypeEnum } from '@v2/models/form/enums/form-question-type.enum';

interface QuestionTypeIconProps {
  type?: FormQuestionTypeEnum;
}

export const QuestionTypeIcon = ({ type }: QuestionTypeIconProps) => {
  const renderIcon = () => {
    switch (type) {
      case FormQuestionTypeEnum.CHECKBOX:
        return (
          <CheckBoxOutlinedIcon
            sx={{
              fontSize: '18px',
              color: 'grey.400',
              marginRight: '5px',
            }}
          />
        );

      case FormQuestionTypeEnum.SELECT:
        return (
          <ListOutlinedIcon
            sx={{
              fontSize: '16px',
              color: 'grey.400',
              marginRight: '5px',
            }}
          />
        );

      default:
        return (
          <Box
            sx={{
              width: '15px',
              height: '15px',
              borderRadius: '50%',
              border: '1px solid',
              borderColor: 'grey.400',
              marginRight: '5px',
            }}
          />
        );
    }
  };

  return renderIcon();
};
