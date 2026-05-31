import { useState } from 'react';
import Lightbox from './Lightbox';
// import { photos } from '../data/content'; // old, static data
import { loadAllData } from '../data/api.js';
const { designProjects, itProjects, photos } = await loadAllData();

export default function PagePhoto() {
  const [lightboxIdx, setLightboxIdx] = useState(null);

  return (
    <>
      <div className="page-heading">Photo<span>graphy</span></div>
      <div className="page-rule" />
      <div className="photo-grid" id="photoGrid">
        {photos.map((photo, i) => (
          <div key={i} className="photo-item" onClick={() => setLightboxIdx(i)}>
            <div className="photo-item-inner">
              <img src={photo.src} alt={photo.title} loading="lazy" />
            </div>
          </div>
        ))}
      </div>

      {lightboxIdx !== null && (
        <Lightbox
          photos={photos}
          initialIdx={lightboxIdx}
          onClose={() => setLightboxIdx(null)}
        />
      )}
    </>
  );
}
