import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { RiverVisualization } from './components/RiverVisualization';
import { StepsList } from './components/StepsList';
import { initialState, solveRiverCrossing } from './solver';

const AUTO_PLAY_INTERVAL = 1400;
const THEME_STORAGE_KEY = 'river-iq-theme';

function getInitialTheme() {
  if (typeof window === 'undefined') return 'light';
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export default function App() {
  const solution = useMemo(() => {
    const start = performance.now();
    const result = solveRiverCrossing(initialState, 32);
    const solveTimeMs = Math.round(performance.now() - start);
    return { ...result, solveTimeMs };
  }, []);
  const { path: steps, states, success, solveTimeMs } = solution;

  const [currentStep, setCurrentStep] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [theme, setTheme] = useState(getInitialTheme);
  const playRef = useRef(null);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  }, []);

  const canAdvance = currentStep < steps.length && !animating;

  const advanceStep = useCallback(() => {
    if (currentStep >= steps.length || animating) return;
    setAnimating(true);
    setCurrentStep((s) => s + 1);
  }, [currentStep, steps.length, animating]);

  const onAnimationComplete = useCallback(() => {
    setAnimating(false);
  }, []);

  const goToStep = useCallback(
    (step) => {
      setPlaying(false);
      setAnimating(false);
      setCurrentStep(Math.max(0, Math.min(step, steps.length)));
    },
    [steps.length]
  );

  const reset = useCallback(() => {
    setPlaying(false);
    setAnimating(false);
    setCurrentStep(0);
  }, []);

  useEffect(() => {
    if (!playing || animating || !canAdvance) return;

    playRef.current = setTimeout(advanceStep, AUTO_PLAY_INTERVAL);
    return () => clearTimeout(playRef.current);
  }, [playing, animating, canAdvance, advanceStep, currentStep]);

  useEffect(() => {
    if (playing && currentStep >= steps.length) {
      setPlaying(false);
    }
  }, [playing, currentStep, steps.length]);

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header-top">
          <div className="app-header-titles">
            <h1>River IQ Puzzle</h1>
            <p className="subtitle">
              BFS solver visualized — watch each move tick off step by step
            </p>
          </div>
          <button
            type="button"
            className="btn btn-secondary theme-toggle"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
          >
            {theme === 'dark' ? '☀ Light' : '☾ Dark'}
          </button>
        </div>
        <div className="header-cards">
          <div className="problem-statement bevel-card">
            <h2 className="card-heading">The Puzzle</h2>
            <p>
              A farmer must ferry a <strong>bull</strong>, <strong>tiger</strong>, two blocks of{' '}
              <strong>cheese</strong>, a pile of <strong>hay</strong>, and some <strong>poison</strong>{' '}
              across the river. The boat holds only the farmer plus <strong>one item</strong> at a time.
            </p>
            <p>
              Never leave the bull alone with hay (unless cheese is there too), the bull alone with
              poison, or the tiger alone with poison. If a bull or tiger shares an island with cheese,
              the cheese is eaten. Get the bull, hay, tiger, and poison safely to <strong>Island A</strong>.
            </p>
          </div>
          <div className="implementation-card bevel-card">
            <h2 className="card-heading">Implementation</h2>
            <p>
              The puzzle is solved by a <strong>human-written BFS algorithm</strong> and visualized
              through <strong>vibe-coding</strong>. The full solution is generated on load in{' '}
              <strong>{solveTimeMs} ms</strong> and shown in the visualizer and step list below.
            </p>
            <p>
              <strong>Cursor</strong> was leveraged and guided to build the animation, layout, and
              entity art so the crossings read clearly. The solution steps and the current-state
              readout under the scene give a small peek into how the solver keeps track of each
              configuration as moves are applied.
            </p>
          </div>
        </div>
        {!success && <p className="error-banner">No solution found within turn limit.</p>}
      </header>

      <div className="controls">
        <button type="button" className="btn btn-secondary" onClick={reset} disabled={currentStep === 0 && !playing}>
          Reset
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setPlaying((p) => !p)}
          disabled={!success || currentStep >= steps.length}
        >
          {playing ? 'Pause' : 'Play'}
        </button>
        <button type="button" className="btn btn-primary" onClick={advanceStep} disabled={!canAdvance || !success}>
          Next Step →
        </button>
        <span className="control-status">
          {currentStep > 0 && currentStep <= steps.length
            ? steps[currentStep - 1]
            : playing
              ? 'Auto-playing…'
              : 'Ready'}
        </span>
      </div>

      <main className="main-layout">
        <RiverVisualization
          states={states}
          steps={steps}
          currentStep={currentStep}
          animating={animating}
          onAnimationComplete={onAnimationComplete}
        />
        <StepsList steps={steps} currentStep={currentStep} onStepClick={goToStep} />
      </main>

    </div>
  );
}
