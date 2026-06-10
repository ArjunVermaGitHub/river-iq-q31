/** Fixed horizontal slot for each entity — positions never change when neighbors add/remove. */
export const ENTITY_SLOT = {
  bull: 0,
  tiger: 1,
  'cheese-0': 2,
  'cheese-1': 3,
  hay: 4,
  poison: 5,
};

export const SHORE_SLOT_COUNT = 6;

function findInitialCheeseIsland(state, nth) {
  let seen = 0;
  for (let i = 0; i < state.length; i++) {
    const n = state[i].filter((x) => x === 'cheese').length;
    if (seen + n > nth) return i;
    seen += n;
  }
  return -1;
}

function countType(arr, type) {
  return arr.filter((x) => x === type).length;
}

/**
 * Track cheese-0 / cheese-1 across states. When one is eaten on an island,
 * only that identity is removed (removeItemOnce eats the first cheese in the array).
 */
export function getCheeseIslandsAtState(states, stateIndex, steps) {
  let cheese0Island = findInitialCheeseIsland(states[0], 0);
  let cheese1Island = findInitialCheeseIsland(states[0], 1);

  for (let s = 1; s <= stateIndex; s++) {
    const step = steps[s - 1];
    const match = step?.match(/^Move (.+) (left|right)$/);
    if (!match) continue;

    const [, entity, dir] = match;
    const prev = states[s - 1];
    const curr = states[s];
    const delta = dir === 'left' ? -1 : 1;

    if (entity === 'cheese') {
      const boatIsland = prev.findIndex((island) => island.includes('boat'));
      const destIsland = boatIsland + delta;
      const c0Here = cheese0Island === boatIsland && prev[boatIsland].includes('cheese');
      const c1Here = cheese1Island === boatIsland && prev[boatIsland].includes('cheese');

      if (c0Here && c1Here) {
        cheese0Island = destIsland;
      } else if (c0Here) {
        cheese0Island = destIsland;
      } else if (c1Here) {
        cheese1Island = destIsland;
      }
    }

    const prevTotal = countType(prev.flat(), 'cheese');
    const currTotal = countType(curr.flat(), 'cheese');
    if (prevTotal > currTotal) {
      for (let i = 0; i < curr.length; i++) {
        const lost = countType(prev[i], 'cheese') - countType(curr[i], 'cheese');
        if (lost !== 1) continue;

        if (cheese0Island === i && cheese1Island === i) {
          cheese0Island = -1;
        } else if (cheese0Island === i) {
          cheese0Island = -1;
        } else if (cheese1Island === i) {
          cheese1Island = -1;
        }
      }
    }
  }

  return { cheese0Island, cheese1Island };
}

export function cargoEntityId(cargo, islandIndex, states, stateIndex, steps) {
  if (!cargo) return null;
  if (cargo !== 'cheese') return cargo;

  const { cheese0Island, cheese1Island } = getCheeseIslandsAtState(states, stateIndex, steps);
  if (cheese0Island === islandIndex) return 'cheese-0';
  if (cheese1Island === islandIndex) return 'cheese-1';
  return 'cheese-0';
}

/**
 * Entities present on an island, each with a fixed slot index (only rendered when present).
 */
export function buildIslandEntities(island, islandIndex, states, stateIndex, steps) {
  const onShore = island.filter((e) => e !== 'boat');
  const cheeseCount = countType(onShore, 'cheese');
  const { cheese0Island, cheese1Island } = getCheeseIslandsAtState(states, stateIndex, steps);
  const entities = [];

  const add = (entity, entityId) => {
    entities.push({ entity, entityId, slot: ENTITY_SLOT[entityId] });
  };

  if (onShore.includes('bull')) add('bull', 'bull');
  if (onShore.includes('tiger')) add('tiger', 'tiger');

  if (cheese0Island === islandIndex && cheese0Island >= 0 && cheeseCount > 0) {
    add('cheese', 'cheese-0');
  }
  if (cheese1Island === islandIndex && cheese1Island >= 0) {
    const c0AlsoHere = cheese0Island === islandIndex && cheese0Island >= 0;
    if (cheeseCount >= 2 || !c0AlsoHere) {
      add('cheese', 'cheese-1');
    }
  }

  if (onShore.includes('hay')) add('hay', 'hay');
  if (onShore.includes('poison')) add('poison', 'poison');

  return entities;
}
