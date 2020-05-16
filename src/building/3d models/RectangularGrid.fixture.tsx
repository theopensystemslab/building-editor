import React from "react";
import RectangularGrid from "../../shared/RectangularGrid";

export default {
  Grid: (
    <RectangularGrid
      z={{ cells: 30, size: 10 }}
      x={{ cells: 30, size: 10, subDivisions: [2, 4, 6, 8] }}
      color="#ddd"
    />
  ),
};
