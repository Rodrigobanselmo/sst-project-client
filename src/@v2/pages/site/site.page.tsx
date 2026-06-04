import { SiteFooter } from './components/SiteFooter';
import { SiteHeader } from './components/SiteHeader';
import { SiteReliefStrip } from './components/SiteReliefStrip';
import { SiteAudienceSection } from './components/sections/SiteAudienceSection';
import { SiteContactSection } from './components/sections/SiteContactSection';
import { SiteDifferentialsSection } from './components/sections/SiteDifferentialsSection';
import { SiteHeroSection } from './components/sections/SiteHeroSection';
import { SiteMaterialsSection } from './components/sections/SiteMaterialsSection';
import { SiteModulesSection } from './components/sections/SiteModulesSection';
import { SiteProblemsSection } from './components/sections/SiteProblemsSection';
import { SitePsychosocialSection } from './components/sections/SitePsychosocialSection';

export function SitePage() {
  return (
    <div className="lp">
      <SiteHeader />
      <main className="lp-main">
        <SiteHeroSection />
        <SiteReliefStrip />
        <SiteProblemsSection />
        <SiteModulesSection />
        <SiteDifferentialsSection />
        <SitePsychosocialSection />
        <SiteAudienceSection />
        <SiteMaterialsSection />
        <SiteContactSection />
      </main>
      <SiteFooter />
    </div>
  );
}
