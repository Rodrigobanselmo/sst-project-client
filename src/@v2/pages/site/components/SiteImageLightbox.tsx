import { useEffect } from 'react';

type SiteImageLightboxProps = {
  image: string;
  alt: string;
  isOpen: boolean;
  onClose: () => void;
};

export function SiteImageLightbox({ image, alt, isOpen, onClose }: SiteImageLightboxProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="lp-lightbox" role="dialog" aria-modal="true" aria-label={alt}>
      <button
        type="button"
        className="lp-lightbox__backdrop"
        aria-label="Fechar visualização ampliada"
        onClick={onClose}
      />
      <div className="lp-lightbox__dialog">
        <button
          type="button"
          className="lp-lightbox__close"
          aria-label="Fechar"
          onClick={onClose}
        >
          <span aria-hidden="true">×</span>
        </button>
        <img src={image} alt={alt} className="lp-lightbox__img" />
      </div>
    </div>
  );
}
