import { useRef, useState } from 'react';
import { useGSAP } from '../lib/gsap.js';
import { flipChars } from '../lib/splitReveal.js';
import { initParallax } from '../lib/parallax.js';
import { rooms } from '../data/rooms.js';
import GLImage from '../gl/GLImage.jsx';
import Lightbox from '../components/Lightbox.jsx';

function RoomImage({ room, onOpen, mobile, index }) {
  const L = room.layout;
  const caption = `${room.name} — ${room.products.join(' · ')}`;
  const style = mobile ? undefined : { position: 'absolute', left: `${L.left}%`, top: `${L.top}%`, width: `${L.w}vw`, aspectRatio: room.ratio };
  return (
    <button
      type="button"
      onClick={(e) => onOpen(room, e.currentTarget.querySelector('.gl-frame'))}
      className={`group block w-full text-left ${mobile && index % 2 ? 'mt-16' : ''}`}
      style={style}
      data-speed={mobile ? (index % 2 ? 1.08 : 0.94) : L.speed}
      aria-label={`Open ${room.name}`}
    >
      <GLImage
        src={room.image}
        alt={caption}
        shape={room.shape}
        rotate={mobile ? 0 : L.rotate}
        className="h-full w-full shadow-[0_30px_60px_-30px_rgba(42,29,21,.35)]"
        style={mobile ? { aspectRatio: room.ratio } : undefined}
        data-cursor="VIEW"
        data-cursor-caption={caption}
      />
      {mobile && <span className="mono mt-2 block text-taupe">{room.name}</span>}
    </button>
  );
}

export default function Rooms() {
  const root = useRef(null);
  const title = useRef(null);
  const [open, setOpen] = useState(null);
  const [mobile] = useState(() => window.innerWidth < 768);

  useGSAP(
    () => {
      flipChars(title.current);
      initParallax(root.current);
    },
    { scope: root },
  );

  return (
    <section ref={root} data-chapter="03" aria-label="Rooms" className="relative">
      {mobile ? (
        <div className="wrap py-24">
          <p className="mono text-taupe">03 — Rooms</p>
          <h2 ref={title} className="display mt-4 text-section">
            Rooms that <i>breathe</i>
          </h2>
          <div className="mt-12 grid grid-cols-2 gap-x-4 gap-y-10">
            {rooms.map((r, i) => (
              <RoomImage key={r.id} room={r} index={i} mobile onOpen={(room, from) => setOpen({ room, from })} />
            ))}
          </div>
        </div>
      ) : (
        <div className="relative h-[220vh]">
          <div className="pointer-events-none sticky top-0 z-[2] flex h-screen flex-col items-center justify-center text-center">
            <p className="mono text-taupe">03 — Rooms</p>
            <h2 ref={title} className="display mt-4 text-section" style={{ textShadow: '0 0 40px rgba(239,233,225,.9)' }}>
              Rooms that <i>breathe</i>
            </h2>
            <p className="mono mt-6 text-taupe">Nine homes · Pick a room to see what is in it</p>
          </div>
          <div className="absolute inset-0 z-[1]">
            {rooms.map((r, i) => (
              <RoomImage key={r.id} room={r} index={i} onOpen={(room, from) => setOpen({ room, from })} />
            ))}
          </div>
        </div>
      )}
      {open && <Lightbox room={open.room} from={open.from} onClose={() => setOpen(null)} />}
    </section>
  );
}
