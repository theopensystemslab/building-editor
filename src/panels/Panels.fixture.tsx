import React from "react";
import Panel from ".";
import EnergyPanel from "./energy";
import Container from "./PanelsContainer";
import StructurePanel from "./structure";

export default {
  "Energy Panel": (
    <Container>
      <EnergyPanel />
    </Container>
  ),
  "Structure Panel": (
    <Container>
      <StructurePanel />
    </Container>
  ),
  All: <Panel />,
};
