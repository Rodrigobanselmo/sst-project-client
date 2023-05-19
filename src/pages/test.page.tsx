import React from 'react';

import dynamic from 'next/dynamic';

const CanvasEditor = dynamic(
  () =>
    import('components/molecules/SCanvasEditorTesting/SCanvasEditorTesting'),
  {
    ssr: false,
  },
);

const Page = () => {
  return (
    <div>
      <CanvasEditor />
    </div>
  );
};

export default Page;
