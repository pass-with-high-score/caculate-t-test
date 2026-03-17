"use client";

import { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import { AnalysisResult } from "./stats";

interface DistributionChartProps {
  controlScores: number[];
  experimentalScores: number[];
  results: AnalysisResult;
}

interface ChartDataPoint {
  score: number;
  controlCount: number;
  experimentalCount: number;
}

export default function DistributionChart({
  controlScores,
  experimentalScores,
  results,
}: DistributionChartProps) {
  // State for toggles
  const [showMean, setShowMean] = useState(false);
  const [showMedian, setShowMedian] = useState(false);
  const [showMode, setShowMode] = useState(false);

  // Transform raw scores into frequency data for Recharts
  const chartData = useMemo(() => {
    // Find min and max scores to dynamic range, allowing 0 to 10 typical academic scores
    const allScores = [...controlScores, ...experimentalScores];
    const minScore = Math.min(0, ...allScores); // Default at least 0
    const maxScore = Math.max(10, ...allScores); // Default at least 10

    const data: ChartDataPoint[] = [];

    for (let i = minScore; i <= maxScore; i++) {
        // Count frequencies. We allow half scores (e.g. 8.5) but for simplicity of a standard bar chart
        // X-Axis, it works best with whole integers. If they use float scores heavily we would need 
        // to group them into bins, but standard 1-10 is assumed here per the prompt 'up to score 10'.
        // To be safe with any floats inputted, we group strictly by exact values rounded to 1 decimal place.
        data.push({
            score: i,
            controlCount: 0,
            experimentalCount: 0,
        });
    }

    // Now if there are fractional scores, this strict integer loop might miss them if we only map to integers.
    // Let's create a dynamic dictionary mapping instead to perfectly capture all exact score values inputted,
    // including half points like 8.5, and sort them.
    const uniqueScores = Array.from(new Set(allScores)).sort((a, b) => a - b);
    
    // Ensure all integers 0-10 are at least present for the visual scale even if empty
    for (let i = 0; i <= 10; i++) {
        if (!uniqueScores.includes(i)) {
            uniqueScores.push(i);
        }
    }
    uniqueScores.sort((a, b) => a - b);


    const dynamicData = uniqueScores.map(score => {
        return {
            score: score,
            controlCount: controlScores.filter(s => s === score).length,
            experimentalCount: experimentalScores.filter(s => s === score).length,
        }
    });

    return dynamicData;
  }, [controlScores, experimentalScores]);

  // Extract stats for reference lines
  const { controlStats, experimentalStats } = results;

  const controlColor = "#3b82f6"; // blue-500
  const experimentalColor = "#8b5cf6"; // violet-500

  // Reference line colors
  const meanColor = "#ef4444"; // red-500
  const medianColor = "#22c55e"; // green-500
  const modeColor = "#f59e0b"; // amber-500

  // Helper to render mode reference lines, handling multiple modes
  const renderModeLines = (mode: number | number[], color: string, labelPrefix: string) => {
    if (Number.isNaN(mode as number)) return null;

    if (Array.isArray(mode)) {
      return mode.map((value, i) => (
        <ReferenceLine
          key={`mode-${labelPrefix}-${i}`}
          x={value}
          stroke={color}
          strokeDasharray="3 3"
          strokeWidth={2}
          label={{ position: "top", value: `${labelPrefix} Mode`, fill: color, fontSize: 12 }}
        />
      ));
    }

    return (
      <ReferenceLine
        x={mode}
        stroke={color}
        strokeDasharray="3 3"
        strokeWidth={2}
        label={{ position: "top", value: `${labelPrefix} Mode`, fill: color, fontSize: 12 }}
      />
    );
  };

  return (
    <div className="bg-white border-4 border-slate-300 rounded-xl shadow-md p-6 mt-8 flex flex-col space-y-6">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b-2 border-slate-100 pb-4">
        <h3 className="text-2xl font-bold text-slate-800">
          Phân bố điểm
        </h3>

        {/* Interactive Toggles */}
        <div className="flex flex-wrap gap-4 mt-4 md:mt-0 bg-slate-100 p-2 rounded-lg border-2 border-slate-200">
          <label className="flex items-center space-x-2 cursor-pointer select-none">
            <input
              type="checkbox"
              className="w-5 h-5 text-red-600 rounded border-gray-300 focus:ring-red-500"
              checked={showMean}
              onChange={(e) => setShowMean(e.target.checked)}
            />
            <span className="font-semibold text-slate-700">Hiện Trung bình</span>
            <div className="w-4 h-4 rounded-full bg-red-500 ml-1"></div>
          </label>

          <label className="flex items-center space-x-2 cursor-pointer select-none border-l-2 border-slate-300 pl-4">
            <input
              type="checkbox"
              className="w-5 h-5 text-green-600 rounded border-gray-300 focus:ring-green-500"
              checked={showMedian}
              onChange={(e) => setShowMedian(e.target.checked)}
            />
            <span className="font-semibold text-slate-700">Hiện Trung vị</span>
            <div className="w-4 h-4 rounded-full bg-green-500 ml-1"></div>
          </label>

          <label className="flex items-center space-x-2 cursor-pointer select-none border-l-2 border-slate-300 pl-4">
            <input
              type="checkbox"
              className="w-5 h-5 text-amber-500 rounded border-gray-300 focus:ring-amber-500"
              checked={showMode}
              onChange={(e) => setShowMode(e.target.checked)}
            />
            <span className="font-semibold text-slate-700">Hiện Yếu vị (Mode)</span>
            <div className="w-4 h-4 rounded-full bg-amber-500 ml-1"></div>
          </label>
        </div>
      </div>

      {/* Recharts Container */}
      <div className="w-full h-[500px] pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{
              top: 30,
              right: 30,
              left: 0,
              bottom: 20,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis 
                dataKey="score" 
                tick={{ fill: '#475569', fontWeight: 600 }}
                axisLine={{ stroke: '#cbd5e1', strokeWidth: 2 }}
                tickLine={false}
                label={{ value: 'Điểm số', position: 'insideBottom', offset: -10, fontWeight: 'bold' }}
            />
            <YAxis 
                allowDecimals={false} // Frequencies are whole numbers
                tick={{ fill: '#475569', fontWeight: 600 }}
                axisLine={{ stroke: '#cbd5e1', strokeWidth: 2 }}
                tickLine={false}
                label={{ value: 'Số lượng (Tần số)', angle: -90, position: 'insideLeft', fontWeight: 'bold' }}
            />
            
            {/* Custom Tooltip */}
            <Tooltip
              cursor={{ fill: '#f1f5f9' }}
              contentStyle={{ borderRadius: '0.5rem', borderWidth: '2px', borderColor: '#cbd5e1', fontWeight: 600 }}
              formatter={(value: any, name: any) => [
                `${value} student${value !== 1 ? 's' : ''}`, 
                name === 'controlCount' ? 'Control Group' : 'Experimental Group'
              ]}
              labelFormatter={(label) => `Score: ${label}`}
            />
            
            <Legend 
                wrapperStyle={{ paddingTop: '20px', fontWeight: 'bold' }}
                formatter={(value) => value === 'controlCount' ? 'Lớp đối chứng (Control)' : 'Lớp thực nghiệm (Experimental)'}
            />
            
            <Bar 
                dataKey="controlCount" 
                fill={controlColor} 
                radius={[4, 4, 0, 0]} 
                maxBarSize={60}
            />
            <Bar 
                dataKey="experimentalCount" 
                fill={experimentalColor} 
                radius={[4, 4, 0, 0]} 
                maxBarSize={60}
            />

            {/* Mean Reference Lines */}
            {showMean && controlStats?.mean !== undefined && !Number.isNaN(controlStats.mean) && (
              <ReferenceLine
                x={controlStats.mean}
                stroke={meanColor}
                strokeWidth={3}
                label={{ position: "top", value: "C: Trung bình", fill: meanColor, fontSize: 13, fontWeight: "bold" }}
              />
            )}
            {showMean && experimentalStats?.mean !== undefined && !Number.isNaN(experimentalStats.mean) && (
              <ReferenceLine
                x={experimentalStats.mean}
                stroke={meanColor}
                strokeWidth={3}
                strokeDasharray="5 5"
                label={{ position: "insideTopRight", value: "E: Trung bình", fill: meanColor, fontSize: 13, fontWeight: "bold" }}
              />
            )}

            {/* Median Reference Lines */}
            {showMedian && controlStats?.median !== undefined && !Number.isNaN(controlStats.median) && (
              <ReferenceLine
                x={controlStats.median}
                stroke={medianColor}
                strokeWidth={3}
                label={{ position: "top", value: "C: Trung vị", fill: medianColor, fontSize: 13, fontWeight: "bold" }}
              />
            )}
            {showMedian && experimentalStats?.median !== undefined && !Number.isNaN(experimentalStats.median) && (
              <ReferenceLine
                x={experimentalStats.median}
                stroke={medianColor}
                strokeWidth={3}
                strokeDasharray="5 5"
                label={{ position: "insideTopRight", value: "E: Trung vị", fill: medianColor, fontSize: 13, fontWeight: "bold" }}
              />
            )}

            {/* Mode Reference Lines */}
            {showMode && renderModeLines(controlStats?.mode, modeColor, "C:")}
            {showMode && renderModeLines(experimentalStats?.mode, modeColor, "E:")}

          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
