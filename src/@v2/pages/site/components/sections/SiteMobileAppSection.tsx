import {
  SITE_MOBILE_APP,
  SITE_MOBILE_FEATURES,
} from '../../constants/site-mobile.constant';
import { LandingPicture } from '../LandingPicture';

export function SiteMobileAppSection() {
  return (
    <section className="lp-mobile-app" id="app-mobile" aria-labelledby="lp-mobile-app-title">
      <div className="lp-wrap">
        <div className="lp-mobile-app__hero">
          <div className="lp-mobile-app__copy">
            <h2 id="lp-mobile-app-title" className="lp-h2">
              Leve a coleta de campo para dentro do SimpleSST
            </h2>
            <p className="lp-lead" style={{ marginTop: '0.75rem' }}>
              Use o aplicativo mobile como apoio à coleta de informações, fotos, vídeos, áudios e
              evidências em campo. Os dados coletados são enviados para a plataforma web, onde a gestão
              de SST acontece de forma estruturada.
            </p>
            <p className="lp-body" style={{ marginTop: '1rem' }}>
              O app não substitui a plataforma web. Ele funciona como uma extensão operacional para
              aproximar o trabalho de campo dos inventários, planos de ação, documentos e evidências
              gerenciados no SimpleSST.
            </p>
          </div>

          <LandingPicture
            src={SITE_MOBILE_APP.fieldCollection}
            alt="Técnico de segurança utilizando o aplicativo SimpleSST em área industrial para registrar evidências em campo"
            className="lp-mobile-app__illustration"
            objectPosition="50% 45%"
          />
        </div>

        <div className="lp-mobile-app__flow" aria-label="Fluxo operacional do aplicativo">
          {SITE_MOBILE_FEATURES.map((feature) => (
            <article key={feature.title} className="lp-mobile-app__card">
              <div className="lp-mobile-app__card-head">
                <h3 className="lp-mobile-app__card-title">{feature.title}</h3>
                <p className="lp-body lp-mobile-app__card-text">{feature.description}</p>
              </div>
              <div className="lp-mobile-app__card-media">
                <img
                  src={feature.image}
                  alt={feature.imageAlt}
                  className="lp-mobile-app__card-visual"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </article>
          ))}
        </div>

        <aside className="lp-mobile-app__download-panel" aria-labelledby="lp-mobile-download-title">
          <div className="lp-mobile-app__download-layout">
            <div className="lp-mobile-app__qr-item lp-mobile-app__qr-item--android">
              <a
                href={SITE_MOBILE_APP.googlePlayUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="lp-mobile-app__qr-link"
              >
                <img
                  src={SITE_MOBILE_APP.qrGooglePlay}
                  alt="QR Code para baixar o SimpleSST na Google Play"
                  width={160}
                  height={160}
                  loading="lazy"
                  decoding="async"
                />
              </a>
              <p className="lp-mobile-app__qr-label">Android</p>
              <a
                href={SITE_MOBILE_APP.googlePlayUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="lp-btn lp-btn--secondary lp-btn--compact lp-mobile-app__store-btn"
              >
                <svg className="lp-store-btn__icon" viewBox="0 0 24 24" aria-hidden>
                  <path
                    fill="currentColor"
                    d="M3 20.5V3.5C3 2.91 3.34 2.39 3.84 2.15L13.69 12L3.84 21.85C3.34 21.6 3 21.09 3 20.5ZM16.81 15.12L6.05 21.34L14.54 12.85L16.81 15.12ZM20.16 10.81C20.5 11.08 20.75 11.5 20.75 12C20.75 12.5 20.53 12.9 20.18 13.18L17.89 14.5L15.39 12L17.89 9.5L20.16 10.81ZM6.05 2.66L16.81 8.88L14.54 11.15L6.05 2.66Z"
                  />
                </svg>
                Google Play
              </a>
            </div>

            <div className="lp-mobile-app__download-center">
              <h3 id="lp-mobile-download-title" className="lp-mobile-app__download-title">
                Baixe o aplicativo
              </h3>
              <p className="lp-body lp-mobile-app__download-text">
                Escaneie o QR Code ou acesse diretamente na loja do seu dispositivo.
              </p>
            </div>

            <div className="lp-mobile-app__qr-item lp-mobile-app__qr-item--ios">
              <a
                href={SITE_MOBILE_APP.appStoreUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="lp-mobile-app__qr-link"
              >
                <img
                  src={SITE_MOBILE_APP.qrAppStore}
                  alt="QR Code para baixar o SimpleSST na App Store"
                  width={160}
                  height={160}
                  loading="lazy"
                  decoding="async"
                />
              </a>
              <p className="lp-mobile-app__qr-label">iPhone (iOS)</p>
              <a
                href={SITE_MOBILE_APP.appStoreUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="lp-btn lp-btn--secondary lp-btn--compact lp-mobile-app__store-btn"
              >
                <svg className="lp-store-btn__icon" viewBox="0 0 24 24" aria-hidden>
                  <path
                    fill="currentColor"
                    d="M18.71 19.5C17.88 20.29 17 20.16 16.12 19.75C15.19 19.33 14.36 19.31 13.38 19.75C12.28 20.26 11.53 20.19 10.72 19.5C6.15 15.17 6.63 8.29 11.76 8.03C12.67 8.09 13.33 8.45 13.96 8.51C14.84 8.33 15.68 7.96 16.64 8.05C17.73 8.17 18.55 8.58 19.18 9.28C16.25 11.03 16.88 15.12 19.5 16.23C19.01 17.45 18.34 18.64 18.71 19.5ZM13.03 8.01C12.88 6.17 14.31 4.58 16.01 4.4C16.27 6.54 14.13 8.09 13.03 8.01Z"
                  />
                </svg>
                App Store
              </a>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
