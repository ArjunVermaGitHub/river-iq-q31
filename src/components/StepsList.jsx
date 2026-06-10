import { useEffect, useRef } from 'react';

export function StepsList({ steps, currentStep, onStepClick }) {
  const listRef = useRef(null);
  const activeRef = useRef(null);

  useEffect(() => {
    const list = listRef.current;
    const active = activeRef.current;
    if (!list || !active) return;

    const listTop = list.scrollTop;
    const listHeight = list.clientHeight;
    const itemTop = active.offsetTop;
    const itemHeight = active.offsetHeight;
    const padding = 8;

    if (itemTop < listTop + padding) {
      list.scrollTo({ top: itemTop - padding, behavior: 'smooth' });
    } else if (itemTop + itemHeight > listTop + listHeight - padding) {
      list.scrollTo({
        top: itemTop + itemHeight - listHeight + padding,
        behavior: 'smooth',
      });
    }
  }, [currentStep]);

  return (
    <div className="steps-panel bevel-card">
      <h2>Solution Steps ({steps.length})</h2>
      <ol className="steps-list" ref={listRef}>
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isDone = index < currentStep;
          const isActive = index === currentStep - 1;

          let status = 'pending';
          if (isDone) status = 'done';
          if (isActive) status = 'active';

          return (
            <li
              key={index}
              ref={isActive ? activeRef : null}
              className={`step-item step-item--${status}`}
              onClick={() => onStepClick(stepNumber)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && onStepClick(stepNumber)}
            >
              <span className="step-number">{stepNumber}</span>
              <span className="step-text">{step}</span>
              {isDone && <span className="step-check">✓</span>}
              {isActive && <span className="step-pulse" />}
            </li>
          );
        })}
      </ol>
      {currentStep === 0 && (
        <p className="steps-hint">Press Play or click a step to begin</p>
      )}
      {currentStep > 0 && currentStep <= steps.length && (
        <p className="steps-progress">
          Step {currentStep} of {steps.length}
        </p>
      )}
      {currentStep > steps.length && (
        <p className="steps-success">All items safely crossed!</p>
      )}
    </div>
  );
}
