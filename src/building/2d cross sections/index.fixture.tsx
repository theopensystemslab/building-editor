import React from "react";
import crossSections, { ICrossSection } from "../crossSections";

const CrossSection: React.FC<ICrossSection> = ({ width, height, svgPath }) => (
  <svg
    viewBox={`-1 -1 ${width + 2} ${height + 2}`}
    style={{
      maxHeight: 400,
      maxWidth: "100%",
    }}
    transform={`scale(1,-1)`}
  >
    <path
      d={svgPath}
      stroke="black"
      vectorEffect="non-scaling-stroke"
      fill="yellow"
    />
  </svg>
);

export default Object.entries(crossSections).reduce(
  (acc, [type, section]: [string, ICrossSection]) => {
    acc[type] = <CrossSection type={type} {...section} />;
    return acc;
  },
  {}
);
