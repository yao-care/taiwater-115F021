/* ============================================================
   shared/charts.js — D3 v7 圖表元件
   ============================================================ */

window.SP = window.SP || {};

/* ---------- 共用 hook：D3 mount ---------- */
function useD3Mount(renderFn, deps) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (!ref.current || !window.d3) return;
    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();
    renderFn(svg);
  }, deps);
  return ref;
}

/* ---------- 取 CSS 變數顏色 ---------- */
function cssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || "#003366";
}

const CHART_PALETTE = [
  "oklch(0.34 0.08 250)",  // 台水深藍
  "oklch(0.46 0.10 245)",
  "oklch(0.60 0.10 245)",
  "oklch(0.55 0.16 55)",
  "oklch(0.48 0.16 150)",
  "oklch(0.52 0.13 240)",
  "oklch(0.55 0.14 80)",
  "oklch(0.55 0.22 25)",
];

/* ============================================================
   1. BarChart — 直條圖
   ============================================================ */
SP.BarChart = function BarChart({ data, height = 220, valueKey = "value", labelKey = "label", color }) {
  // data: [{ label, value }]
  const ref = useD3Mount((svg) => {
    const node = ref.current;
    const width = node.clientWidth || 360;
    const margin = { top: 8, right: 16, bottom: 28, left: 36 };
    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;

    svg.attr("viewBox", `0 0 ${width} ${height}`).attr("width", "100%").attr("height", height);

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand().domain(data.map(d => d[labelKey])).range([0, innerW]).padding(0.25);
    const y = d3.scaleLinear().domain([0, d3.max(data, d => d[valueKey]) * 1.1 || 1]).nice().range([innerH, 0]);

    // axes
    g.append("g").attr("transform", `translate(0,${innerH})`)
      .call(d3.axisBottom(x))
      .selectAll("text").attr("font-size", "12px").style("fill", "var(--text-muted)");
    g.append("g").call(d3.axisLeft(y).ticks(4))
      .selectAll("text").attr("font-size", "12px").style("fill", "var(--text-muted)");

    g.selectAll(".bar")
      .data(data).enter().append("rect")
      .attr("x", d => x(d[labelKey]))
      .attr("y", d => y(d[valueKey]))
      .attr("width", x.bandwidth())
      .attr("height", d => innerH - y(d[valueKey]))
      .attr("fill", color || CHART_PALETTE[0])
      .attr("rx", 4);

    g.selectAll(".label")
      .data(data).enter().append("text")
      .attr("x", d => x(d[labelKey]) + x.bandwidth() / 2)
      .attr("y", d => y(d[valueKey]) - 4)
      .attr("text-anchor", "middle")
      .attr("font-size", "11px")
      .style("fill", "var(--text-secondary)")
      .text(d => d[valueKey]);
  }, [JSON.stringify(data), height, color]);

  return React.createElement("svg", { ref, style: { width: "100%", display: "block" } });
};

/* ============================================================
   2. RankBar — 橫向排名條
   ============================================================ */
