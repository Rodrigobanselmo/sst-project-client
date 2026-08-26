function ImageSourceIcon() {
  return (
    <svg className="lp-pres-flow__source-pict" viewBox="0 0 24 24" aria-hidden>
      <rect x="4.2" y="6.2" width="15.6" height="11.6" rx="1.4" />
      <circle cx="9.1" cy="10.4" r="1.35" />
      <path d="M6.4 16.2 10.2 12.6 13.1 15.1 15.4 13.2 17.8 16.2" />
    </svg>
  );
}

function ProcessorIcon() {
  return (
    <svg className="lp-pres-flow__cpu-icon" viewBox="0 0 32 32" fill="none" aria-hidden>
      <rect x="8" y="8" width="16" height="16" rx="1.4" fill="#ffffff" />
      <rect x="10.4" y="10.4" width="11.2" height="11.2" rx="0.6" />
      <path d="M12.2 13.2h7.6M12.2 16h4.6M16.8 16v4.2" />
      <path d="M12 4.2v3.2M16 4.2v3.2M20 4.2v3.2M12 24.6v3.2M16 24.6v3.2M20 24.6v3.2M4.2 12h3.2M4.2 16h3.2M4.2 20h3.2M24.6 12h3.2M24.6 16h3.2M24.6 20h3.2" />
    </svg>
  );
}

export function PresentationFlowCircuit() {
  return (
    <div className="lp-pres-flow__circuit" aria-hidden>
      <svg className="lp-pres-flow__circuit-map" viewBox="0 0 700 50" preserveAspectRatio="none">
        <path className="lp-pres-flow__circuit-trace" d="M16 12 H28 V20 H41" />
        <path className="lp-pres-flow__circuit-trace" d="M35 12 H41" />
        <path className="lp-pres-flow__circuit-trace" d="M16 38 H28 V30 H41" />
        <path className="lp-pres-flow__circuit-trace" d="M35 38 H41" />
        <path
          className="lp-pres-flow__circuit-bus"
          d="M62 25 H188 V18 H262 V25 H338 V20 H422 V28 H508 V18 H588 V25 H662"
        />
        <path
          className="lp-pres-flow__circuit-drop"
          d="M150 25 V46 M230 18 V46 M300 25 V46 M380 20 V46 M460 28 V46 M548 18 V46 M630 25 V46"
        />
      </svg>

      <div className="lp-pres-flow__sources">
        <span className="lp-pres-flow__source is-word">W</span>
        <span className="lp-pres-flow__source is-excel">X</span>
        <span className="lp-pres-flow__source is-pdf">PDF</span>
        <span className="lp-pres-flow__source is-image">
          <ImageSourceIcon />
        </span>
      </div>

      <span className="lp-pres-flow__cpu">
        <ProcessorIcon />
      </span>

      <span className="lp-pres-flow__circuit-pad is-accent" style={{ left: '37.4%' }} />
      <span className="lp-pres-flow__circuit-pad" style={{ left: '84%' }} />

      <img
        src="/site/simplesst-logo-negativo-b.png"
        alt=""
        className="lp-pres-flow__brand"
        decoding="async"
      />
    </div>
  );
}
