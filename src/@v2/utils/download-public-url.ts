import saveAs from 'file-saver';

const downloadFile = async (url: string) => {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const blob = await response.blob();
    const filename = url.split('?')[0].split('/').pop();

    saveAs(blob, filename);
  } catch (error) {
    console.error('Error downloading image:', error);
  }
};

export function donwloadPublicUrl(url: string) {
  const lowerCaseUrl = url.toLowerCase();
  const isPdf = lowerCaseUrl.includes('.pdf?');
  // const isImage = /\.(jpg|jpeg|png|gif|webp|bmp|svg)(\?.*)?$/i.test(
  //   lowerCaseUrl,
  // );

  if (isPdf) {
    window.open(url, '_blank');
  } else {
    downloadFile(url);
  }
}
