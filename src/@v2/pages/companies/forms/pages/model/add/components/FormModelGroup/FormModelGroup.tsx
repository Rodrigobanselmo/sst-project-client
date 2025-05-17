import { Box } from '@mui/material';
import { SAccordionBody } from '@v2/components/organisms/SAccordion/components/SAccordionBody/SAccordionBody';
import { SAccordionList } from '@v2/components/organisms/SAccordion/components/SAccordionList/SAccordionList';
import { SAccordion } from '@v2/components/organisms/SAccordion/SAccordion';

export const FormModelGroup = ({ companyId }: { companyId: string }) => {
  return (
    <Box>
      <SAccordionList
        options={[1, 2, 3, 4, 5]}
        renderItem={(value) => {
          const title = 'Medicamento ' + value;

          return (
            <>
              <SAccordion
                expanded={value == 2}
                onChange={(e) => console.log(e)}
                title={title}
              >
                <SAccordionBody>
                  <Box mt={2}>ok</Box>
                  <Box mt={2}>ok</Box>
                </SAccordionBody>
              </SAccordion>
              <Box mt={2}>ok</Box>
            </>
          );
        }}
      />
    </Box>
  );
};
