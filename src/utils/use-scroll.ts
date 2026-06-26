import { useEffect, useState } from 'react';

const STICKY_SCROLL_OFFSET = 8;

export const useScroll = () => {
  const [isCompact, setIsCompact] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsCompact(window.scrollY > STICKY_SCROLL_OFFSET);
    };

    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return isCompact;
};
