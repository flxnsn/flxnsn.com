import { useState, useRef, useEffect, useCallback } from 'react';
// import { designProjects } from '../data/content'; // old, static data
import { loadAllData } from '../data/api.js';
const { designProjects, itProjects, photos } = await loadAllData();


function layoutClass(images) {
  const n = images.length;
  if (n === 1) return 'layout-1';
  if (n === 2) return 'layout-2';
  if (n === 3) return 'layout-3';
  return 'layout-4';
}

export default function PageDesign() {
  const [activeIdx, setActiveIdx] = useState(0);
  const trackRef = useRef(null);
  const busyRef  = useRef(false);
  const total    = designProjects.length;

  const goToSlide = useCallback((idx) => {
    const track = trackRef.current;
    if (!track) return;
    idx = Math.max(0, Math.min(idx, total - 1));
    setActiveIdx(idx);
    const slide = track.querySelectorAll('.design-article')[idx];
    if (slide) slide.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
  }, [total]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    function onWheel(e) {
      e.preventDefault();
      if (busyRef.current) return;
      const dir = (e.deltaY > 0 || e.deltaX > 0) ? 1 : -1;
      busyRef.current = true;
      setActiveIdx(prev => {
        const next = Math.max(0, Math.min(prev + dir, total - 1));
        const slide = track.querySelectorAll('.design-article')[next];
        if (slide) slide.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
        return next;
      });
      setTimeout(() => { busyRef.current = false; }, 700);
    }

    function onScroll() {
      const w = track.clientWidth;
      if (!w) return;
      const idx = Math.round(track.scrollLeft / w);
      setActiveIdx(idx);
    }

    track.addEventListener('wheel', onWheel, { passive: false });
    track.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      track.removeEventListener('wheel', onWheel);
      track.removeEventListener('scroll', onScroll);
    };
  }, [total]);

  return (
    <>
      <div className="design-scroll-track" id="designTrack" ref={trackRef}>
        {designProjects.map((project, i) => (
          <article key={project.id} className="design-article">
            <div className="design-article-meta">
              <span className="design-slide-num">
                {String(i + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
              </span>
              <h2>{project.title}</h2>
              <div className="tech-tags">
                {project.tags.map((tag) => (
                  <span key={tag} className="tech-tag">{tag}</span>
                ))}
              </div>
              <p className="design-article-desc">{project.desc}</p>
            </div>
            <div className={`design-article-images ${layoutClass(project.images)}`}>
              {project.images.map((src, j) => (
                <div key={j} className="design-img-wrap">
                  <img src={src} alt="" loading="lazy" />
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>

      <div className="design-dots">
        {designProjects.map((_, i) => (
          <div
            key={i}
            className={`design-dot${i === activeIdx ? ' active' : ''}`}
            onClick={() => goToSlide(i)}
            style={{ pointerEvents: 'all', cursor: 'pointer' }}
          />
        ))}
      </div>
    </>
  );
}