SP.RankBar = function RankBar({ data, max, valueKey = "value", labelKey = "label", suffix = "", topN, height }) {
  // data: [{ rank, label, value, sub }]
  const items = topN ? data.slice(0, topN) : data;
  const maxValue = max || Math.max(...items.map(d => d[valueKey]));
  return React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: "var(--space-2)", height } },
    items.map((d, i) =>
      React.createElement("div", { key: i, style: { display: "flex", alignItems: "center", gap: "var(--space-2)" } },
        React.createElement("span", { style: { width: "1.5rem", textAlign: "center", fontSize: "var(--text-xs)", color: "var(--text-muted)", fontWeight: 600 } }, d.rank ?? (i + 1)),
        React.createElement("span", { style: { flex: "0 0 9rem", fontSize: "var(--text-sm)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, d[labelKey]),
        React.createElement("div", { style: { flex: 1, background: "var(--bg-muted)", borderRadius: "var(--radius-sm)", height: "0.75rem", position: "relative" } },
          React.createElement("div", { style: {
            width: ((d[valueKey] / maxValue) * 100) + "%",
            height: "100%",
            background: CHART_PALETTE[i % CHART_PALETTE.length],
            borderRadius: "var(--radius-sm)",
          } })
        ),
        React.createElement("span", { style: { flex: "0 0 4rem", textAlign: "right", fontSize: "var(--text-sm)", fontWeight: 600 } }, d[valueKey] + suffix),
      )
    )
  );
};

/* ============================================================
   3. LineChart — 折線（KPI 趨勢）
   ============================================================ */
SP.LineChart = function LineChart({ data, height = 200, valueKey = "value", labelKey = "label", color, fill }) {
  const ref = useD3Mount((svg) => {
    const node = ref.current;
    const width = node.clientWidth || 400;
    const margin = { top: 12, right: 16, bottom: 28, left: 40 };
    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;

    svg.attr("viewBox", `0 0 ${width} ${height}`).attr("width", "100%").attr("height", height);

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scalePoint().domain(data.map(d => d[labelKey])).range([0, innerW]);
    const yMin = d3.min(data, d => d[valueKey]);
    const yMax = d3.max(data, d => d[valueKey]);
    const y = d3.scaleLinear().domain([yMin * 0.9, yMax * 1.1]).nice().range([innerH, 0]);

    g.append("g").attr("transform", `translate(0,${innerH})`)
      .call(d3.axisBottom(x).tickSize(0))
      .selectAll("text").attr("font-size", "11px").style("fill", "var(--text-muted)");

    g.append("g").call(d3.axisLeft(y).ticks(4).tickSize(-innerW))
      .selectAll("line").attr("stroke", "var(--border-base)").attr("stroke-dasharray", "2,2");
    g.selectAll(".tick text").attr("font-size", "11px").style("fill", "var(--text-muted)");
    g.selectAll(".domain").attr("stroke", "var(--border-base)");

    const lineColor = color || CHART_PALETTE[0];

    if (fill) {
      const area = d3.area()
        .x(d => x(d[labelKey]))
        .y0(innerH)
        .y1(d => y(d[valueKey]))
        .curve(d3.curveCatmullRom);
      g.append("path").datum(data).attr("d", area).attr("fill", lineColor).attr("opacity", 0.15);
    }

    const line = d3.line().x(d => x(d[labelKey])).y(d => y(d[valueKey])).curve(d3.curveCatmullRom);
    g.append("path").datum(data).attr("d", line).attr("stroke", lineColor).attr("stroke-width", 2).attr("fill", "none");

    g.selectAll(".dot")
      .data(data).enter().append("circle")
      .attr("cx", d => x(d[labelKey]))
      .attr("cy", d => y(d[valueKey]))
      .attr("r", 3.5)
      .attr("fill", lineColor);
  }, [JSON.stringify(data), height, color, fill]);

  return React.createElement("svg", { ref, style: { width: "100%", display: "block" } });
};

/* ============================================================
   4. PieChart — 圓餅 / 環形
   ============================================================ */
SP.PieChart = function PieChart({ data, size = 200, valueKey = "value", labelKey = "label", donut = true, centerLabel }) {
  const ref = useD3Mount((svg) => {
    svg.attr("viewBox", `0 0 ${size} ${size}`).attr("width", size).attr("height", size);
    const r = size / 2;
    const inner = donut ? r * 0.6 : 0;
    const g = svg.append("g").attr("transform", `translate(${r},${r})`);

    const pie = d3.pie().value(d => d[valueKey]).sort(null);
    const arc = d3.arc().innerRadius(inner).outerRadius(r - 4);

    const arcs = g.selectAll("g.slice").data(pie(data)).enter().append("g");
    arcs.append("path")
      .attr("d", arc)
      .attr("fill", (d, i) => CHART_PALETTE[i % CHART_PALETTE.length])
      .attr("stroke", "white").attr("stroke-width", 1.5);

    if (centerLabel) {
      g.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", "0.35em")
        .attr("font-size", "1.25rem")
        .attr("font-weight", 700)
        .style("fill", "var(--text-primary)")
        .text(centerLabel);
    }
  }, [JSON.stringify(data), size, donut, centerLabel]);

  return React.createElement("svg", { ref });
};

/* ============================================================
   5. GanttChart — 5 階段驗收
   ============================================================ */
SP.GanttChart = function GanttChart({ tasks, height = 240, today }) {
  // tasks: [{ id, name, start (Date|ISO), end (Date|ISO), progress, status }]
  const ref = useD3Mount((svg) => {
    const node = ref.current;
    const width = node.clientWidth || 600;
    const margin = { top: 20, right: 16, bottom: 28, left: 120 };
    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;
    const rowH = innerH / tasks.length;

    svg.attr("viewBox", `0 0 ${width} ${height}`).attr("width", "100%").attr("height", height);
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const parsedTasks = tasks.map(t => ({
      ...t,
      _start: new Date(t.start),
      _end:   new Date(t.end),
    }));

    const x = d3.scaleTime()
      .domain([d3.min(parsedTasks, t => t._start), d3.max(parsedTasks, t => t._end)])
      .range([0, innerW]);

    // x axis (months)
    g.append("g").attr("transform", `translate(0,${innerH})`)
      .call(d3.axisBottom(x).ticks(d3.timeMonth.every(2)).tickFormat(d3.timeFormat("%Y/%m")))
      .selectAll("text").attr("font-size", "11px").style("fill", "var(--text-muted)");

    // task labels (left)
    g.selectAll(".task-label")
      .data(parsedTasks).enter().append("text")
      .attr("x", -8).attr("y", (d, i) => i * rowH + rowH / 2)
      .attr("text-anchor", "end")
      .attr("dy", "0.35em")
      .attr("font-size", "12px")
      .style("fill", "var(--text-primary)")
      .text(d => d.name);

    // task bars
    const barH = Math.min(rowH * 0.55, 20);
    g.selectAll(".task-bar")
      .data(parsedTasks).enter().append("rect")
      .attr("x", d => x(d._start))
      .attr("y", (d, i) => i * rowH + (rowH - barH) / 2)
      .attr("width", d => Math.max(2, x(d._end) - x(d._start)))
      .attr("height", barH)
      .attr("rx", 4)
      .attr("fill", d =>
        d.status === "in_progress" ? CHART_PALETTE[2] :
        d.status === "completed"   ? CHART_PALETTE[4] :
                                     "var(--bg-overlay)")
      .attr("stroke", CHART_PALETTE[0])
      .attr("stroke-width", 1);

    // progress fill
    g.selectAll(".task-progress")
      .data(parsedTasks).enter().append("rect")
      .attr("x", d => x(d._start))
      .attr("y", (d, i) => i * rowH + (rowH - barH) / 2)
      .attr("width", d => Math.max(0, (x(d._end) - x(d._start)) * (d.progress || 0)))
      .attr("height", barH)
      .attr("rx", 4)
      .attr("fill", CHART_PALETTE[0])
      .attr("opacity", 0.7);

    // today line
    if (today) {
      const tx = x(new Date(today));
      g.append("line").attr("x1", tx).attr("x2", tx).attr("y1", 0).attr("y2", innerH)
        .attr("stroke", "var(--color-critical)").attr("stroke-width", 2).attr("stroke-dasharray", "4,3");
      g.append("text").attr("x", tx + 4).attr("y", -4)
        .attr("font-size", "11px").style("fill", "var(--color-critical)").text("今日");
    }
  }, [JSON.stringify(tasks), height, today]);

  return React.createElement("svg", { ref, style: { width: "100%", display: "block" } });
};

/* ============================================================
   6. SparkLine — 迷你折線（KPI 卡內嵌）
   ============================================================ */
SP.SparkLine = function SparkLine({ data, width = 80, height = 24, color }) {
  // data: [number]
  const ref = useD3Mount((svg) => {
    svg.attr("viewBox", `0 0 ${width} ${height}`).attr("width", width).attr("height", height);
    if (!data || data.length === 0) return;
    const x = d3.scaleLinear().domain([0, data.length - 1]).range([1, width - 1]);
    const y = d3.scaleLinear().domain([d3.min(data) * 0.9, d3.max(data) * 1.1]).range([height - 2, 2]);
    const line = d3.line().x((d, i) => x(i)).y(d => y(d)).curve(d3.curveMonotoneX);
    svg.append("path").datum(data).attr("d", line)
      .attr("stroke", color || CHART_PALETTE[0]).attr("stroke-width", 1.5).attr("fill", "none");
  }, [JSON.stringify(data), width, height, color]);

  return React.createElement("svg", { ref });
};

/* ============================================================
   7. HeatMap — 漏水熱區 / 區處績效熱圖
   ============================================================ */
SP.HeatMap = function HeatMap({ data, rows, cols, height = 240, valueKey = "value", rowKey = "row", colKey = "col" }) {
  // data: [{ row, col, value }]
  const ref = useD3Mount((svg) => {
    const node = ref.current;
    const width = node.clientWidth || 480;
    const margin = { top: 24, right: 8, bottom: 8, left: 90 };
    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;

    svg.attr("viewBox", `0 0 ${width} ${height}`).attr("width", "100%").attr("height", height);
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand().domain(cols).range([0, innerW]).padding(0.05);
    const y = d3.scaleBand().domain(rows).range([0, innerH]).padding(0.05);

    const vmax = d3.max(data, d => d[valueKey]);
    const color = d3.scaleLinear().domain([0, vmax]).range(["oklch(0.96 0.01 250)", CHART_PALETTE[0]]);

    g.selectAll("rect")
      .data(data).enter().append("rect")
      .attr("x", d => x(d[colKey])).attr("y", d => y(d[rowKey]))
      .attr("width", x.bandwidth()).attr("height", y.bandwidth())
      .attr("fill", d => color(d[valueKey]))
      .attr("rx", 2);

    // col labels (top)
    g.selectAll(".col-label")
      .data(cols).enter().append("text")
      .attr("x", d => x(d) + x.bandwidth() / 2).attr("y", -8)
      .attr("text-anchor", "middle").attr("font-size", "10px").style("fill", "var(--text-muted)")
      .text(d => d);

    // row labels (left)
    g.selectAll(".row-label")
      .data(rows).enter().append("text")
      .attr("x", -6).attr("y", d => y(d) + y.bandwidth() / 2)
      .attr("text-anchor", "end").attr("dy", "0.35em")
      .attr("font-size", "11px").style("fill", "var(--text-secondary)")
      .text(d => d);
  }, [JSON.stringify(data), JSON.stringify(rows), JSON.stringify(cols), height]);

  return React.createElement("svg", { ref, style: { width: "100%", display: "block" } });
};

/* ============================================================
   8. ProgressBar — 帶標籤的進度條（合規矩陣、年度計畫用）
   ============================================================ */
SP.ProgressBar = function ProgressBar({ value, max = 100, label, suffix = "%", tone, height = 12 }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const color =
    tone === "critical" ? "var(--color-critical)" :
    tone === "high"     ? "var(--color-high)" :
    tone === "pass"     ? "var(--color-pass)" :
    tone === "medium"   ? "var(--color-medium)" :
                          "var(--tw-primary)";
  return React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: "0.25rem" } },
    label && React.createElement("div", { style: { display: "flex", justifyContent: "space-between", fontSize: "var(--text-sm)" } },
      React.createElement("span", null, label),
      React.createElement("span", { style: { fontWeight: 600 } }, value + suffix),
    ),
    React.createElement("div", { style: { background: "var(--bg-muted)", borderRadius: "var(--radius-sm)", height, overflow: "hidden" } },
      React.createElement("div", { style: { width: pct + "%", height: "100%", background: color, borderRadius: "var(--radius-sm)" } })
    )
  );
};
