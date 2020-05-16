import anime from "animejs/lib/anime.es.js";
import { Plane, Vector3 } from "three";

const heights = [9, 4, 1];

export const clippingPlanes = [new Plane(new Vector3(0, -1, 0), heights[0])];

let i = 0;

export const toggleClippingHeight = () => {
  if (i < heights.length - 1) {
    i += 1;
  } else {
    i = 0;
  }

  anime({
    duration: 500,
    constant: heights[i],
    targets: clippingPlanes[0],
    easing: "easeOutElastic(1,0.9)",
  });
};
