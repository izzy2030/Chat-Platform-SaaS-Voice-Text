"use client";

import { RadialBar, RadialBarChart, Cell, PolarAngleAxis, Label } from "recharts";
import React from "react";
import {
  ChartConfig,
  ChartContainer,
} from "@/components/ui/chart";

const defaultChartConfig = {
  performance: {
    label: "Performance",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

interface GlowingRadialChartProps {
  data?: { name: string; value: number; fill: string }[];
  config?: ChartConfig;
  className?: string;
}

export function GlowingRadialChart({ 
  data = [{ name: "performance", value: 100, fill: "var(--color-performance)" }], 
  config = defaultChartConfig,
  className 
}: GlowingRadialChartProps) {
  return (
    <ChartContainer
      config={config}
      className={className ?? "mx-auto aspect-square max-h-[250px] w-full h-full"}
    >
      <RadialBarChart
        data={data}
        startAngle={90}
        endAngle={-270}
        innerRadius="80%"
        outerRadius="100%"
        barSize={20}
      >
        <PolarAngleAxis
          type="number"
          domain={[0, 100]}
          angleAxisId={0}
          tick={false}
        />
        <RadialBar
          background
          dataKey="value"
          cornerRadius={30}
          className="drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]"
        >
          {data.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={entry.fill}
              filter={`url(#radial-glow)`}
            />
          ))}
        </RadialBar>
        <defs>
          <filter id="radial-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        <rect width="100%" height="100%" fill="transparent" />
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-foreground text-2xl font-black"
        >
          {data[0]?.value}%
        </text>
      </RadialBarChart>
    </ChartContainer>
  );
}
