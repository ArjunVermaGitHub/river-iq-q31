export const initialState = [
  ['bull'],
  ['cheese', 'cheese'],
  ['boat', 'poison', 'hay', 'tiger'],
];

function removeItemOnce(arr, value) {
  const index = arr.indexOf(value);
  if (index > -1) {
    arr.splice(index, 1);
  }
  return arr;
}

function removeCheeses(state) {
  for (const island of state) {
    if (
      !island.includes('boat') &&
      island.includes('cheese') &&
      (island.includes('bull') || island.includes('tiger'))
    ) {
      // One cheese eaten per island per move — array length drops by 1 only.
      removeItemOnce(island, 'cheese');
    }
  }
}

function isSafeSpace(state) {
  for (const island of state) {
    if (!island.includes('boat')) {
      const bullAndHay =
        island.includes('bull') &&
        island.includes('hay') &&
        !island.includes('cheese');
      const bullAndPoison = island.includes('bull') && island.includes('poison');
      const tigerAndPoison = island.includes('tiger') && island.includes('poison');
      const bullAndTiger = false;

      if (bullAndHay || bullAndPoison || tigerAndPoison || bullAndTiger) {
        return false;
      }
    }
  }
  return true;
}

export function solveRiverCrossing(state, maxTurns) {
  const queue = [{ state, turnsLeft: maxTurns, path: [] }];
  const memo = new Set();

  while (queue.length > 0) {
    const { state: current, turnsLeft, path } = queue.shift();
    const currentState = JSON.stringify(current);

    if (turnsLeft === 0) {
      break;
    }

    if (
      current[0].includes('bull') &&
      current[0].includes('hay') &&
      current[0].includes('tiger') &&
      current[0].includes('poison')
    ) {
      return { success: true, path, states: buildStatesFromPath(state, path) };
    }

    if (memo.has(currentState)) {
      continue;
    }
    memo.add(currentState);

    const boatPosition = current.findIndex((island) => island.includes('boat'));

    for (const member of current[boatPosition]) {
      if (member === 'boat') continue;

      if (boatPosition > 0) {
        const newState = JSON.parse(JSON.stringify(current));
        removeItemOnce(newState[boatPosition], 'boat');
        removeItemOnce(newState[boatPosition], member);
        newState[boatPosition - 1].push('boat', member);
        if (isSafeSpace(newState)) {
          removeCheeses(newState);
          queue.push({
            state: newState,
            turnsLeft: turnsLeft - 1,
            path: [...path, `Move ${member} left`],
          });
        }
      }

      if (boatPosition < current.length - 1) {
        const newState = JSON.parse(JSON.stringify(current));
        removeItemOnce(newState[boatPosition], 'boat');
        removeItemOnce(newState[boatPosition], member);
        newState[boatPosition + 1].push('boat', member);
        if (isSafeSpace(newState)) {
          removeCheeses(newState);
          queue.push({
            state: newState,
            turnsLeft: turnsLeft - 1,
            path: [...path, `Move ${member} right`],
          });
        }
      }
    }

    if (boatPosition > 0) {
      const newState = JSON.parse(JSON.stringify(current));
      removeItemOnce(newState[boatPosition], 'boat');
      newState[boatPosition - 1].push('boat');
      newState.forEach((island) => island.sort());
      if (isSafeSpace(newState)) {
        removeCheeses(newState);
        queue.push({
          state: newState,
          turnsLeft: turnsLeft - 1,
          path: [...path, 'Move boat left'],
        });
      }
    }

    if (boatPosition < current.length - 1) {
      const newState = JSON.parse(JSON.stringify(current));
      removeItemOnce(newState[boatPosition], 'boat');
      newState[boatPosition + 1].push('boat');
      newState.forEach((island) => island.sort());
      if (isSafeSpace(newState)) {
        removeCheeses(newState);
        queue.push({
          state: newState,
          turnsLeft: turnsLeft - 1,
          path: [...path, 'Move boat right'],
        });
      }
    }
  }

  return { success: false, path: [], states: [cloneState(state)] };
}

function cloneState(state) {
  return state.map((island) => [...island]);
}

function applyMove(state, step) {
  const next = cloneState(state);
  const match = step.match(/^Move (.+) (left|right)$/);
  if (!match) return next;

  const [, entity, direction] = match;
  const delta = direction === 'left' ? -1 : 1;
  const boatPosition = next.findIndex((island) => island.includes('boat'));
  const target = boatPosition + delta;

  if (target < 0 || target >= next.length) return next;

  removeItemOnce(next[boatPosition], 'boat');
  if (entity !== 'boat') {
    removeItemOnce(next[boatPosition], entity);
    next[target].push('boat', entity);
  } else {
    next[target].push('boat');
  }

  next.forEach((island) => island.sort());
  removeCheeses(next);
  return next;
}

export function buildStatesFromPath(startState, path) {
  const states = [cloneState(startState)];
  let current = cloneState(startState);

  for (const step of path) {
    current = applyMove(current, step);
    states.push(cloneState(current));
  }

  return states;
}
