export async function urlToFile({ url, name }: { url: string; name?: string }) {
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Cache-Control': 'no-cache',
      Pragma: 'no-cache',
    },
    cache: 'no-store',
  });
  const blob = await response.blob();
  const filename = name || getFilenameFromUrl(url);

  const file = new File([blob], filename, { type: blob.type });

  return file;
}

export async function urlToDataUrl({ url }: { url: string }): Promise<string> {
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Cache-Control': 'no-cache',
      Pragma: 'no-cache',
    },
    cache: 'no-store',
  });
  const blob = await response.blob();

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      resolve(dataUrl);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function getFilenameFromUrl(url: string) {
  const path = url.split('/'); // Split URL by '/'
  return path[path.length - 1]; // Get the last segment of the URL as the filename
}
