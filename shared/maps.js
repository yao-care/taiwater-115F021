/* ============================================================
   shared/maps.js — GIS 地圖（D3 SVG）
   v1：簡化版台灣輪廓 + 案件 markers + WMTS/WMS toggle 預覽
   ============================================================ */

window.SP = window.SP || {};

/* ---------- 台灣 13 區處座標（中心點，POC 簡化） ---------- */
SP.REGION_CENTERS = {
  "第一區處（基隆）":  { lng: 121.74, lat: 25.13 },
  "第二區處（板新）":  { lng: 121.45, lat: 24.99 },
  "第三區處（桃園）":  { lng: 121.30, lat: 24.99 },
  "第四區處（中港）":  { lng: 120.70, lat: 24.55 },  // 苗栗中港
  "第五區處（中區）":  { lng: 120.68, lat: 24.15 },
  "第六區處（豐原）":  { lng: 120.72, lat: 24.25 },
  "第七區處（嘉義）":  { lng: 120.45, lat: 23.48 },
  "第八區處（雲林）":  { lng: 120.52, lat: 23.71 },
  "第九區處（台南）":  { lng: 120.22, lat: 23.00 },
  "第十區處（高雄）":  { lng: 120.30, lat: 22.63 },
  "第十一區處（屏東）": { lng: 120.49, lat: 22.67 },
  "第十二區處（宜蘭）": { lng: 121.75, lat: 24.75 },
  "第十三區處（東區）": { lng: 121.61, lat: 23.97 },
};

