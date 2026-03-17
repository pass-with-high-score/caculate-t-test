"use client";

import { useState } from "react";
import { parseScores } from "./utils";
import { calculateStats, AnalysisResult } from "./stats";
import InteractiveResultTable from "./InteractiveResultTable";
import DistributionChart from "./DistributionChart";

export default function StatisticalCalculator() {
  const [controlGroup, setControlGroup] = useState("");
  const [experimentalGroup, setExperimentalGroup] = useState("");
  const [results, setResults] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Create state to pass the exact grouped arrays down to the chart for rendering
  const [parsedRawData, setParsedRawData] = useState<{control: number[], experimental: number[]} | null>(null);

  const handleAnalysis = () => {
    setError(null);
    setResults(null);
    setParsedRawData(null);
    
    try {
      const parsedControl = parseScores(controlGroup);
      const parsedExperimental = parseScores(experimentalGroup);

      if (parsedControl.length < 2 || parsedExperimental.length < 2) {
        setError("Both groups must have at least 2 valid numbers for a t-test.");
        return;
      }

      setParsedRawData({ control: parsedControl, experimental: parsedExperimental });
      const stats = calculateStats(parsedControl, parsedExperimental);
      setResults(stats);
    } catch (err) {
      setError("An error occurred during calculation. Please check your data format.");
      console.error(err);
    }
  };

  const formatNumber = (num: number) => {
    if (isNaN(num)) return "N/A";
    return num.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 });
  };

  const formatMode = (mode: number | number[]) => {
    if (Array.isArray(mode)) {
       return mode.map(formatNumber).join(", ");
    }
    return formatNumber(mode);
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-6 md:p-12">
      <div className="max-w-5xl mx-auto space-y-10">
        
        {/* Header */}
        <header className="border-b-4 border-slate-800 pb-6">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900">
            Máy tính Thống kê mô tả & Kiểm định T
          </h1>
          <p className="mt-3 text-lg text-slate-700 font-medium">
            Công cụ phân tích thống kê dùng cho nghiên cứu giáo dục.
          </p>
        </header>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border-l-4 border-red-600 p-4 text-red-800 font-semibold shadow-sm">
            {error}
          </div>
        )}

        {/* Two Column Grid Layout for Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Left Column: Control Group */}
          <div className="flex flex-col space-y-3">
            <label 
              htmlFor="controlGroup" 
              className="text-xl font-bold text-slate-800 border-l-4 border-slate-800 pl-3"
            >
              Lớp đối chứng
            </label>
            <textarea
              id="controlGroup"
              value={controlGroup}
              onChange={(e) => setControlGroup(e.target.value)}
              placeholder="Nhập dữ liệu tại đây (ví dụ: 8.5, 9.0, 7.5...)"
              className="w-full h-80 p-5 border-4 border-slate-400 rounded-lg focus:outline-none focus:border-blue-700 focus:ring-4 focus:ring-blue-700/20 transition-all resize-y font-mono text-base leading-relaxed shadow-sm bg-white"
            />
          </div>

          {/* Right Column: Experimental Group */}
          <div className="flex flex-col space-y-3">
            <label 
              htmlFor="experimentalGroup" 
              className="text-xl font-bold text-slate-800 border-l-4 border-slate-800 pl-3"
            >
              Lớp thực nghiệm
            </label>
            <textarea
              id="experimentalGroup"
              value={experimentalGroup}
              onChange={(e) => setExperimentalGroup(e.target.value)}
              placeholder="Nhập dữ liệu tại đây (ví dụ: 9.0, 9.5, 8.0...)"
              className="w-full h-80 p-5 border-4 border-slate-400 rounded-lg focus:outline-none focus:border-blue-700 focus:ring-4 focus:ring-blue-700/20 transition-all resize-y font-mono text-base leading-relaxed shadow-sm bg-white"
            />
          </div>

        </div>

        {/* Action Button */}
        <div className="flex justify-center pt-4">
          <button
            onClick={handleAnalysis}
            className="px-12 py-5 bg-blue-700 hover:bg-blue-800 active:bg-blue-900 text-white text-2xl font-black tracking-wide rounded-xl shadow-lg hover:shadow-xl transition-all border-4 border-blue-900 focus:outline-none focus:ring-4 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-50 w-full md:w-auto min-w-[350px]"
          >
            Chạy phân tích
          </button>
        </div>

        {/* Results Section */}
        <section className="mt-12 pt-10 border-t-4 border-slate-800">
          <h2 className="text-3xl font-extrabold text-slate-900 mb-8 border-l-4 border-slate-800 pl-4">
            Kết quả tính toán
          </h2>
          
          <div className="bg-white border-4 border-slate-300 rounded-xl shadow-md overflow-hidden min-h-[350px] flex flex-col">
            {!results ? (
              <>
                <div className="p-8 bg-slate-100 border-b-4 border-slate-300 flex items-center justify-center">
                  <p className="text-lg text-slate-600 font-semibold text-center italic">
                    Nhập dữ liệu phía trên và nhấn "Chạy phân tích" để hiển thị bảng kết quả.
                  </p>
                </div>
                
                {/* Table Mockup / Skeleton Placeholder */}
                <div className="p-8 flex-grow bg-white">
                  <div className="animate-pulse flex flex-col space-y-6">
                    <div className="h-8 bg-slate-300 rounded w-1/4 mb-4"></div>
                    
                    <div className="grid grid-cols-3 gap-6 mb-4 border-b-4 border-slate-200 pb-4">
                      <div className="h-6 bg-slate-300 rounded"></div>
                      <div className="h-6 bg-slate-300 rounded"></div>
                      <div className="h-6 bg-slate-300 rounded"></div>
                    </div>
                    
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="grid grid-cols-3 gap-6">
                        <div className="h-5 bg-slate-200 rounded"></div>
                        <div className="h-5 bg-slate-200 rounded"></div>
                        <div className="h-5 bg-slate-200 rounded"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col">
                <InteractiveResultTable results={results} />
                
                {parsedRawData && (
                  <DistributionChart 
                    controlScores={parsedRawData.control} 
                    experimentalScores={parsedRawData.experimental} 
                    results={results} 
                  />
                )}
              </div>
            )}
          </div>
        </section>

      </div>
    </div>
  );
}
