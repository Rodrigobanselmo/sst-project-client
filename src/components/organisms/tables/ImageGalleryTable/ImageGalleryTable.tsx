import { FC, useState } from 'react';

import { BoxProps, Divider } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import {
  STable,
  STableBody,
  STableHeader,
  STableHRow,
  STableRow,
} from 'components/atoms/STable';
import IconButtonRow from 'components/atoms/STable/components/Rows/IconButtonRow';
import TextIconRow from 'components/atoms/STable/components/Rows/TextIconRow';
import STablePagination from 'components/atoms/STable/components/STablePagination';
import STableSearch from 'components/atoms/STable/components/STableSearch';
import STableSmallTitle from 'components/atoms/STable/components/STableSmallTitle/STableSmallTitle';
import STableTitle from 'components/atoms/STable/components/STableTitle';
import { STagButton } from 'components/atoms/STagButton';
import SText from 'components/atoms/SText';
import { initialContactState } from 'components/organisms/modals/ModalAddContact/hooks/useAddContact';

import SAddIcon from 'assets/icons/SAddIcon';
import EditIcon from 'assets/icons/SEditIcon';

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { useTableSearchAsync } from 'core/hooks/useTableSearchAsync';
import { IImageGallery } from 'core/interfaces/api/IImageGallery';
import { useQueryContacts } from 'core/services/hooks/queries/useQueryContacts/useQueryContacts';
import { useQueryImagesGalleries } from 'core/services/hooks/queries/useQueryImagesGalleries/useQueryImagesGalleries';
import { initialPhotoState } from 'components/organisms/modals/ModalUploadPhoto';
import { useMutCreateImageGallery } from 'core/services/hooks/mutations/manager/imageGallery/useMutCreateImageGallery/useMutCreateImageGallery';
import { useMutUpdateImageGallery } from 'core/services/hooks/mutations/manager/imageGallery/useMutUpdateImageGallery/useMutUpdateImageGallery';
import { useMutDeleteImageGallery } from 'core/services/hooks/mutations/manager/imageGallery/useMutDeleteImageGallery/useMutDeleteImageGallery';
import { dateToString } from 'core/utils/date/date-format';
import { usePreventAction } from 'core/hooks/usePreventAction';
import SDeleteIcon from 'assets/icons/SDeleteIcon';
import ImageRow from 'components/atoms/STable/components/Rows/ImageRow/ImageRow';
import { ImagesTypeEnum } from 'project/enum/imageGallery.enum';
import SCheckBox from 'components/atoms/SCheckBox';

export const ImageGalleryTable: FC<
  { children?: any } & BoxProps & {
      rowsPerPage?: number;
      onSelectData?: (group: IImageGallery) => void;
      hideTitle?: boolean;
      freeAspect?: boolean;
      companyId?: string;
      createTypes?: ImagesTypeEnum[];
      searchTypes?: ImagesTypeEnum[];
      selectedData?: IImageGallery[];
    }
> = ({
  rowsPerPage = 8,
  onSelectData,
  hideTitle,
  companyId,
  freeAspect = true,
  createTypes,
  searchTypes,
  selectedData,
}) => {
  const { handleSearchChange, search, page, setPage } = useTableSearchAsync();

  const {
    data: images,
    isLoading: loadImages,
    count,
  } = useQueryImagesGalleries(
    page,
    { search, types: searchTypes },
    rowsPerPage,
    companyId,
  );

  const isSelect = !!onSelectData;

  const { preventDelete } = usePreventAction();
  const { onStackOpenModal } = useModal();
  const mutCreateImage = useMutCreateImageGallery();
  const mutUpdateImage = useMutUpdateImageGallery();
  const mutDeleteImage = useMutDeleteImageGallery();

  const onAddImage = () => {
    onStackOpenModal(ModalEnum.UPLOAD_PHOTO, {
      name: '',
      freeAspect,
      onConfirm: async (photo) => {
        if (photo.file && photo.name) {
          const image = await mutCreateImage
            .mutateAsync({
              file: photo.file,
              name: photo.name,
              companyId,
              types: createTypes,
            })
            .catch(() => {});
        }
      },
    } as Partial<typeof initialPhotoState>);
  };

  const onSelectRow = (img: IImageGallery) => {
    if (isSelect) {
      onSelectData(img);
    } else onEditImage(img);
  };

  const onEditImage = (img: IImageGallery) => {
    onStackOpenModal(ModalEnum.UPLOAD_PHOTO, {
      name: img.name,
      id: img.id,
      freeAspect,
      url: img.url + `?timestamp=${img.updated_at}`,
      onConfirm: async (photo) => {
        const image = await mutUpdateImage
          .mutateAsync({
            id: img.id,
            file: photo.file,
            name: photo.name,
            companyId,
            types: createTypes,
          })
          .catch(() => {});
      },
    } as Partial<typeof initialPhotoState>);
  };

  const handlePhotoRemove = async (id: number) => {
    preventDelete(
      async () => await mutDeleteImage.mutateAsync({ id: id }).catch(() => {}),
      'você excluirá permanentemente essa imagem. Deseja continuar?',
      { inputConfirm: true },
    );
  };

  const header: (BoxProps & { text: string; column: string })[] = [
    { text: 'Imagem', column: '100px' },
    { text: 'Nome', column: 'minmax(150px, 2fr)' },
    { text: 'Criação', column: '200px' },
    { text: 'Ultima Atualização', column: '200px' },
    { text: 'Editar', column: '50px' },
    { text: 'Deletar', column: '50px' },
  ];

  if (selectedData) header.unshift({ text: '', column: '15px' });

  return (
    <>
      {!hideTitle && (
        <>
          <STableTitle>Imagens</STableTitle>
        </>
      )}
      <STableSearch
        onAddClick={onAddImage}
        onChange={(e) => handleSearchChange(e.target.value)}
      />
      <STable
        loading={loadImages}
        rowsNumber={rowsPerPage}
        columns={header.map(({ column }) => column).join(' ')}
      >
        <STableHeader>
          {header.map(({ text, ...props }) => (
            <STableHRow key={text} {...props}>
              {text}
            </STableHRow>
          ))}
        </STableHeader>
        <STableBody<(typeof images)[0]>
          rowsData={images}
          hideLoadMore
          rowsInitialNumber={rowsPerPage}
          renderRow={(row) => {
            return (
              <STableRow
                onClick={() => onSelectRow(row)}
                clickable
                key={row.id}
              >
                {selectedData && (
                  <SCheckBox
                    label=""
                    checked={
                      !!selectedData.find((exam) => exam.url === row.url)
                    }
                  />
                )}
                <ImageRow
                  clickable
                  url={row.url + `?timestamp=${row.updated_at}`}
                />
                <TextIconRow clickable text={row.name || '-'} />
                <TextIconRow
                  clickable
                  text={dateToString(row.created_at, 'DD/MM/YYYY - HH:mm')}
                />
                <TextIconRow
                  clickable
                  text={dateToString(row.updated_at, 'DD/MM/YYYY - HH:mm')}
                />

                <IconButtonRow
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditImage(row);
                  }}
                  icon={<EditIcon />}
                />

                <IconButtonRow
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePhotoRemove(row.id);
                  }}
                  sx={{ color: 'error.main', fontSize: '1rem' }}
                  icon={<SDeleteIcon sx={{ fontSize: 23 }} />}
                />
              </STableRow>
            );
          }}
        />
      </STable>
      <STablePagination
        mt={2}
        registersPerPage={rowsPerPage}
        totalCountOfRegisters={loadImages ? undefined : count}
        currentPage={page}
        onPageChange={setPage}
      />
    </>
  );
};
