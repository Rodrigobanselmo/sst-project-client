import { useCallback, useState, type CSSProperties } from 'react';

type LandingPictureProps = {
  src: string;
  alt: string;
  className?: string;
  objectPosition?: string;
  priority?: boolean;
};

export function LandingPicture({
  src,
  alt,
  className = '',
  objectPosition = 'center',
  priority = false,
}: LandingPictureProps) {
  const [failed, setFailed] = useState(false);

  const handleError = useCallback(() => {
    setFailed(true);
  }, []);

  const imgStyle: CSSProperties = { objectPosition };

  return (
    <div className={`lp-picture ${className}`.trim()}>
      {!failed ? (
        <img
          src={src}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          onError={handleError}
          style={imgStyle}
        />
      ) : (
        <div className="lp-picture__fallback" aria-hidden />
      )}
    </div>
  );
}
