/* eslint-disable @typescript-eslint/no-explicit-any */
import { saveAs } from 'file-saver';

const getFileExtensionFromContentType = (contentType: string) => {
  switch (contentType) {
    case 'application/xml':
      return '.xml';
    case 'application/json':
      return '.json';
    case 'application/json; charset=utf-8':
      return '.json';
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      return '.docx';
    case 'application/vnd.ms-excel':
      return '.xls';
    case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
      return '.xlsx';
    default:
      return '.xlsx';
  }
};

export async function downloadFile(response: any) {
  const file = new Blob([response.data], {
    type: response.headers['content-type'],
  });

  const ext = getFileExtensionFromContentType(response.headers['content-type']);
  let fileName = `file${ext}`;

  try {
    const name = response.headers['content-disposition']
      .split('filename=')[1]
      .split(';')[0]
      .replace(/"/g, '');

    fileName = name;
    // eslint-disable-next-line no-empty
  } catch (error) {}

  saveAs(file, fileName);

  return response.data;
}
