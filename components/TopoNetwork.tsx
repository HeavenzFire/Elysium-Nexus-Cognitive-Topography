import React, { useEffect, useRef, useMemo, useState } from 'react';
import * as d3 from 'd3';
import { ThinkerNode, Link, Archetype } from '../types';
import { RESONANCE_THRESHOLD } from '../constants';

interface TopoNetworkProps {
  nodes: ThinkerNode[];
  links: Link[];
  width: number;
  height: number;
  onNodeClick: (node: ThinkerNode) => void;
  selectedNodeId: string | null;
  timeMultiplier: number;
}

const ARCHETYPE_COLORS: Record<Archetype, string> = {
  [Archetype.LOGICIAN]: '#3B82F6', // Blue
  [Archetype.CREATOR]: '#EC4899', // Pink
  [Archetype.ETHICIST]: '#10B981', // Emerald
  [Archetype.STRATEGIST]: '#F59E0B', // Amber
  [Archetype.MYSTIC]: '#8B5CF6', // Purple
  [Archetype.VOID]: '#4B5563' // Dark Gray
};

export const TopoNetwork: React.FC<TopoNetworkProps> = ({ 
  nodes, 
  links, 
  width, 
  height, 
  onNodeClick,
  selectedNodeId,
  timeMultiplier
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  
  // Create a mutable copy of nodes for D3 to manipulate directly
  const simulationRef = useRef<d3.Simulation<ThinkerNode, undefined> | null>(null);

  const [hoveredNode, setHoveredNode] = useState<ThinkerNode | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | null>(null);

  // Background style based on speed
  const getBackgroundStyle = () => {
    if (timeMultiplier > 5) {
      // Fast / Hot
      return 'radial-gradient(circle at center, #2a0a0a 0%, #050000 100%)'; 
    } else if (timeMultiplier < 0.2) {
      // Slow / Cold
      return 'radial-gradient(circle at center, #0a0f2a 0%, #000205 100%)';
    } else {
      // Normal
      return 'radial-gradient(circle at center, #121216 0%, #050505 100%)';
    }
  };

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous render for clean slate on resize/init

    // Define gradients
    const defs = svg.append("defs");
    
    // Glow filter
    const filter = defs.append("filter")
      .attr("id", "glow");
    filter.append("feGaussianBlur")
      .attr("stdDeviation", "2.5")
      .attr("result", "coloredBlur");
    const feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "coloredBlur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");

    const g = svg.append("g");

    // Zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg.call(zoom);

    // Initial positioning
    nodes.forEach(node => {
        if (!node.x) node.x = width / 2 + (Math.random() - 0.5) * 50;
        if (!node.y) node.y = height / 2 + (Math.random() - 0.5) * 50;
    });

    const simulation = d3.forceSimulation<ThinkerNode>(nodes)
      .force("link", d3.forceLink<ThinkerNode, any>(links)
        .id(d => d.id)
        .distance(d => (d as any).strength > 1 ? 50 : 100) // Unifying links pull tighter
        .strength(d => (d as any).strength > 1 ? 0.8 : 0.2) // Unifying links are stronger
      )
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2).strength(0.05))
      .force("y", d3.forceY((d: any) => {
         return (d.generation * 80) - (nodes.length * 2);
      }).strength(0.1))
      .force("collide", d3.forceCollide<ThinkerNode>(d => d.archetype === Archetype.VOID ? 8 : (15 + (d.stats.complexity / 8))));

    simulationRef.current = simulation;

    // Links
    const link = g.append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(links)
      .enter().append("line")
      .attr("stroke", d => d.strength > 1 ? "#D4AF37" : "#D4AF37") // Harmonic links are gold
      .attr("stroke-opacity", d => d.strength > 1 ? 0.6 : 0.1) // Harmonic links are clearer
      .attr("stroke-width", d => d.strength > 1 ? 2 : (d.type === 'ancestry' ? 1 : 0.5))
      .style("filter", d => d.strength > 1 ? "url(#glow)" : "none");

    // Nodes Container
    const nodeGroup = g.append("g")
      .attr("class", "nodes")
      .selectAll("g")
      .data(nodes)
      .enter().append("g")
      .call(d3.drag<SVGGElement, ThinkerNode>()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended)
      )
      .on("click", (event, d) => {
        event.stopPropagation();
        onNodeClick(d);
      })
      .on("mouseover", (event, d) => {
        setHoveredNode(d);
        setTooltipPosition({ x: event.pageX + 10, y: event.pageY - 20 });
      })
      .on("mouseout", () => {
        setHoveredNode(null);
        setTooltipPosition(null);
      });

    // Resonance Pulse (Behind the node)
    nodeGroup.each(function(d) {
        const isResonant = (d.stats.logic + d.stats.empathy) > RESONANCE_THRESHOLD;
        if (isResonant && d.archetype !== Archetype.VOID) {
             d3.select(this).append("circle")
                .attr("r", 15)
                .attr("fill", "none")
                .attr("stroke", "#D4AF37")
                .attr("stroke-width", 1)
                .attr("class", "resonance-ring");
        }
    });

    // Node visual
    nodeGroup.append("circle")
      .attr("r", d => d.archetype === Archetype.VOID ? 4 : 10 + (d.stats.complexity / 10))
      .attr("fill", d => d.archetype === Archetype.VOID ? '#000' : "#050505")
      .attr("stroke", d => ARCHETYPE_COLORS[d.archetype] || '#fff')
      .attr("stroke-width", d => d.archetype === Archetype.VOID ? 1 : 2)
      .style("filter", d => d.archetype === Archetype.VOID ? "none" : "url(#glow)")
      .style("opacity", d => d.archetype === Archetype.VOID ? 0.4 : 1)
      .style("cursor", "pointer");
    
    // Core of node
    nodeGroup.append("circle")
      .attr("r", d => d.archetype === Archetype.VOID ? 1 : 4)
      .attr("fill", d => ARCHETYPE_COLORS[d.archetype] || '#fff')
      .style("opacity", d => d.archetype === Archetype.VOID ? 0.4 : 1);

    // Labels
    nodeGroup.append("text")
      .text(d => d.name)
      .attr("x", 15)
      .attr("y", 4)
      .attr("font-family", "Cinzel")
      .attr("font-size", d => d.archetype === Archetype.VOID ? "8px" : "10px")
      .attr("fill", d => d.archetype === Archetype.VOID ? "#4B5563" : "#D4AF37")
      .style("opacity", d => d.archetype === Archetype.VOID ? 0.3 : 0.7)
      .style("pointer-events", "none");

    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      nodeGroup
        .attr("transform", d => `translate(${d.x},${d.y})`);
    });

    function dragstarted(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: any, d: any) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    return () => {
      simulation.stop();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes.length, links.length, width, height]);

  // Update selection style separately
  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    
    svg.selectAll(".nodes > circle:not(.resonance-ring)")
       .attr("stroke-opacity", (d: any) => {
         // Base opacity based on archetype
         const base = d.archetype === Archetype.VOID ? 0.4 : 1;
         // Selection dimming
         const dim = selectedNodeId === null || d.id === selectedNodeId ? 1 : 0.3;
         return base * dim;
       })
       .attr("fill-opacity", (d: any) => selectedNodeId === null || d.id === selectedNodeId ? 1 : 0.3);
       
  }, [selectedNodeId]);

  return (
    <div 
      className="w-full h-full block transition-colors duration-[2000ms] ease-in-out"
      style={{ background: getBackgroundStyle() }}
    >
      <svg 
        ref={svgRef} 
        width={width} 
        height={height} 
        className="w-full h-full block"
      />
      {hoveredNode && tooltipPosition && (
        <div
          className="absolute bg-elysium-800/90 backdrop-blur-sm border border-elysium-gold/20 p-3 rounded-sm shadow-lg z-30 max-w-xs pointer-events-none"
          style={{
            left: tooltipPosition.x,
            top: tooltipPosition.y,
            transform: 'translateY(-100%)', // Position above the cursor
            fontFamily: 'var(--font-serif)',
            fontSize: '0.75rem',
            color: '#F4F4F0',
          }}
        >
          <p className="text-elysium-gold font-serif mb-1">{hoveredNode.name}</p>
          <p className="text-gray-300 italic">"{hoveredNode.description}"</p>
        </div>
      )}
    </div>
  );
};