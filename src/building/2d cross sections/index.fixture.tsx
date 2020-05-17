import React from "react";
import crossSections, { ICrossSection } from "../crossSections";
import CrossSection from "./CrossSection";

export default Object.entries(crossSections).reduce(
  (acc, [type, section]: [string, ICrossSection]) => {
    acc[type] = (
      <div style={{ width: 400, height: 400 }}>
        <CrossSection {...section} />
      </div>
    );
    return acc;
  },
  {}
);
