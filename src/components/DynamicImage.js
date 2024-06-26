import React from 'react';

function DynamicImage({imageUrl}) {
  return (
    <div id="imageId">
      <img width={100} height={100} id="dynamicImage" src={imageUrl} alt="no image" />
    </div>
  );
}

export default DynamicImage;
