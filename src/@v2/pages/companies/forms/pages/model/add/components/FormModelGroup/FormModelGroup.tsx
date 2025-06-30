import { Box } from '@mui/material';
import { SAccordionBody } from '@v2/components/organisms/SAccordion/components/SAccordionBody/SAccordionBody';
import { SAccordionList } from '@v2/components/organisms/SAccordion/components/SAccordionList/SAccordionList';
import { SAccordion } from '@v2/components/organisms/SAccordion/SAccordion';
import dynamic from 'next/dynamic';

const DraftEditor = dynamic(
  async () => {
    const mod = await import(
      'components/molecules/form/draft-editor/DraftEditor'
    );
    return mod.DraftEditor;
  },
  { ssr: false },
);

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
                  <DraftEditor
                    size="model"
                    handlePastedText={handlePastedText}
                    mt={5}
                    isJson
                    document_model
                    textProps={{ color: 'grey.700' }}
                    label={''}
                    placeholder="descrição..."
                    defaultValue={parseToEditor(item) as any}
                    onChange={(value) =>
                      handleEdit(
                        parseFromEditorToElement(
                          (value ? JSON.parse(value) : null) as any,
                        ),
                      )
                    }
                    toolbarOpen
                    mention={{
                      separator: ' ',
                      trigger: '{',
                      suggestions,
                    }}
                    toolbarProps={{
                      options: [
                        'inline',
                        ...((mapProps as any)[item.type]?.fontSize
                          ? ['fontSize']
                          : []),
                        'textAlign',
                        'colorPicker',
                        'link',
                      ],
                    }}
                    {...(!mapProps[item.type]?.toolbar && {
                      toolbarOpen: false,
                    })}
                    {...(!(mapProps as any)[item.type]?.multiline && {
                      handleReturn,
                    })}
                  />
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
