import { useEffect } from 'react';
import { SiteFooter } from './components/SiteFooter';
import { SiteHeader } from './components/SiteHeader';
import { SiteReliefStrip } from './components/SiteReliefStrip';
import { SiteAudienceSection } from './components/sections/SiteAudienceSection';
import { SiteContactSection } from './components/sections/SiteContactSection';
import { SiteCreatedForSection } from './components/sections/SiteCreatedForSection';
import { SiteDifferentialsSection } from './components/sections/SiteDifferentialsSection';
import { SiteHeroSection } from './components/sections/SiteHeroSection';
import { SiteMainHeroSection } from './components/sections/SiteMainHeroSection';
import { SiteMaterialsSection } from './components/sections/SiteMaterialsSection';
import { SiteMobileAppSection } from './components/sections/SiteMobileAppSection';
import { SiteModulesSection } from './components/sections/SiteModulesSection';
import { SiteProblemsSection } from './components/sections/SiteProblemsSection';
import { SitePsychosocialSection } from './components/sections/SitePsychosocialSection';

export function SitePage() {
  useEffect(() => {
    document.documentElement.classList.add('lp-scroll');
    return () => document.documentElement.classList.remove('lp-scroll');
  }, []);

  return (
    <div className="lp">
      <SiteHeader />
      <main className="lp-main">
        <SiteMainHeroSection />
        <SiteCreatedForSection />
        <SiteProblemsSection />
        <SiteDifferentialsSection />
        <SitePsychosocialSection />
        <SiteModulesSection />
        <SiteReliefStrip />
        <SiteHeroSection />
        <SiteAudienceSection />
        <SiteMaterialsSection />
        <SiteMobileAppSection />
        <SiteContactSection />
      </main>
      <SiteFooter />
    </div>
  );
}
