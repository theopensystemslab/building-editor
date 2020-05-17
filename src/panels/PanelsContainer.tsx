import Drawer from "@material-ui/core/Drawer";
import React from "react";
import "react-datasheet/lib/react-datasheet.css";
import "./sheets.css";

const PanelsContainer: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <Drawer open onClose={console.log} anchor="right" variant="permanent">
      <div style={{ padding: 20, maxWidth: 400 }}>{children}</div>
    </Drawer>
  );
};

export default PanelsContainer;
