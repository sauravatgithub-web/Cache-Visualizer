import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { states, transitions } from "../assets/cacheStates";

const width = 800, height = 600;

const CacheFSM = ({ path, label }) => {
  const svgRef = useRef();

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const gLinks = svg.append("g").attr("class", "links");
    const gSelfLinks = svg.append("g").attr("class", "self-links");
    const gNodes = svg.append("g").attr("class", "nodes");
    const gLabels = svg.append("g").attr("class", "labels");

    const nodes = states.map(id => ({ id }));
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
      .attr("stroke-width", 2)
      // .attr("marker-end", "url(#arrow)");

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
      .attr("fill", "#333")
      .style("font-family", "Segoe UI, sans-serif")
      .text(d => d.label);

    const positions = {
      I: { x: 300, y: 500 },
      MP: { x: 200, y: 300 },
      V: { x: 500, y: 200 },
      M: { x: 600, y: 450 }
    };
    nodes.forEach(n => {
      n.x = positions[n.id].x;
      n.y = positions[n.id].y;
      n.fx = positions[n.id].x;
      n.fy = positions[n.id].y;
    });

    const simulation = d3.forceSimulation(nodes)
      .force("charge", d3.forceManyBody().strength(-600))
      .force("center", d3.forceCenter(width / 2, height / 2))
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
          return (d.source.y + d.target.y) / 2 + offsetY;
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
            selfLink
              .filter(matchFn)
              .attr("stroke", "#ffa500")
              .attr("stroke-width", 4)
              .attr("filter", "drop-shadow(0 0 5px #e04af0)");
          } else {
            link
              .filter(matchFn)
              .attr("stroke", "#ffa500")
              .attr("stroke-width", 4)
              .attr("filter", "drop-shadow(0 0 5px #e04af0)");
          }

          transitionLabels
            .filter(matchFn)
            .attr("fill", "#e04af0")
            .style("filter", "drop-shadow(0 0 5px #e04af0)")
            .style("font-weight", "bold");

          node
            .filter(d => d.id === from || d.id === to)
            .attr("stroke", "#6ef6e870")
            .attr("stroke-width", 4)
            .attr("filter", "drop-shadow(0 0 5px #ee6bf5)");
        }
      }
    }

    if (path && path.length >= 1) { highlightPath(path, label); }
    return () => simulation.stop();
  }, [path, label]);

  return <svg ref={svgRef} width={width} height={height}></svg>;
};

export default CacheFSM;
