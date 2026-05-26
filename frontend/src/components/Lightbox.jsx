import { useState, useEffect } from 'react';

export default function Lightbox({ photos, initialIdx, onClose }) {
  const [idx, setIdx]         = useState(initialIdx);
  const [imgOpacity, setOpacity] = useState(1);
  const total = photos.length;

  function step(dir) {
    setOpacity(0);
    setTimeout(() => {
      setIdx(prev => (prev + dir + total) % total);
      setOpacity(1);
    }, 150);
  }

  // Keyboard navigation
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft')  step(-1);
      if (e.key === 'Escape')     onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const photo = photos[idx];

  return (
    <div
      className="photo-lightbox open"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <button className="lightbox-close" onClick={onClose}>&times;</button>

      <div className="lightbox-img-wrap">
        <img
          src={photo.src}
          alt={photo.title}
          style={{ opacity: imgOpacity, transition: 'opacity .3s' }}
        />
      </div>

      <div className="lightbox-caption">
        <h3>{photo.title}</h3>
        <p>{photo.desc}</p>
      </div>

      <div className="lightbox-nav">
        <button onClick={() => step(-1)}>← Prev</button>
        <button onClick={() => step(1)}>Next →</button>
      </div>
    </div>
  );
}
