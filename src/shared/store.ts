import produce from "immer";
import { uniq } from "ramda";
import create from "zustand";
import { nextOddInt } from "../utils";
import grid from "./grid";

const GRID = grid("m");

export interface State {
  grid: {
    properties: {
      color: string;
      dimensions: {
        cellWidth: number;
        cellLength: number;
        numXCells?: number;
        numZCells?: number;
      };
    };
    occupiedCells: Record<
      string,
      {
        module?: string;
        rotation?: number;
      }
    >;
  };
}

/*
 * calculates size of grid so that there is always a 'padding'
 * of a single grid cell surrounding all of the occupied cells
 */
const calcSize = (x, i) => {
  const numbers = uniq(Object.keys(x).map((k) => Number(k.split(",")[i])));
  const largestAbsoluteNumber = Math.max.apply(null, numbers.map(Math.abs));

  return nextOddInt(Math.max(numbers.length, largestAbsoluteNumber * 2) + 2);
};

/*
 * wraps the store, writes static outputs to the store iself if dependencies
 * change, effectively caching the results
 */
const selectorMiddleware = (config) => (set, get, api) =>
  config(
    (args) => {
      const previousState = get().grid.occupiedCells;

      set(args);

      const currentState = get().grid.occupiedCells;

      if (JSON.stringify(previousState) !== JSON.stringify(currentState)) {
        set((state: State) => {
          state.grid.properties.dimensions.numXCells = calcSize(
            currentState,
            0
          );
          state.grid.properties.dimensions.numZCells = calcSize(
            currentState,
            1
          );
        });
      }
    },
    get,
    api
  );

export const [useStore, api] = create(
  selectorMiddleware((set) => ({
    grid: {
      properties: {
        color: "lightgray",
        dimensions: {
          cellWidth: GRID.x,
          cellLength: GRID.z,
        },
      },
      occupiedCells: {},
    },
    set: (fn) => set(produce(fn)),
  }))
);

// set the grid initial grid value AFTER creating the store
// so that the data gets processed by the selector middleware

api.getState().set((state: State) => {
  // try to load existing state from localStorage, otherwise use object below
  state.grid.occupiedCells = JSON?.parse(localStorage.getItem("cache")) || {
    "0,-1": {
      module: "A2_01",
    },
    "0,0": {
      module: "B2_01",
    },
    "0,1": {
      module: "C2_01",
    },
  };
});

// rudimentarily save state to localStorage if grid.occupiedCells changes

api.subscribe(
  (occupiedCells: State) => {
    localStorage.setItem("cache", JSON.stringify(occupiedCells));
  },
  (state) => state.grid.occupiedCells
);
