import React from "react";
import { ICrossSection } from "../crossSections";

const CrossSection: React.FC<ICrossSection> = ({
  width,
  height,
  svgPath,
  stroke = "black",
  fill = "yellow",
}) => (
  <svg
    width="100%"
    height="100%"
    viewBox={`-1 -1 ${width + 2} ${height + 2}`}
    // style={{
    //   maxHeight: 400,
    //   maxWidth: "100%",
    // }}
    transform={`scale(1,-1)`}
  >
    <path
      d={svgPath}
      stroke={stroke}
      vectorEffect="non-scaling-stroke"
      fill={fill}
    />
  </svg>
);

export default CrossSection;
