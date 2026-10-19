import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Hero from '../sections/Hero.jsx';
import Manifesto from '../sections/Manifesto.jsx';
import Rooms from '../sections/Rooms.jsx';
import DayAtHome from '../sections/DayAtHome.jsx';
import Configurator from '../sections/Configurator.jsx';
import SwatchFan from '../sections/SwatchFan.jsx';
import LogToLivingRoom from '../sections/LogToLivingRoom.jsx';
import CollectionCanvas from '../sections/CollectionCanvas.jsx';
import Homes from '../sections/Homes.jsx';
import Visit from '../sections/Visit.jsx';
import FilmPlayer from '../components/FilmPlayer.jsx';
import { scrollToId } from '../lib/lenis.js';
import { ScrollTrigger } from '../lib/gsap.js';

export default function Home() {
  const { hash } = useLocation();

  // A direct visit to /#collections etc. lands on that section once pins exist.
  useEffect(() => {
    if (!hash) return undefined;
    const t = setTimeout(() => {
      ScrollTrigger.refresh();
      scrollToId(hash.slice(1), true);
    }, 400);
    return () => clearTimeout(t);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <Hero />
      <Manifesto />
      <Rooms />
      <DayAtHome />
      <Configurator />
      <SwatchFan />
      <LogToLivingRoom />
      <CollectionCanvas />
      <Homes />
      <Visit />
      <FilmPlayer />
    </>
  );
}
