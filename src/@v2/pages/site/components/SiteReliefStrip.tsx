import { SITE_RELIEF_POINTS } from '../constants/site-content.constant';

export function SiteReliefStrip() {
  return (
    <div className="lp-relief" role="note">
      <div className="lp-wrap">{SITE_RELIEF_POINTS.join(' · ')}</div>
    </div>
  );
}
