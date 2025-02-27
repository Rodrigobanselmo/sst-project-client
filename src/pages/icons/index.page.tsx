import React from 'react';
import * as Icons from '../../@v2/assets/icons'; // Path to your icons file
import { SIconArrowBack } from '../../@v2/assets/icons';

const IconGallery: React.FC = () => {
  return (
    <div>
      <h1>Icon Gallery</h1>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fill, minmax(300px, 1fr))' /* Changed minmax here */,
          gap: '16px',
        }}
      >
        {Object.entries(Icons).map(([key, Value], index) => (
          <div key={index} style={{ textAlign: 'center' }}>
            <p>{key}</p>
            {key === 'SIconArrowBack' ? (
              <>
                <Value variant="line" />
                <Value variant="simple" />
              </>
            ) : (
              <Value variant="line" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default IconGallery;
