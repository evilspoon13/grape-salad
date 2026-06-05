export function AudioPlayer({ src }: { src: string }) {
  // Native controls are plenty for an MVP.
  return <audio controls preload="none" src={src} className="w-full" />;
}
