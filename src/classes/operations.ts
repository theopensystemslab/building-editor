const expand = (delta: number) => {};
const extrude = (delta: number) => {};

const branch = () => {};
const merge = () => {};
const nest = () => {};

const bend = () => {};
const skew = () => {};
const split = () => {};
const twist = () => {};

const interlock = () => {};
const intersect = () => {};
const lift = () => {};
const lodge = () => {};
const overlap = () => {};
const rotate = () => {};
const shift = () => {};

export default {
  add: {
    single: {
      expand,
      extrude,
    },
    multiple: {
      branch,
      merge,
      nest,
    },
  },
  displace: {
    single: {
      bend,
      skew,
      split,
      twist,
    },
    multiple: {
      interlock,
      intersect,
      lift,
      lodge,
      overlap,
      rotate,
      shift,
    },
  },
};
