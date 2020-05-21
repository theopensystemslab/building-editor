import Cytoscape from "cytoscape";
import COSEBilkent from "cytoscape-cose-bilkent";
import { Graph } from "graphlib";
// import dagre from "cytoscape-dagre";
// import spread from "cytoscape-spread";
// import euler from "cytoscape-euler";
import React from "react";
import CytoscapeComponent from "react-cytoscapejs";
import { patterns, relationships } from "./list.json";

Cytoscape.use(COSEBilkent);
// Cytoscape.use(dagre);
// Cytoscape.use(spread);
// Cytoscape.use(euler);

const g = new Graph();

const elements = [
  ...Object.entries(patterns).map(([k, v]) => {
    g.setNode(k);
    return { data: { id: k, label: k.split("__")[1].replace(/_/gi, " ") } };
  }),
  ...relationships.map(([source, target, label]) => {
    g.setEdge(source, target);
    return {
      data: {
        source,
        target,
        label,
      },
    };
  }),
];

// console.log(g.nodes());
console.log(g.nodeEdges("110__main_entrance"));

class PatternGraph extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    let layout: any;

    layout = {
      name: "cose-bilkent",
      padding: 10,
      animate: false,
      nodeRepulsion: 9000,
      idealEdgeLength: 80,
      nestingFactor: 0.8,
      tilingPaddingVertical: 20,
      tilingPaddingHorizontal: 50,
    };

    // layout = {
    //   name: "dagre",
    //   rankDir: "LR",
    //   fit: true,
    //   spacingFactor: 2,
    // };

    // layout = {
    //   name: "spread",
    // };

    // layout = {
    //   name: "euler",
    // };

    return (
      <CytoscapeComponent
        elements={elements}
        style={{ width: 1200, height: 1000 }}
        layout={layout}
      />
    );
  }
}

export default PatternGraph;
