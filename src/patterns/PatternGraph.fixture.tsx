import Cytoscape from "cytoscape";
import COSEBilkent from "cytoscape-cose-bilkent";
import { Graph } from "graphlib";
// import dagre from "cytoscape-dagre";
// import spread from "cytoscape-spread";
// import euler from "cytoscape-euler";
import React, { useEffect, useRef, useState } from "react";
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

const PatternGraph = () => {
  const container = useRef(null);
  const [cy, setCy] = useState<any | undefined>();
  const [current, setCurrent] = useState<string | undefined>();
  const [filter, setFilter] = useState<string>("");

  useEffect(() => {
    const cy = Cytoscape({
      container: container.current,
      elements,
      layout: {
        name: "cose-bilkent",
        padding: 10,
        animate: false,
        nodeRepulsion: 9000,
        idealEdgeLength: 80,
        nestingFactor: 0.8,
        tilingPaddingVertical: 20,
        tilingPaddingHorizontal: 50,
      },
      style: [
        {
          selector: "node",
          style: {
            label: "data(label)",
          },
        },
      ],
    });

    cy.on("tap", (e) => {
      try {
        e.target.id();
      } catch (e) {
        setCurrent(undefined);
        cy.edges().forEach((edge) => edge.style("display", "element"));
        cy.nodes().forEach((node) => {
          node.style("display", "element");
        });
      }

      cy.fit(cy.nodes().visible(), 100);
    });

    cy.nodes().on("tap", (e) => {
      setFilter("");
      setCurrent(e.target.id());

      cy.edges().forEach((edge) => edge.style("display", "none"));
      cy.nodes().forEach((node) => node.style("display", "none"));

      e.target.connectedEdges().forEach((edge) => {
        edge.style("display", "element");
        edge.connectedNodes().forEach((node) => {
          node.style("display", "element");
        });
      });

      cy.fit(cy.nodes().visible(), 100);
    });

    setCy(cy);

    return () => {
      cy.removeListener("tap");
    };
  }, []);

  useEffect(() => {
    if (!cy) return;

    const ids = Object.entries(patterns)
      .filter(([id, { description }]: any) => {
        return (
          id.includes(filter) || (description && description.includes(filter))
        );
      })
      .map(([k]) => k);

    if (filter) {
      cy.edges().forEach((edge) => edge.style("display", "none"));
      cy.nodes().forEach((node) => {
        node.deselect();
        node.style("display", "none");
      });

      cy.nodes()
        .filter((n) => ids.includes(n.id()))
        .forEach((node) => {
          node.style("display", "element");
          node.select();
          node.connectedEdges().forEach((edge) => {
            edge.style("display", "element");
            edge.connectedNodes().forEach((node) => {
              node.style("display", "element");
            });
          });
        });
    } else {
      cy.edges().forEach((edge) => edge.style("display", "element"));
      cy.nodes().forEach((node) => {
        node.deselect();
        node.style("display", "element");
      });
    }

    cy.fit(cy.nodes().visible(), 100);
  }, [filter]);

  return (
    <>
      <input
        value={filter.replace(/_/gi, " ")}
        onChange={(e) => setFilter(e.target.value.replace(/ /gi, "_"))}
      />
      <div style={{ width: 1200, height: 700 }} ref={container} />

      {current && (
        <>
          <h1>
            {Number(current.split("__")[0])}:{" "}
            {current.split("__")[1].replace(/_/gi, " ")}
          </h1>
          <pre style={{ whiteSpace: "pre-wrap" }}>
            {JSON.stringify(patterns[current], null, 2)}
          </pre>
        </>
      )}
    </>

    // <CytoscapeComponent
    //   cy={(_cy) => {
    //     cy = _cy;
    //     // setCy(cy);
    //   }}
    //   elements={elements}
    //   style={{ width: 1200, height: 1000 }}
    //   layout={layout}
    // />
  );
};

export default PatternGraph;
