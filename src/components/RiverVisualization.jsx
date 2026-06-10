import { useCallback, useEffect, useRef, useState } from 'react';
import { buildIslandEntities, cargoEntityId } from '../entityLayout';
import { EntityIcon, BoatWithCargo } from './EntityIcon';

const ISLAND_COUNT = 3;
const ISLAND_LABELS = ['Island A (Goal)', 'Island B', 'Island C (Start)'];

// Inset island centers from the scene edges so the end islands aren't cropped.
const EDGE_PERCENT = 18;
const islandLeftPercent = (i) =>
  EDGE_PERCENT + (i / (ISLAND_COUNT - 1)) * (100 - 2 * EDGE_PERCENT);

function cargoFromStep(step) {
  if (!step) return null;
  const match = step.match(/^Move (.+) (left|right)$/);
  if (!match || match[1] === 'boat') return null;
  return match[1];
}

function getSceneScale(containerWidth) {
  return Math.min(2.6, Math.max(1, containerWidth / 520));
}

// 6 fixed slots × 30px + gaps fit within the 216px island width.
const SHORE_ENTITY_BASE = 30;

function shoreEntitySize(scale) {
  return Math.round(SHORE_ENTITY_BASE * scale);
}

const BOARD_MS = 420;
const CROSS_MS = 900;
const DISEMBARK_MS = 420;

function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

function IslandContents({
  island,
  islandIndex,
  transport,
  scale,
  destinationIsland,
  states,
  stateIndex,
  steps,
}) {
  const { phase, cargo, fromIsland, toIsland } = transport ?? {};
  const showBoarding = phase === 'board' && cargo && islandIndex === fromIsland;
  const showArriving = phase === 'disembark' && cargo && islandIndex === toIsland;

  const hideCargo =
    cargo && islandIndex === fromIsland && phase && phase !== 'board' ? cargo : null;

  const islandForLayout = showArriving && destinationIsland ? destinationIsland : island;
  const layoutStateIndex = showArriving ? stateIndex + 1 : stateIndex;

  let entities = buildIslandEntities(
    islandForLayout,
    islandIndex,
    states,
    layoutStateIndex,
    steps
  );

  const hiddenId =
    hideCargo && cargo
      ? cargoEntityId(cargo, fromIsland, states, stateIndex, steps)
      : null;
  if (hiddenId) {
    entities = entities.filter((e) => e.entityId !== hiddenId);
  }

  const boardingId =
    showBoarding && cargo
      ? cargoEntityId(cargo, fromIsland, states, stateIndex, steps)
      : null;
  const arrivingId =
    showArriving && cargo
      ? cargoEntityId(cargo, toIsland, states, stateIndex + 1, steps)
      : null;

  const size = shoreEntitySize(scale);

  return (
    <div className="shore-row">
      {entities.map(({ entity, entityId, slot }) => {
        let animClass = '';
        if (entityId === boardingId) animClass = 'shore-entity--jump-out';
        if (entityId === arrivingId) animClass = 'shore-entity--jump-in';

        return (
          <div
            key={entityId}
            className={`shore-entity ${animClass}`.trim()}
            style={{ '--entity-slot': slot }}
          >
            <EntityIcon type={entity} size={size} />
            <span className="entity-label">{entity}</span>
          </div>
        );
      })}
    </div>
  );
}

