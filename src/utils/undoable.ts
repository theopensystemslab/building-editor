import equals from "ramda/src/equals";

export interface Undoable<T> {
  _current: T;
  _prevs: Array<T>;
  _nexts: Array<T>;
}

export const create = <T>(val: T): Undoable<T> => ({
  _current: val,
  _prevs: [],
  _nexts: [],
});

export const current = <T>(undoable: Undoable<T>): T => undoable._current;

export const setCurrent = <T>(
  undoable: Undoable<T>,
  newCurrent: T
): Undoable<T> =>
  !equals(newCurrent, current(undoable))
    ? {
        _current: newCurrent,
        _prevs: [undoable._current, ...undoable._prevs].slice(0, 30),
        _nexts: [],
      }
    : undoable;

export const replaceCurrent = <T>(
  undoable: Undoable<T>,
  newCurrent: T
): Undoable<T> => ({
  _current: newCurrent,
  _prevs: undoable._prevs,
  _nexts: undoable._nexts,
});

export const canUndo = <T>(undoable: Undoable<T>): boolean =>
  undoable._prevs.length > 0;

export const canRedo = <T>(undoable: Undoable<T>): boolean =>
  undoable._nexts.length > 0;

export const undo = <T>(undoable: Undoable<T>): Undoable<T> => {
  if (undoable._prevs.length === 0) {
    return undoable;
  }
  const [firstPrev, ...restPrevs] = undoable._prevs;
  return {
    _prevs: restPrevs,
    _current: firstPrev,
    _nexts: [undoable._current, ...undoable._nexts],
  };
};

export const redo = <T>(undoable: Undoable<T>): Undoable<T> => {
  if (undoable._nexts.length === 0) {
    return undoable;
  }
  const [firstNext, ...restNexts] = undoable._nexts;
  return {
    _prevs: [undoable._current, ...undoable._prevs],
    _current: firstNext,
    _nexts: restNexts,
  };
};
