import { useEffect, useState } from 'react';

type KeyLock = 'CapsLock' | 'NumLock' | 'ScrollLock';
const useKeyLock = (key: KeyLock) => {
  const [toggled, setToggled] = useState(false);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => setToggled((pToggled) => event.getModifierState?.(key) ?? pToggled);

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [key]);

  return toggled;
};
export default useKeyLock;