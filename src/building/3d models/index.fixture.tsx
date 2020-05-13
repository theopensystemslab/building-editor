import React from "react";
import crossSections from "../crossSections";
import Module from "../Module";

export default Object.keys(crossSections).reduce((acc, type: string) => {
  acc[type] = (
    <Module type={type} gridPosition="0,0" cellWidth={0} cellLength={0} />
  );
  return acc;
}, {});
