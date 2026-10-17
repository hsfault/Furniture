import { TLink } from '../components/DoorTransition.jsx';

export default function NotFound() {
  return (
    <section className="wrap flex min-h-[100svh] flex-col items-center justify-center py-32 text-center">
      <div className="niche h-[min(46vh,360px)] w-[min(56vw,260px)] rounded-t-[999px] bg-[#E6DED2]" aria-hidden="true" />
      <h1 className="display mt-10 text-[clamp(2.4rem,6vw,5rem)] leading-none">
        This niche is <i>empty.</i>
      </h1>
      <p className="mt-4 max-w-[40ch] text-taupe">Whatever was kept here has moved. The rest of the house is just through the door.</p>
      <TLink to="/" className="btn-clay mt-8">
        Back to the house
      </TLink>
    </section>
  );
}
