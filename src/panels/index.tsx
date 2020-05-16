import React from "react";
import EnergyPanel from "./energy";
import Container from "./PanelsContainer";
import StructurePanel from "./structure";

const Panel = () => (
  <Container>
    <StructurePanel />
    <EnergyPanel />
  </Container>
);

export default Panel;
