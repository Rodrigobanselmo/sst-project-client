/* eslint-disable @typescript-eslint/no-explicit-any */
import { saveAs } from 'file-saver';

export async function downloadFile(response: any) {
  const fileExcelBlob = new Blob([response.data], {
    type: response.headers['content-type'],
  });

  let fileName = 'file.xlsx';

  try {
    const name = response.headers['content-disposition']
      .split('filename=')[1]
      .split(';')[0]
      .replace(/"/g, '');

    fileName = name;
    // eslint-disable-next-line no-empty
  } catch (error) {}

  saveAs(fileExcelBlob, fileName);

  return response.data;
}
