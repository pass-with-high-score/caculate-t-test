"use client";

import { useState } from "react";
import { BlockMath, InlineMath } from "react-katex";
import "katex/dist/katex.min.css";
import { AnalysisResult } from "./stats";

interface InteractiveResultTableProps {
  results: AnalysisResult;
}

export default function InteractiveResultTable({ results }: InteractiveResultTableProps) {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const toggleRow = (rowName: string) => {
    setExpandedRow((prev) => (prev === rowName ? null : rowName));
  };

  const formatNumber = (num: number, digits = 4) => {
    if (isNaN(num)) return "N/A";
    return num.toLocaleString(undefined, { minimumFractionDigits: digits, maximumFractionDigits: digits });
  };

  const formatMode = (mode: number | number[]) => {
    if (Array.isArray(mode)) {
      return mode.map((m) => formatNumber(m)).join(", ");
    }
    return formatNumber(mode);
  };

  const { controlStats: cStats, experimentalStats: eStats, inferentialStats: iStats } = results;

  return (
    <div className="flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-800 text-white">
            <tr>
              <th className="p-4 border-b-4 border-slate-900 font-bold text-lg w-1/3">
                Các tham số
              </th>
              <th className="p-4 border-b-4 border-slate-900 font-bold text-lg text-center border-l-2 border-slate-700 w-1/3">
                Lớp đối chứng
              </th>
              <th className="p-4 border-b-4 border-slate-900 font-bold text-lg text-center border-l-2 border-slate-700 w-1/3">
                Lớp thực nghiệm
              </th>
            </tr>
          </thead>
          <tbody className="bg-white">
            
            {/* --- N (Count) --- */}
            <tr className="border-b-2 border-slate-100">
              <td className="p-4 border-r-2 border-slate-100">
                <div className="flex flex-col">
                  <span className="font-bold text-slate-700">N (Số lượng)</span>
                  <span className="text-xs text-slate-500 mt-1">Tổng số lượng mẫu thu thập được.</span>
                </div>
              </td>
              <td className="p-4 font-mono text-center">{cStats.n}</td>
              <td className="p-4 font-mono text-center border-l-2 border-slate-100">{eStats.n}</td>
            </tr>

            {/* --- Mean (Expandable) --- */}
            <tr
              onClick={() => toggleRow("mean")}
              className="hover:bg-slate-100 transition-colors border-b-2 border-slate-100 bg-slate-50/50 cursor-pointer group"
            >
              <td className="p-4 border-r-2 border-slate-100 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-bold text-slate-800 group-hover:text-blue-700 transition-colors">Giá trị Trung bình (Mean)</span>
                  <span className="text-xs text-slate-500 mt-1">Trọng tâm của dữ liệu (tính bằng tổng chia số lượng).</span>
                </div>
                <span className="text-slate-400 group-hover:text-blue-500 text-sm ml-2">{expandedRow === "mean" ? "▲" : "▼"}</span>
              </td>
              <td className="p-4 font-mono text-center">{formatNumber(cStats.mean)}</td>
              <td className="p-4 font-mono text-center border-l-2 border-slate-100">{formatNumber(eStats.mean)}</td>
            </tr>
            {expandedRow === "mean" && (
              <tr className="bg-blue-50/60 border-b-2 border-slate-100">
                <td colSpan={3} className="p-6 text-sm text-slate-700">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="font-bold text-slate-900 mb-2 border-b-2 border-slate-200 pb-1">Công thức toán học:</h4>
                      <div className="text-lg">
                        <BlockMath math="\bar{x} = \frac{1}{n}\sum_{i=1}^{n}x_i" />
                      </div>
                      <p className="text-slate-600 mt-2">Tổng của tất cả các giá trị chia cho số lượng giá trị trong nhóm nghiên cứu.</p>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 mb-2 border-b-2 border-slate-200 pb-1">Phân tích từng bước:</h4>
                      <div className="space-y-3">
                        <p><strong>Lớp đối chứng:</strong></p>
                        <div className="pl-4 border-l-2 border-blue-400">
                          <InlineMath math={`\\bar{x}_{control} = \\frac{\\text{Tổng}}{${cStats.n}} = ${formatNumber(cStats.mean)}`} />
                        </div>
                        <p className="mt-2"><strong>Lớp thực nghiệm:</strong></p>
                        <div className="pl-4 border-l-2 border-indigo-400">
                          <InlineMath math={`\\bar{x}_{exp} = \\frac{\\text{Tổng}}{${eStats.n}} = ${formatNumber(eStats.mean)}`} />
                        </div>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            )}

            {/* --- Median --- */}
            <tr className="border-b-2 border-slate-100">
              <td className="p-4 border-r-2 border-slate-100">
                <div className="flex flex-col">
                  <span className="font-bold text-slate-700">Trung vị (Median)</span>
                  <span className="text-xs text-slate-500 mt-1">Điểm nằm chính giữa khi sắp xếp thứ tự dữ liệu.</span>
                </div>
              </td>
              <td className="p-4 font-mono text-center">{formatNumber(cStats.median)}</td>
              <td className="p-4 font-mono text-center border-l-2 border-slate-100">{formatNumber(eStats.median)}</td>
            </tr>

            {/* --- Mode --- */}
            <tr className="border-b-2 border-slate-100 bg-slate-50/50">
              <td className="p-4 border-r-2 border-slate-100">
                <div className="flex flex-col">
                  <span className="font-bold text-slate-700">Yếu vị (Mode)</span>
                  <span className="text-xs text-slate-500 mt-1">Mức điểm xuất hiện với tần suất nhiều nhất.</span>
                </div>
              </td>
              <td className="p-4 font-mono text-center">{formatMode(cStats.mode)}</td>
              <td className="p-4 font-mono text-center border-l-2 border-slate-100">{formatMode(eStats.mode)}</td>
            </tr>

            {/* --- Std Deviation (Expandable) --- */}
            <tr
              onClick={() => toggleRow("stddev")}
              className="hover:bg-slate-100 transition-colors border-b-4 border-slate-300 cursor-pointer group"
            >
              <td className="p-4 border-r-2 border-slate-100 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-bold text-slate-800 group-hover:text-blue-700 transition-colors">Độ lệch chuẩn (Standard Deviation)</span>
                  <span className="text-xs text-slate-500 mt-1">Mức độ phân tán của điểm số quanh mức trung bình.</span>
                </div>
                <span className="text-slate-400 group-hover:text-blue-500 text-sm ml-2">{expandedRow === "stddev" ? "▲" : "▼"}</span>
              </td>
              <td className="p-4 font-mono text-center">{formatNumber(cStats.stdDev)}</td>
              <td className="p-4 font-mono text-center border-l-2 border-slate-100">{formatNumber(eStats.stdDev)}</td>
            </tr>
            {expandedRow === "stddev" && (
              <tr className="bg-blue-50/60 border-b-4 border-slate-300">
                <td colSpan={3} className="p-6 text-sm text-slate-700">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="font-bold text-slate-900 mb-2 border-b-2 border-slate-200 pb-1">Công thức toán học:</h4>
                      <div className="text-lg">
                        <BlockMath math="s = \sqrt{\frac{\sum(x_i - \bar{x})^2}{n - 1}}" />
                      </div>
                      <p className="text-slate-600 mt-2">Hiệu chỉnh Bessel (n-1) được sử dụng để tự động tính toán Độ lệch chuẩn của mẫu thay vì tổng thể nhằm tăng độ chính xác ước lượng.</p>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 mb-2 border-b-2 border-slate-200 pb-1">Phân tích từng bước:</h4>
                      <div className="space-y-3 overflow-x-auto pb-2">
                        <p><strong>Lớp đối chứng (<InlineMath math="s_1" />):</strong></p>
                        <div className="pl-4 border-l-2 border-blue-400">
                          <BlockMath math={`s_1 = \\sqrt{\\frac{\\sum(x_i - ${formatNumber(cStats.mean)})^2}{${cStats.n} - 1}} = ${formatNumber(cStats.stdDev)}`} />
                        </div>
                        <p className="mt-2"><strong>Lớp thực nghiệm (<InlineMath math="s_2" />):</strong></p>
                        <div className="pl-4 border-l-2 border-indigo-400">
                          <BlockMath math={`s_2 = \\sqrt{\\frac{\\sum(x_i - ${formatNumber(eStats.mean)})^2}{${eStats.n} - 1}} = ${formatNumber(eStats.stdDev)}`} />
                        </div>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            )}

            {/* --- Divider --- */}
            <tr className="bg-slate-200">
              <td colSpan={3} className="p-3 font-bold text-slate-700 text-center uppercase tracking-wider text-sm border-b-4 border-slate-300">
                Kiểm định T cho 2 Mẫu Độc lập (Kiểm định Welch test cho phương sai không bằng nhau)
              </td>
            </tr>

            {/* --- T-Statistic (Expandable) --- */}
            <tr
              onClick={() => toggleRow("tstat")}
              className="hover:bg-slate-100 transition-colors border-b-2 border-slate-100 cursor-pointer group"
            >
              <td className="p-4 border-r-2 border-slate-100 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-bold text-slate-800 group-hover:text-blue-700 transition-colors">Kiểm định T (T-Statistic)</span>
                  <span className="text-xs text-slate-500 mt-1">Mức độ khác biệt nhóm so sánh với mức độ biến thiên dữ liệu.</span>
                </div>
                <span className="text-slate-400 group-hover:text-blue-500 text-sm ml-2">{expandedRow === "tstat" ? "▲" : "▼"}</span>
              </td>
              <td colSpan={2} className="p-4 font-mono text-center bg-slate-50 font-bold group-hover:bg-slate-100">
                {formatNumber(iStats.tStat)}
              </td>
            </tr>
            {expandedRow === "tstat" && (
              <tr className="bg-blue-50/60 border-b-2 border-slate-100">
                <td colSpan={3} className="p-6 text-sm text-slate-700">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                    <div>
                      <h4 className="font-bold text-slate-900 mb-2 border-b-2 border-slate-200 pb-1">Công thức kiểm định Welch:</h4>
                      <div className="text-lg overflow-x-auto pb-4">
                        <BlockMath math="t = \frac{\bar{x}_1 - \bar{x}_2}{\sqrt{\frac{s_1^2}{n_1} + \frac{s_2^2}{n_2}}}" />
                      </div>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 mb-2 border-b-2 border-slate-200 pb-1">Các bước tính toán:</h4>
                      <div className="pl-4 border-l-2 border-green-500 overflow-x-auto pb-4">
                        <BlockMath 
                          math={`t = \\frac{${formatNumber(cStats.mean)} - ${formatNumber(eStats.mean)}}{\\sqrt{\\frac{${formatNumber(Math.pow(cStats.stdDev, 2))}}{${cStats.n}} + \\frac{${formatNumber(Math.pow(eStats.stdDev, 2))}}{${eStats.n}}}} = ${formatNumber(iStats.tStat)}`} 
                        />
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            )}

            {/* --- Degrees of Freedom (Expandable) --- */}
            <tr
              onClick={() => toggleRow("df")}
              className="hover:bg-slate-100 transition-colors border-b-2 border-slate-100 bg-slate-50/50 cursor-pointer group"
            >
              <td className="p-4 border-r-2 border-slate-100 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-bold text-slate-800 group-hover:text-blue-700 transition-colors">Bậc tự do (Degrees of Freedom - df)</span>
                  <span className="text-xs text-slate-500 mt-1">Số lượng giá trị có thể tự do biến thiên trong tính toán.</span>
                </div>
                <span className="text-slate-400 group-hover:text-blue-500 text-sm ml-2">{expandedRow === "df" ? "▲" : "▼"}</span>
              </td>
              <td colSpan={2} className="p-4 font-mono text-center bg-white font-bold group-hover:bg-slate-100">
                {formatNumber(iStats.df)}
              </td>
            </tr>
            {expandedRow === "df" && (
              <tr className="bg-blue-50/60 border-b-2 border-slate-100">
                <td colSpan={3} className="p-6 text-sm text-slate-700">
                  <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-8 items-center">
                    <div>
                      <h4 className="font-bold text-slate-900 mb-2 border-b-2 border-slate-200 pb-1">Phương trình Welch-Satterthwaite:</h4>
                      <div className="text-lg overflow-x-auto pb-4">
                        <BlockMath math="df \approx \frac{\left( \frac{s_1^2}{n_1} + \frac{s_2^2}{n_2} \right)^2}{\frac{\left( \frac{s_1^2}{n_1} \right)^2}{n_1 - 1} + \frac{\left( \frac{s_2^2}{n_2} \right)^2}{n_2 - 1}}" />
                      </div>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 mb-2 border-b-2 border-slate-200 pb-1">Các bước tính toán:</h4>
                      <div className="pl-4 border-l-2 border-purple-500 overflow-x-auto pb-4">
                        <BlockMath 
                          math={`df = \\frac{(${formatNumber(Math.pow(cStats.stdDev, 2)/cStats.n)} + ${formatNumber(Math.pow(eStats.stdDev, 2)/eStats.n)})^2}{\\frac{(${formatNumber(Math.pow(cStats.stdDev, 2)/cStats.n)})^2}{${cStats.n - 1}} + \\frac{(${formatNumber(Math.pow(eStats.stdDev, 2)/eStats.n)})^2}{${eStats.n - 1}}} = ${formatNumber(iStats.df)}`} 
                        />
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            )}

            {/* --- P-Value 1-tailed --- */}
            <tr className="border-b-2 border-slate-100">
              <td className="p-4 border-r-2 border-slate-100">
                <div className="flex flex-col">
                  <span className="font-bold text-slate-700">P-Value (1 phía / 1-tailed)</span>
                  <span className="text-xs text-slate-500 mt-1">Xác suất mức độ khác biệt chỉ xem xét lớn hơn HOẶC nhỏ hơn.</span>
                </div>
              </td>
              <td colSpan={2} className={`p-4 font-mono text-center bg-slate-50 font-bold ${iStats.pValueOneTailed < 0.05 ? "text-green-600" : "text-slate-900"}`}>
                {formatNumber(iStats.pValueOneTailed)}
              </td>
            </tr>

            {/* --- P-Value 2-tailed --- */}
            <tr className="border-b-4 border-slate-300 bg-slate-50/50">
              <td className="p-4 border-r-2 border-slate-100">
                <div className="flex flex-col">
                  <span className="font-bold text-slate-700">P-Value (2 phía / 2-tailed)</span>
                  <span className="text-xs text-slate-500 mt-1">Xác suất tồn tại sự khác biệt bất kỳ tính theo cả 2 đầu.</span>
                </div>
              </td>
              <td colSpan={2} className={`p-4 font-mono text-center bg-white font-bold ${iStats.pValueTwoTailed < 0.05 ? "text-green-600" : "text-slate-900"}`}>
                {formatNumber(iStats.pValueTwoTailed)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Significance Box */}
      {iStats.pValueTwoTailed < 0.05 ? (
        <div className="bg-green-100 border-t-4 border-green-600 p-6 text-green-800 font-medium text-lg text-center">
          Kết quả có ý nghĩa thống kê (p &lt; 0.05). Có sự khác biệt đáng kể giữa hai nhóm thử nghiệm. 
        </div>
      ) : (
        <div className="bg-slate-200 border-t-4 border-slate-500 p-6 text-slate-700 font-medium text-lg text-center">
          Kết quả KHÔNG có ý nghĩa thống kê (p &ge; 0.05). Không có sự khác biệt đáng kể giữa hai nhóm.
        </div>
      )}
    </div>
  );
}