/* ---------- GisMap — 主地圖元件 ---------- */
SP.GisMap = function GisMap({ cases = [], pipes = [], height = 480, focus, onMarkerClick, layers = { wmts: true, wms: false, pipes: false, cases: true } }) {
  const ref = React.useRef(null);

  React.useEffect(() => {
    if (!ref.current || !window.d3) return;
    const node = ref.current;
    const width = node.clientWidth || 600;
    const svg = d3.select(node);
    svg.selectAll("*").remove();
    svg.attr("viewBox", `0 0 ${width} ${height}`).attr("width", "100%").attr("height", height);

    // 投影：台灣 lng 約 119.5~122.5，lat 21.8~25.5
    const lngExtent = [119.5, 122.5];
    const latExtent = [21.8, 25.5];
    const x = d3.scaleLinear().domain(lngExtent).range([20, width - 20]);
    const y = d3.scaleLinear().domain(latExtent).range([height - 20, 20]);  // y 反轉

    // ---- 背景：WMTS 模擬（淺水藍底） ----
    if (layers.wmts) {
      svg.append("rect")
        .attr("x", 0).attr("y", 0).attr("width", width).attr("height", height)
        .attr("fill", "var(--tw-water-light)");

      // 經緯網格
      const lngs = d3.range(120, 122.5, 0.5);
      const lats = d3.range(22, 26, 0.5);
      const grid = svg.append("g").attr("opacity", 0.3);
      lngs.forEach(lng => {
        grid.append("line")
          .attr("x1", x(lng)).attr("x2", x(lng))
          .attr("y1", 0).attr("y2", height)
          .attr("stroke", "var(--tw-accent)").attr("stroke-dasharray", "2,2");
      });
      lats.forEach(lat => {
        grid.append("line")
          .attr("y1", y(lat)).attr("y2", y(lat))
          .attr("x1", 0).attr("x2", width)
          .attr("stroke", "var(--tw-accent)").attr("stroke-dasharray", "2,2");
      });
    }

    // ---- 台灣輪廓（簡化多邊形） ----
    const taiwan = [
      [121.92, 25.30], [121.95, 25.13], [121.77, 24.90], [121.85, 24.55],
      [121.62, 24.00], [121.50, 23.10], [121.20, 22.85], [120.86, 22.00],
      [120.30, 22.55], [120.20, 23.20], [120.15, 24.10], [120.55, 24.85],
      [120.95, 25.05], [121.45, 25.30], [121.92, 25.30],
    ];
    const line = d3.line().x(d => x(d[0])).y(d => y(d[1])).curve(d3.curveCardinalClosed);
    svg.append("path")
      .datum(taiwan)
      .attr("d", line)
      .attr("fill", "var(--bg-surface)")
      .attr("stroke", "var(--tw-primary)")
      .attr("stroke-width", 1.5)
      .attr("opacity", 0.9);

    // ---- 13 區處中心 ----
    const regions = Object.entries(SP.REGION_CENTERS).map(([name, c]) => ({ name, ...c }));
    const rg = svg.append("g");
    regions.forEach(r => {
      rg.append("circle")
        .attr("cx", x(r.lng)).attr("cy", y(r.lat))
        .attr("r", 4)
        .attr("fill", "var(--tw-primary)")
        .attr("opacity", 0.5);
      rg.append("text")
        .attr("x", x(r.lng) + 6).attr("y", y(r.lat) - 4)
        .attr("font-size", "10px").attr("fill", "var(--text-secondary)")
        .text(r.name.replace("區處（", "·").replace("）", ""));
    });

    // ---- 管段（淡線） ----
    if (layers.pipes && pipes.length > 0) {
      svg.append("g")
        .selectAll("circle")
        .data(pipes)
        .enter().append("circle")
        .attr("cx", d => x(d.lng))
        .attr("cy", d => y(d.lat))
        .attr("r", 1.5)
        .attr("fill", d => d.risk === "critical" ? "var(--color-critical)" : d.risk === "high" ? "var(--color-high)" : "var(--tw-accent)")
        .attr("opacity", 0.5);
    }

    // ---- 案件 markers ----
    if (layers.cases) {
      const markers = svg.append("g")
        .selectAll("g.case-marker")
        .data(cases)
        .enter().append("g")
        .attr("class", "case-marker")
        .attr("transform", d => `translate(${x(d.lng)}, ${y(d.lat)})`)
        .style("cursor", onMarkerClick ? "pointer" : "default")
        .on("click", (e, d) => onMarkerClick && onMarkerClick(d));

      const severityColor = (s) => "var(--color-" + (s || "low") + ")";

      markers.append("circle")
        .attr("r", 8)
        .attr("fill", d => severityColor(d.severity))
        .attr("opacity", 0.25);
      markers.append("circle")
        .attr("r", 4)
        .attr("fill", d => severityColor(d.severity))
        .attr("stroke", "white")
        .attr("stroke-width", 1.5);
    }

    // ---- focus marker（單一案件 zoom-in 用） ----
    if (focus) {
      svg.append("circle")
        .attr("cx", x(focus.lng)).attr("cy", y(focus.lat))
        .attr("r", 14)
        .attr("fill", "none")
        .attr("stroke", "var(--color-critical)")
        .attr("stroke-width", 2.5)
        .attr("stroke-dasharray", "5,3");
    }

    // ---- 圖層 legend ----
    const legend = svg.append("g").attr("transform", `translate(${width - 130}, 12)`);
    legend.append("rect")
      .attr("width", 120).attr("height", layers.cases ? 80 : 30)
      .attr("rx", 4)
      .attr("fill", "var(--bg-surface)")
      .attr("opacity", 0.92)
      .attr("stroke", "var(--border-base)");
    legend.append("text").attr("x", 8).attr("y", 16)
      .attr("font-size", "11px").attr("font-weight", 700).text("圖例");
    if (layers.cases) {
      const items = [
        { color: "var(--color-critical)", label: "緊急" },
        { color: "var(--color-high)",     label: "高" },
        { color: "var(--color-medium)",   label: "中" },
        { color: "var(--color-low)",      label: "低" },
      ];
      items.forEach((it, i) => {
        legend.append("circle").attr("cx", 14).attr("cy", 30 + i * 12)
          .attr("r", 4).attr("fill", it.color);
        legend.append("text").attr("x", 24).attr("y", 33 + i * 12)
          .attr("font-size", "10px").text(it.label);
      });
    }

  }, [JSON.stringify(cases.map(c => ({ id: c.id, severity: c.severity, lng: c.lng, lat: c.lat }))),
      JSON.stringify(layers), height, focus?.id]);

  return <svg ref={ref} style={{ width: "100%", display: "block", borderRadius: "var(--radius-md)", border: "1px solid var(--border-base)" }} />;
};

/* ---------- WmtsToggle — 圖層控制 ---------- */
SP.WmtsToggle = function WmtsToggle({ layers, onChange }) {
  const items = [
    { key: "wmts",  label: "WMTS 底圖（內政部）", default: true },
    { key: "wms",   label: "WMS 道路圖層",         default: false },
    { key: "pipes", label: "管段（200 段）",       default: false },
    { key: "cases", label: "案件 markers",         default: true },
  ];
  return (
    <div style={{
      display: "flex", gap: "var(--space-3)", flexWrap: "wrap",
      padding: "var(--space-2) var(--space-3)",
      background: "var(--bg-muted)", borderRadius: "var(--radius-md)",
      fontSize: "var(--text-sm)",
    }}>
      {items.map(it => (
        <label key={it.key} style={{ display: "flex", alignItems: "center", gap: "0.375rem", cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={!!layers[it.key]}
            onChange={e => onChange({ ...layers, [it.key]: e.target.checked })}
          />
          {it.label}
        </label>
      ))}
    </div>
  );
};
