import { useCallback, useEffect, useRef, useState } from 'react';

import clsx from 'clsx';
import gsap from 'gsap';
import styles from '@src/components/dom/styles/musicButton.module.scss';
import useScroll from '@src/hooks/useScroll';
import { useShallow } from 'zustand/react/shallow';
import { useStore } from '@src/store';
import { isAmbientEnabled, playAmbient, setAmbientEnabled } from '@src/lib/audio';
import { useRouter } from 'next/router';

function MusicButton() {
  const router = useRouter();
  const isHome = router.pathname === '/';
  const [isPlaying, setIsPlaying] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const firstInteractionRef = useRef(false);
  const [introOut, isLoading] = useStore(useShallow((state) => [state.introOut, state.isLoading]));

  const startAmbient = useCallback(() => {
    if (firstInteractionRef.current) return;
    firstInteractionRef.current = true;
    playAmbient();
    setIsPlaying(isAmbientEnabled());
  }, []);

  useEffect(() => {
    const onFirstInteraction = () => startAmbient();
    window.addEventListener('pointerdown', onFirstInteraction);
    window.addEventListener('keydown', onFirstInteraction);
    return () => {
      window.removeEventListener('pointerdown', onFirstInteraction);
      window.removeEventListener('keydown', onFirstInteraction);
    };
  }, [startAmbient]);

  useScroll(({ scroll }) => {
    const shouldHide = scroll > window.innerHeight * 0.8;
    setIsVisible(!shouldHide);
  });

  useEffect(() => {
    if (!isVisible) {
      gsap.to('[data-music-button]', { autoAlpha: 0, duration: 0.3, scale: 0.8 });
    } else {
      gsap.to('[data-music-button]', { autoAlpha: 1, duration: 0.3, scale: 1 });
    }
  }, [isVisible]);

  const toggleMusic = useCallback(() => {
    const next = !isAmbientEnabled();
    setAmbientEnabled(next);
    if (next) {
      playAmbient();
    }
    setIsPlaying(next);
  }, []);

  if (!isHome || (introOut && isLoading)) {
    return null;
  }

  return (
    <button
      type="button"
      data-music-button
      aria-label={isPlaying ? '关闭音乐' : '播放音乐'}
      onClick={toggleMusic}
      className={clsx(styles.root, 'layout-block-inner')}
    >
      {isPlaying ? <IconSoundOn /> : <IconSoundOff />}
    </button>
  );
}

function IconSoundOn() {
  return (
    <svg className={styles.icon} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M3 9v6h4l5 5V4L7 9H3z" />
      <path d="M16.5 12a4.5 4.5 0 0 0-2.5-4.03v8.06A4.5 4.5 0 0 0 16.5 12z" />
      <path d="M14 3.23v2.06a7 7 0 0 1 0 13.42v2.06a9 9 0 0 0 0-17.54z" />
    </svg>
  );
}

function IconSoundOff() {
  return (
    <svg className={styles.icon} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M3 9v6h4l5 5V4L7 9H3z" />
      <line x1="16" y1="9" x2="22" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="22" y1="9" x2="16" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export default MusicButton;
