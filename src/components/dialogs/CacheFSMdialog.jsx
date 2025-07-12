import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { states, transitions } from "../../assets/cacheStates";

const width = 800;

const CacheFSM = ({ path, label, onClose, showTransitions }) => {
  const svgRef = useRef();
  const isInline = !onClose;


  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const gContainer = svg.append("g").attr("class", "graph");

    const gLinks = gContainer.append("g").attr("class", "links");
    const gSelfLinks = gContainer.append("g").attr("class", "self-links");
    const gNodes = gContainer.append("g").attr("class", "nodes");
    const gLabels = gContainer.append("g").attr("class", "labels");

    const usedStateSet = new Set();
    transitions.forEach(t => {
      usedStateSet.add(t.from);
      usedStateSet.add(t.to);
    });

    const nodes = states
      .filter(id => usedStateSet.has(id))
      .map(id => ({ id }));

    const nodeMap = Object.fromEntries(nodes.map(n => [n.id, n]));

    const rawLinks = transitions.map(t => ({
      source: nodeMap[t.from],
      target: nodeMap[t.to],
      label: t.label,
      input: t.input
    }));

    const grouped = {};
    rawLinks.forEach(link => {
      const key = `${link.source.id}->${link.target.id}`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(link);
    });

    const links = [];
    Object.values(grouped).forEach(group => {
      group.forEach((link, i) => {
        link.index = i;
        link.total = group.length;
        links.push(link);
      });
    });

    const normalLinks = links.filter(d => d.source !== d.target);
    const selfLinks = links.filter(d => d.source === d.target);

    svg.append("defs").append("marker")
      .attr("id", "arrow")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 34)
      .attr("refY", -0.75)
      .attr("markerWidth", 8)
      .attr("markerHeight", 8)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", "#444");

    const colorMap = {
      I: "#d9534f",
      V: "#5bc0de",
      M: "#5cb85c",
      MP: "#f0ad4e"
    };

    const link = gLinks.selectAll("path")
      .data(normalLinks)
      .enter().append("path")
      .attr("fill", "none")
      .attr("stroke", "#666")
      .attr("stroke-width", 2)
      .attr("marker-end", "url(#arrow)");

    const selfLink = gSelfLinks.selectAll("path")
      .data(selfLinks)
      .enter().append("path")
      .attr("fill", "none")
      .attr("stroke", "#666")
      .attr("stroke-width", 2);

    const node = gNodes.selectAll("circle")
      .data(nodes)
      .enter().append("circle")
      .attr("r", 40)
      .attr("fill", d => colorMap[d.id] || "#007acc")
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)
      .call(d3.drag()
        .on("start", (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on("drag", (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on("end", (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        })
      );

    const stateLabels = gNodes.selectAll("text.state")
      .data(nodes)
      .enter().append("text")
      .attr("class", "state")
      .attr("text-anchor", "middle")
      .attr("dy", ".35em")
      .text(d => d.id)
      .style("fill", "#fff")
      .style("font-weight", "bold")
      .style("font-size", "16px")
      .style("font-family", "Segoe UI, sans-serif");

    const transitionLabels = gLabels.selectAll("text.label")
      .data(links)
      .enter().append("text")
      .attr("class", "label")
      .attr("font-size", 13)
      .attr("text-anchor", "middle")
      .attr("fill", "#7F00FF")
      .style("font-family", "Segoe UI, sans-serif")
      .text(d => d.label);

    const positions = {
      I: { x: 300, y: 400 },
      MP: { x: 200, y: 200 },
      V: { x: 500, y: 100 },
      M: { x: 600, y: 350 }
    };

    nodes.forEach(n => {
      n.x = positions[n.id].x;
      n.y = positions[n.id].y;
      n.fx = positions[n.id].x;
      n.fy = positions[n.id].y;
    });

    const simulation = d3.forceSimulation(nodes)
      .force("charge", d3.forceManyBody().strength(-600))
      .force("center", d3.forceCenter(width / 2, 300))
      .force("link", d3.forceLink(normalLinks).id(d => d.id).distance(200))
      .force("collide", d3.forceCollide(60))
      .on("tick", ticked);

    function ticked() {
      node.attr("cx", d => d.x).attr("cy", d => d.y);
      stateLabels.attr("x", d => d.x).attr("y", d => d.y);

      link.attr("d", d => {
        const dx = d.target.x - d.source.x;
        const dy = d.target.y - d.source.y;
        const offset = (d.index - (d.total - 1) / 2) * 30;
        const norm = Math.sqrt(dx * dx + dy * dy);
        const offsetX = (dy / norm) * offset;
        const offsetY = -(dx / norm) * offset;
        const mx = (d.source.x + d.target.x) / 2 + offsetX;
        const my = (d.source.y + d.target.y) / 2 + offsetY;
        return `M${d.source.x},${d.source.y} Q${mx},${my} ${d.target.x},${d.target.y}`;
      });

      selfLink.attr("d", d => {
        const x = d.source.x;
        const y = d.source.y;
        const r = 45 + d.index * 10;
        return `M ${x} ${y} C ${x - r} ${y - r * 2}, ${x + r} ${y - r * 2}, ${x} ${y - 1}`;
      });

      const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

      transitionLabels
        .attr("x", d => {
          if (d.source === d.target) return d.source.x;
          const dx = d.target.x - d.source.x;
          const dy = d.target.y - d.source.y;
          const offset = (d.index - (d.total - 1) / 2) * 30;
          const norm = Math.sqrt(dx * dx + dy * dy);
          const offsetX = (dy / norm) * offset;
          return (d.source.x + d.target.x) / 2 + offsetX;
        })
        .attr("y", d => {
          if (d.source === d.target) return d.source.y - 70 - d.index * 20;
          const dx = d.target.x - d.source.x;
          const dy = d.target.y - d.source.y;
          const offset = (d.index - (d.total - 1) / 2) * 30;
          const norm = Math.sqrt(dx * dx + dy * dy);
          const offsetY = -(dx / norm) * offset;
          const yMid = (d.source.y + d.target.y) / 2 + offsetY;
          const minY = Math.min(d.source.y, d.target.y) - 60;
          const maxY = Math.max(d.source.y, d.target.y) + 40;
          return clamp(yMid, minY, maxY);
        });
    }

    function highlightPath(pathStates, label) {
      link.classed("highlight", false);
      selfLink.classed("highlight", false);
      node.classed("highlight-node", false);
      transitionLabels.classed("highlight-label", false);

      for (let i = 0; i < pathStates.length - 1; i++) {
        const from = pathStates[i];
        const to = pathStates[i + 1];

        const allMatches = links.filter(
          l => l.source.id === from && l.target.id === to && l.input.trim().toLowerCase() === label[i].trim().toLowerCase()
        );

        const match = allMatches[0];
        if (match) {
          const matchFn = d =>
            d.source.id === from &&
            d.target.id === to &&
            d.input.trim().toLowerCase() === label[i].trim().toLowerCase();

          if (from === to) {
            selfLink.filter(matchFn)
              .attr("stroke", "#ffa500")
              .attr("stroke-width", 4)
              .attr("filter", "drop-shadow(0 0 5px #e04af0)");
          } else {
            link.filter(matchFn)
              .attr("stroke", "#ffa500")
              .attr("stroke-width", 4)
              .attr("filter", "drop-shadow(0 0 5px #e04af0)");
          }

          transitionLabels.filter(matchFn)
            .attr("fill", "#e04af0")
            .style("filter", "drop-shadow(0 0 5px #e04af0)")
            .style("font-weight", "bold");

          node.filter(d => d.id === from || d.id === to)
            .attr("stroke", "#6ef6e870")
            .attr("stroke-width", 4)
            .attr("filter", "drop-shadow(0 0 5px #ee6bf5)");
        }
      }
    }

    if (path?.length >= 1 && showTransitions) highlightPath(path, label);

    // ✅ Resize SVG height to fit content tightly
    setTimeout(() => {
      const svgEl = svgRef.current;
      const gElement = svgEl.querySelector("g.graph");
      if (gElement) {
        const bbox = gElement.getBBox();
        svgEl.setAttribute("viewBox", `0 0 ${width} ${bbox.y + bbox.height + 20}`);
      }
    }, 500);

    return () => simulation.stop();
  }, [path, label]);

  return isInline ? (
  <div className="w-full max-h-[400px] overflow-auto rounded-md border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2">
    <svg
      ref={svgRef}
      className="w-full h-auto mx-auto block"
      preserveAspectRatio="xMidYMid meet"
    />
  </div>
) : (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
    <div
      onClick={(e) => e.stopPropagation()}
      className="relative bg-white dark:bg-zinc-900 rounded-xl shadow-lg w-[90vw] max-w-[1000px] max-h-[90vh] overflow-auto p-6"
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-500 hover:text-black dark:hover:text-white"
      >
        ✕
      </button>

      <h2 className="text-xl font-bold mb-1.5 text-center text-gray-800 dark:text-white">
        {!showTransitions ? "Cache Finite State Machine" : "Cache State Transition"}
      </h2>

      <div className="rounded-md border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2 overflow-auto">
        <svg ref={svgRef} width={width} className="mx-auto block" />
      </div>
    </div>
  </div>
);

};

export default CacheFSM;