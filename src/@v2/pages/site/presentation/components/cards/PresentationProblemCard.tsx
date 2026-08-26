import { SITE_BRAND } from '../../../constants/site-brand.constant';
import { PRESENTATION_PROBLEM } from '../../constants/presentation.constant';
import { PRESENTATION_PROBLEM_ICONS } from './PresentationProblemIcons';

export function PresentationProblemCard() {
  const leftIssues = PRESENTATION_PROBLEM.issues.slice(0, 3);
  const rightIssues = PRESENTATION_PROBLEM.issues.slice(3);

  return (
    <section className="lp-pres-problem is-entering" aria-labelledby="lp-pres-problem-title">
      <header className="lp-pres-problem__header">
        <img
          src={SITE_BRAND.logoOnLight}
          alt="SimpleSST"
          className="lp-brand-logo lp-pres-problem__logo"
          decoding="async"
        />
        <p className="lp-pres-problem__index">02 · O problema</p>
      </header>

      <div className="lp-pres-problem__main">
        <div className="lp-pres-problem__hero">
          <div className="lp-pres-problem__intro">
            <p className="lp-pres-problem__kicker">{PRESENTATION_PROBLEM.kicker}</p>
            <h1 id="lp-pres-problem-title" className="lp-pres-problem__title">
              {PRESENTATION_PROBLEM.headlineBefore}
              <br />
              {PRESENTATION_PROBLEM.headlineAfter}{' '}
              <span className="lp-pres-problem__accent">{PRESENTATION_PROBLEM.headlineAccent}</span>
            </h1>
            <p className="lp-pres-problem__lead">{PRESENTATION_PROBLEM.lead}</p>
          </div>

          <div className="lp-pres-problem__chain" role="img" aria-label="Informação dispersa, retrabalho, perda de rastreabilidade e risco operacional">
            <svg
              className="lp-pres-problem__path"
              viewBox="0 0 90 200"
              preserveAspectRatio="xMinYMid meet"
              aria-hidden
            >
              <path
                className="lp-pres-problem__track"
                d="M16 16 C48 24 82 42 74 70 C66 94 10 104 18 128 C26 150 78 164 72 186"
                fill="none"
              />
              <circle className="lp-pres-problem__dot" cx="16" cy="16" r="4.2" />
              <circle className="lp-pres-problem__dot" cx="74" cy="70" r="4.2" />
              <circle className="lp-pres-problem__dot" cx="18" cy="128" r="4.2" />
              <circle className="lp-pres-problem__dot lp-pres-problem__dot--end" cx="72" cy="186" r="5.4" />
            </svg>
            <ol className="lp-pres-problem__chain-list">
              {PRESENTATION_PROBLEM.chain.map((item, index) => (
                <li key={item} className={index === 3 ? 'is-strong' : undefined}>
                  {item}
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="lp-pres-problem__issues">
          <ul className="lp-pres-problem__col">
            {leftIssues.map((issue) => {
              const Icon = PRESENTATION_PROBLEM_ICONS[issue.id];
              return (
                <li key={issue.id} className="lp-pres-problem__issue">
                  <span className="lp-pres-problem__mark" aria-hidden>
                    <Icon />
                    <span className="lp-pres-problem__badge" />
                  </span>
                  <div>
                    <h2 className="lp-pres-problem__issue-title">{issue.title}</h2>
                    <p className="lp-pres-problem__issue-copy">{issue.description}</p>
                  </div>
                </li>
              );
            })}
          </ul>

          <ul className="lp-pres-problem__col lp-pres-problem__col--offset">
            {rightIssues.map((issue) => {
              const Icon = PRESENTATION_PROBLEM_ICONS[issue.id];
              return (
                <li key={issue.id} className="lp-pres-problem__issue">
                  <span className="lp-pres-problem__mark" aria-hidden>
                    <Icon />
                    <span className="lp-pres-problem__badge" />
                  </span>
                  <div>
                    <h2 className="lp-pres-problem__issue-title">{issue.title}</h2>
                    <p className="lp-pres-problem__issue-copy">{issue.description}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <footer className="lp-pres-problem__footer">
        <p className="lp-pres-problem__closing">{PRESENTATION_PROBLEM.closing}</p>
      </footer>
    </section>
  );
}