function TransportAnimator({
  fromIsland,
  toIsland,
  cargo,
  containerWidth,
  boatSize,
  scale,
  onComplete,
  onPhaseChange,
}) {
  const [phase, setPhase] = useState(cargo ? 'board' : 'cross');
  const [crossProgress, setCrossProgress] = useState(0);
  const rafRef = useRef(null);
  const startRef = useRef(null);
  const reportedPhaseRef = useRef(null);

  const hasCargo = Boolean(cargo);
  const startX = (islandLeftPercent(fromIsland) / 100) * containerWidth;
  const endX = (islandLeftPercent(toIsland) / 100) * containerWidth;

  const onCompleteRef = useRef(onComplete);
  const onPhaseChangeRef = useRef(onPhaseChange);
  onCompleteRef.current = onComplete;
  onPhaseChangeRef.current = onPhaseChange;

  const reportPhase = (nextPhase) => {
    if (reportedPhaseRef.current === nextPhase) return;
    reportedPhaseRef.current = nextPhase;
    setPhase(nextPhase);
    onPhaseChangeRef.current?.({ phase: nextPhase, cargo, fromIsland, toIsland });
  };

  useEffect(() => {
    startRef.current = null;
    reportedPhaseRef.current = null;
    const totalMs = (hasCargo ? BOARD_MS + DISEMBARK_MS : 0) + CROSS_MS;
    const initialPhase = hasCargo ? 'board' : 'cross';
    reportPhase(initialPhase);

    const animate = (timestamp) => {
      if (!startRef.current) startRef.current = timestamp;
      const elapsed = timestamp - startRef.current;

      if (hasCargo && elapsed < BOARD_MS) {
        reportPhase('board');
        setCrossProgress(0);
      } else if (elapsed < (hasCargo ? BOARD_MS : 0) + CROSS_MS) {
        const crossElapsed = elapsed - (hasCargo ? BOARD_MS : 0);
        const t = easeInOut(Math.min(crossElapsed / CROSS_MS, 1));
        reportPhase('cross');
        setCrossProgress(t);
      } else if (hasCargo && elapsed < totalMs) {
        reportPhase('disembark');
        setCrossProgress(1);
      } else {
        onCompleteRef.current?.();
        return;
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [fromIsland, toIsland, cargo, hasCargo]);

  const x =
    phase === 'board'
      ? startX
      : phase === 'disembark'
        ? endX
        : startX + (endX - startX) * crossProgress;

  const bob = phase === 'cross' ? Math.sin(crossProgress * Math.PI * 4) * 4 * scale : 0;

  const passengers = cargo ? [cargo] : [];
  const passengerAnim =
    phase === 'board' ? 'jump-in' : phase === 'disembark' ? 'jump-out' : '';

  return (
    <div
      className="animated-boat"
      style={{ left: x, transform: `translate(-50%, ${bob}px)` }}
    >
      <BoatWithCargo
        passengers={passengers}
        size={boatSize}
        scale={scale}
        passengerAnim={passengerAnim}
      />
    </div>
  );
}

export function RiverVisualization({ states, steps, currentStep, animating, onAnimationComplete }) {
  const riverRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(600);
  const [transport, setTransport] = useState(null);

  const fromIndex = Math.max(0, currentStep - 1);
  const toIndex = currentStep;
  const fromState = states[fromIndex] ?? states[0];
  const toState = states[toIndex] ?? fromState;

  const fromBoatIsland = fromState.findIndex((island) => island.includes('boat'));
  const toBoatIsland = toState.findIndex((island) => island.includes('boat'));
  const boatIsMoving = animating && fromBoatIsland !== toBoatIsland;

  const activeStep = currentStep > 0 ? steps[currentStep - 1] : null;
  const movingCargo = animating ? cargoFromStep(activeStep) : null;

  useEffect(() => {
    const update = () => {
      if (riverRef.current) setContainerWidth(riverRef.current.offsetWidth);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  useEffect(() => {
    if (!animating) setTransport(null);
  }, [animating]);

  const displayState = animating ? fromState : toState;
  const displayStateIndex = animating ? fromIndex : toIndex;

  const dockedBoatIsland = displayState.findIndex((island) => island.includes('boat'));
  const sceneScale = getSceneScale(containerWidth);
  const boatSize = Math.round(96 * sceneScale);

  const handleTransportComplete = useCallback(() => {
    setTransport(null);
    onAnimationComplete();
  }, [onAnimationComplete]);

  return (
    <div className="river-viz bevel-card">
      <div
        className="river-scene"
        ref={riverRef}
        style={{ '--scene-scale': sceneScale }}
      >
        <div className="sky" />

        {ISLAND_LABELS.map((label, i) => (
          <div
            key={i}
            className="island-column"
            style={{ left: `${islandLeftPercent(i)}%` }}
          >
            <div className="island-label">{label}</div>
            <div className="island-entities">
              <IslandContents
                island={displayState[i]}
                islandIndex={i}
                transport={boatIsMoving ? transport : null}
                scale={sceneScale}
                destinationIsland={toState[i]}
                states={states}
                stateIndex={displayStateIndex}
                steps={steps}
              />
            </div>
            <div className="island-ground">
              <div className="island-grass" />
            </div>
          </div>
        ))}

        <div className="water">
          <div className="water-tide water-tide--back" />
          <div className="water-tide water-tide--mid" />
          <div className="water-wave water-wave--1" />
          <div className="water-wave water-wave--2" />
          <div className="water-wave water-wave--3" />
          <div className="water-shimmer" />
        </div>

        {!boatIsMoving && dockedBoatIsland >= 0 && (
          <div
            className="boat-stationary"
            style={{ left: `${islandLeftPercent(dockedBoatIsland)}%` }}
          >
            <BoatWithCargo passengers={[]} size={boatSize} scale={sceneScale} />
          </div>
        )}

        {boatIsMoving && (
          <TransportAnimator
            fromIsland={fromBoatIsland}
            toIsland={toBoatIsland}
            cargo={movingCargo}
            containerWidth={containerWidth}
            boatSize={boatSize}
            scale={sceneScale}
            onPhaseChange={setTransport}
            onComplete={handleTransportComplete}
          />
        )}
      </div>

      <div className="state-readout">
        <span className="state-readout-label">Current state:</span>
        {toState.map((island, i) => (
          <span key={i} className="state-chip">
            [{island.join(', ') || 'empty'}]
          </span>
        ))}
      </div>
    </div>
  );
}
