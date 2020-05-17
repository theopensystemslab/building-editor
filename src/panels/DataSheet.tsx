import React from "react";
import ReactDataSheet from "react-datasheet";
import CrossSection from "../building/2d cross sections/CrossSection";
import crossSections from "../building/crossSections";

interface GridElement extends ReactDataSheet.Cell<GridElement, number> {
  value?: number | string;
  expr?: string;
  className?: string;
  readOnly?: boolean;
}

export enum CellFormatters {
  CURRENCY,
  MODULE,
}

class DataSheet extends ReactDataSheet<GridElement, number> {}

// const cellRenderer: ReactDataSheet.CellRenderer<GridElement, number> = (
//   props
// ) => {
//   const backgroundStyle =
//     props.cell.value && props.cell.value < 0 ? { color: "red" } : undefined;
//   return (
//     <td
//       style={backgroundStyle}
//       onMouseDown={props.onMouseDown}
//       onMouseOver={props.onMouseOver}
//       onDoubleClick={props.onDoubleClick}
//       className={classnames("cell", props.className)}
//     >
//       {props.children}
//     </td>
//   );
// };

const CurrencyFormatter = new Intl.NumberFormat("en-GB", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  // style: "currency",
  // currency: "EUR",
});

export const defaultDataSheetProps = {
  valueRenderer: (cell) => {
    switch (cell.formatter) {
      case CellFormatters.CURRENCY:
        return CurrencyFormatter.format(cell.value);
      default:
        return cell.value;
    }
  },
  valueViewer: (props) => {
    if (props.cell.formatter === CellFormatters.MODULE) {
      return (
        <div className="module">
          <div className="img">
            <CrossSection
              {...crossSections[props.value]}
              fill="black"
              stroke="none"
            />
          </div>
          <span>{props.value}</span>
        </div>
      );
    } else {
      return props.value;
    }
  },
  dataRenderer: (cell) => cell.expr,
  onContextMenu: (e, cell, i, j) => (cell.readOnly ? e.preventDefault() : null),
};

export default DataSheet;
