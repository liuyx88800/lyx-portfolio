import { Howl } from 'howler';

let ambient = null;
let enabled = true;

export function getAmbient() {
  if (typeof window === 'undefined') return null;
  if (!ambient) {
    ambient = new Howl({
      src: ['/audio/ambient.ogg'],
      loop: true,
      volume: 0.3,
      html5: true,
      preload: true,
    });
  }
  return ambient;
}

export function playAmbient() {
  const sound = getAmbient();
  if (!sound || sound.playing()) return;
  if (enabled) {
    sound.play();
  } else {
    sound.play();
    sound.mute(true);
  }
}

export function setAmbientEnabled(value) {
  enabled = value;
  const sound = getAmbient();
  if (sound) {
    sound.mute(!value);
  }
}

export function isAmbientEnabled() {
  return enabled;
}
