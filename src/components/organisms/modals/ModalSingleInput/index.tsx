import React, { FC, useEffect, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

import { isValidEmail } from '@brazilian-utils/brazilian-utils';
import { yupResolver } from '@hookform/resolvers/yup/dist/yup.js';
import { InputForm } from 'components/molecules/form/input';
import SModal, {
  SModalButtons,
  SModalHeader,
  SModalPaper,
} from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { useRegisterModal } from 'core/hooks/useRegisterModal';
import { photoSchema } from 'core/utils/schemas/photo.schema';

import { SModalUploadPhoto } from './types';

export enum TypeInputModal {
  TEXT = 'text',
  TEXT_AREA = 'text-area',
  PROFESSIONAL = 'professional',
  COUNCIL = 'COUNCIL',
  CONTACT = 'CONTACT',
  EMAIL = 'EMAIL',
  EMPLOYEE = 'EMPLOYEE',
}

type Tag =
  | 'p'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'li'
  | 'ul'
  | 'ol'
  | 'strong';
type ParsedArray = {
  tags: Tag[];
  text: string | ParsedArray;
}[];

const breakLinesTags = [
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'p',
  'ol',
  'ul',
] as Tag[];
const boldTags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'strong'] as Tag[];
const bulletTags = ['li'] as Tag[];

export const initialInputModalState = {
  title: '',
  placeholder: '',
  label: '',
  name: '',
  type: TypeInputModal.TEXT,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onConfirm: async (value: string) => {},
};

const modalName = ModalEnum.SINGLE_INPUT;

export const ModalSingleInput: FC<
  { children?: any } & SModalUploadPhoto
> = () => {
  const { registerModal, getModalData } = useRegisterModal();
  const { onCloseModal } = useModal();

  const { handleSubmit, control, clearErrors, reset, setError, setValue } =
    useForm<any>({
      resolver: yupResolver(photoSchema),
    });

  const [data, setData] = useState({
    ...initialInputModalState,
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const initialData =
      getModalData<Partial<typeof initialInputModalState>>(modalName);

    // eslint-disable-next-line prettier/prettier
    if (
      initialData &&
      Object.keys(initialData)?.length &&
      !(initialData as any).passBack
    ) {
      setValue('name', initialData.name);
      setLoading(false);
      setData((oldData) => ({
        ...oldData,
        ...initialData,
      }));
    }
  }, [getModalData, setValue]);

  const onClose = () => {
    onCloseModal(modalName);
    setData(initialInputModalState);
    reset();
  };

  const onSubmit: SubmitHandler<{ name: string }> = async (formData) => {
    if (data.type == TypeInputModal.EMAIL) {
      if (!isValidEmail(formData.name))
        return setError('name', { message: 'Email inválido' });
    }

    try {
      setLoading(true);
      data.onConfirm && (await data.onConfirm(formData.name));
    } catch {}

    setLoading(false);
    onClose();
  };

  const buttons = [
    {},
    {
      text: 'Confirmar',
      variant: 'contained',
      type: 'submit',
      onClick: () => {},
    },
  ] as IModalButton[];

  const inputProps = () => {
    if (data.type == TypeInputModal.TEXT) return {};
    if (data.type == TypeInputModal.TEXT_AREA)
      return {
        multiline: true,
        maxRows: 5,
        minRows: 3,
      };
  };

  function parseHtmlToArray(htmlString) {
    // Create a DOM parser
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');

    // Recursive function to traverse DOM elements
    function traverse(node) {
      const result = [] as any[];

      node.childNodes.forEach((child) => {
        // If the child is an element node
        if (child.nodeType === Node.ELEMENT_NODE) {
          const childResult = {
            tags: [child.tagName.toLowerCase()],
            text: [] as any[],
          };

          // Recursively traverse the child nodes
          const childTextResults = traverse(child) as any[];
          childResult.text.push(...childTextResults);

          result.push(childResult);
        }

        // If the child is a text node
        else if (
          child.nodeType === Node.TEXT_NODE &&
          child.textContent.trim()
        ) {
          result.push({
            text: child.textContent.trim(),
            tags: [],
          });
        }
      });

      return result;
    }

    // Start traversal from the body of the parsed HTML
    return traverse(doc.body) as ParsedArray;
  }

  function generateStringFromParsedArray(parsedArray: ParsedArray, level = 0) {
    let result = '';

    parsedArray.forEach((main) => {
      const bullet = !!main.tags.find((tag) => bulletTags.includes(tag));

      let text = (
        Array.isArray(main.text)
          ? generateStringFromParsedArray(main.text, level + (bullet ? 1 : 0))
          : main.text
      ).trim();

      const bold = !!main.tags.find((tag) => boldTags.includes(tag));
      const breakLine = !!main.tags.find((tag) => breakLinesTags.includes(tag));

      if (bold && !text.includes('**')) text = '**' + text + '**';
      if (bullet) text = '\n>' + '>'.repeat(level) + text;
      if (breakLine) text = text + '\n';

      const middleSpace = result.length && text.length ? ' ' : '';
      result = result + middleSpace + text;
    });

    return result.replaceAll('\n ', '\n');
  }

  // Example usage in your handlePaste function
  const handlePaste = (event: React.ClipboardEvent<HTMLDivElement>) => {
    event.preventDefault();

    const clipboardData = event.clipboardData;
    const htmlData = clipboardData.getData('text/html');

    if (htmlData) {
      // console.log('HTML content:', htmlData);
      const formattedOutput = parseHtmlToArray(htmlData);
      console.log(formattedOutput);
      // console.log(generateStringFromParsedArray(formattedOutput));

      // Update the desired field or state with the formatted output
      setValue('name', generateStringFromParsedArray(formattedOutput)); // Assuming you're using React Hook Form
    } else {
      console.log('No HTML content available in clipboard.');
    }
  };

  return (
    <SModal {...registerModal(modalName)} keepMounted={false} onClose={onClose}>
      <SModalPaper
        onSubmit={(handleSubmit as any)(onSubmit)}
        component="form"
        center
        p={8}
        width={'fit-content'}
        minWidth={600}
        loading={loading}
      >
        <SModalHeader onClose={onClose} title={data.title || 'Adicionar'} />
        <InputForm
          autoFocus
          onPaste={handlePaste}
          setValue={setValue}
          defaultValue={data.name}
          label={data.label || 'descrição'}
          labelPosition="center"
          control={control}
          sx={{ minWidth: ['100%', 600], mb: 5 }}
          placeholder={data.placeholder || 'descrição...'}
          name="name"
          size="small"
          onChange={() => clearErrors()}
          {...inputProps()}
        />
        <SModalButtons onClose={onClose} buttons={buttons} />
      </SModalPaper>
    </SModal>
  );
};
