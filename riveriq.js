let initialState = [
  ["bull"], ["cheese", "cheese"], ["boat", "poison", "hay", "tiger"]
];

function solveRiverCrossing(state, maxTurns) {
  let queue = [{ state, turnsLeft: maxTurns, path: [] }];
  let memo = new Set();

  while (queue.length > 0) {
    let { state, turnsLeft, path } = queue.shift();
    let currentState = JSON.stringify(state);

    if (turnsLeft === 0) {
      break;
    }
    if (state[0].includes("bull") && state[0].includes("hay") && state[0].includes("tiger") && state[0].includes("poison")) {
      console.log("SUCCESS", path);
      return;
    }
    if (memo.has(currentState)) {
      continue;
    }
    memo.add(currentState);

    let boatPosition = state.findIndex(island => island.includes("boat"));

    for (let member of state[boatPosition]) {
      if (member === "boat") continue;

      // Move to the left island
      if (boatPosition > 0) {
        let newState = JSON.parse(JSON.stringify(state));
        removeItemOnce(newState[boatPosition], "boat");
        removeItemOnce(newState[boatPosition], member);
        newState[boatPosition - 1].push("boat", member);
        if (isSafeSpace(newState)) {
          removeCheeses(newState);
          queue.push({ state: newState, turnsLeft: turnsLeft - 1, path: [...path, `Move ${member} left`] });
        }
      }

      // Move to the right island
      if (boatPosition < state.length - 1) {
        let newState = JSON.parse(JSON.stringify(state));
        removeItemOnce(newState[boatPosition], "boat");
        removeItemOnce(newState[boatPosition], member);
        newState[boatPosition + 1].push("boat", member);
        if (isSafeSpace(newState)) {
          removeCheeses(newState);
          queue.push({ state: newState, turnsLeft: turnsLeft - 1, path: [...path, `Move ${member} right`] });
        }
      }
    }

    // Move the boat alone
    if (boatPosition > 0) {
      let newState = JSON.parse(JSON.stringify(state));
      removeItemOnce(newState[boatPosition], "boat");
      newState[boatPosition - 1].push("boat");
      newState.forEach(island => island.sort());
      if (isSafeSpace(newState)) {
        removeCheeses(newState);
        queue.push({ state: newState, turnsLeft: turnsLeft - 1, path: [...path, "Move boat left"] });
      }
    }

    if (boatPosition < state.length - 1) {
      let newState = JSON.parse(JSON.stringify(state));
      removeItemOnce(newState[boatPosition], "boat");
      newState[boatPosition + 1].push("boat");
      newState.forEach(island => island.sort());
      if (isSafeSpace(newState)) {
        removeCheeses(newState);
        queue.push({ state: newState, turnsLeft: turnsLeft - 1, path: [...path, "Move boat right"] });
      }
    }
  }
  console.log("FAILURE");
}

function removeCheeses(state) {
  for (let island of state) {
    if (!island.includes("boat") && island.includes("cheese") && (island.includes("bull") || island.includes("tiger"))) {
      removeItemOnce(island, "cheese");
    }
  }
}

function isSafeSpace(state) {
  for (let island of state) {
    if (!island.includes("boat")) {
      let bullAndHay = island.includes("bull") && island.includes("hay") && !island.includes("cheese");
      let bullAndPoison = island.includes("bull") && island.includes("poison");
      let tigerAndPoison = island.includes("tiger") && island.includes("poison");
      let bullAndTiger = false; // Modify if needed

      if (bullAndHay || bullAndPoison || tigerAndPoison || bullAndTiger) {
        return false;
      }
    }
  }
  return true;
}

function removeItemOnce(arr, value) {
  var index = arr.indexOf(value);
  if (index > -1) {
    arr.splice(index, 1);
  }
  return arr;
}

solveRiverCrossing(initialState, 32);
