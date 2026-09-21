(() => {
  "use strict";

  const NS = "http://www.w3.org/2000/svg";
  const svg = document.getElementById("scene");
  const TIE = { x: 500, y: 905 };

  const rand = (a, b) => a + Math.random() * (b - a);
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp01 = (x) => Math.max(0, Math.min(1, x));
  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
  const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const easeOutBack = (t) => {
    const c1 = 1.5;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  };
  const f1 = (n) => n.toFixed(1);

  function el(tag, attrs, parent) {
    const node = document.createElementNS(NS, tag);
    for (const k in attrs) node.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(node);
    return node;
  }

  /* ---------------- Gradientes ---------------- */

  const defs = el("defs", {}, svg);

  function gradient(type, id, stops, attrs) {
    const g = el(type, { id, ...attrs }, defs);
    for (const [offset, color, opacity = 1] of stops) {
      el("stop", { offset, "stop-color": color, "stop-opacity": opacity }, g);
    }
  }
  const UP = { x1: 0, y1: 1, x2: 0, y2: 0 };

  gradient("linearGradient", "sunPetal", [[0, "#b35a04"], [0.3, "#ec990e"], [0.7, "#ffcb2e"], [1, "#ffe57a"]], UP);
  gradient("linearGradient", "sunPetalBack", [[0, "#854003"], [0.5, "#cc7c0a"], [1, "#e9ad2a"]], UP);
  gradient("radialGradient", "sunDisk", [[0, "#5e4214"], [0.55, "#3a230c"], [1, "#1c1005"]], {});
  gradient("radialGradient", "diskShine", [[0, "#fff1c0", 0.35], [1, "#fff1c0", 0]], { cx: 0.35, cy: 0.3, r: 0.75 });
  gradient("radialGradient", "rosePetal", [[0, "#9a4c00"], [0.35, "#e89400"], [0.7, "#ffc21a"], [1, "#ffdf5c"]], { cx: 0.5, cy: 1, r: 1.05 });
  gradient("radialGradient", "roseCore", [[0, "#8a4f00"], [0.6, "#c27a05"], [1, "#e8a514"]], {});
  gradient("linearGradient", "daisyPetal", [[0, "#e09400"], [0.55, "#ffd23f"], [1, "#fff0a6"]], UP);
  gradient("radialGradient", "daisyCenter", [[0, "#e07e00"], [0.7, "#8f4300"], [1, "#5e2a00"]], {});
  gradient("linearGradient", "leaf", [[0, "#1c4f18"], [0.55, "#2f8a2a"], [1, "#74c653"]], UP);
  gradient("linearGradient", "leafDark", [[0, "#123a10"], [0.6, "#23701f"], [1, "#4fa23c"]], UP);
  gradient("linearGradient", "paperBack", [[0, "#d9bf8c"], [1, "#b8965e"]], { x1: 0, y1: 0, x2: 0, y2: 1 });
  gradient("linearGradient", "paperLeft", [[0, "#f7e9cb"], [0.6, "#ead3a4"], [1, "#c9a66b"]], { x1: 0, y1: 0, x2: 1, y2: 0.3 });
  gradient("linearGradient", "paperRight", [[0, "#c29f63"], [0.45, "#e6cc98"], [1, "#f4e4c2"]], { x1: 0, y1: 0.3, x2: 1, y2: 0 });
  gradient("linearGradient", "ribbon", [[0, "#fff3b0"], [0.45, "#f7c52b"], [1, "#c48000"]], { x1: 0, y1: 0, x2: 1, y2: 1 });
  gradient("linearGradient", "grass", [[0, "#050f07"], [1, "#1f5a22"]], UP);
  gradient("radialGradient", "aura", [[0, "#ffd24d", 0.22], [0.6, "#ffb300", 0.06], [1, "#ffb300", 0]], {});

  const layer = {};
  for (const name of ["aura", "paperBack", "greens", "stems", "leaves", "heads", "grass", "paperFront", "ribbon"]) {
    layer[name] = el("g", {}, svg);
  }

  /* ---------------- Piezas ---------------- */

  function buildLeaf(parent, size, dark) {
    const g = el("g", { transform: "scale(0)" }, parent);
    const inner = el("g", { transform: `scale(${size})` }, g);
    el("path", {
      d: "M0 0 C 15 -12, 22 -40, 0 -66 C -22 -40, -15 -12, 0 0 Z",
      fill: `url(#${dark ? "leafDark" : "leaf"})`,
      stroke: "#143d12",
      "stroke-opacity": 0.45,
      "stroke-width": 0.8,
    }, inner);
    let veins = "M0 -2 Q 2 -32 0 -62";
    for (let k = 1; k <= 4; k++) {
      const y = -k * 12;
      veins += ` M0 ${y} Q 7 ${y - 5} 11 ${y - 11} M0 ${y} Q -7 ${y - 5} -11 ${y - 11}`;
    }
    el("path", { d: veins, fill: "none", stroke: "#0f330d", "stroke-opacity": 0.45, "stroke-width": 0.9 }, inner);
    return g;
  }

  function buildSunflower(head) {
    const R = 98;
    const r0 = 36;
    const petals = [];

    const addLayer = (parent, count, offset, fill, lenMul, delayBase) => {
      for (let i = 0; i < count; i++) {
        const a = offset + (i * 360) / count + rand(-3, 3);
        const L = (R - r0) * lenMul * rand(0.88, 1.06);
        const w = rand(10, 12.5);
        const tip = -(r0 + L);
        const sk = rand(-5, 5);
        const wrap = el("g", {}, parent);
        el("path", {
          d: `M0 ${-r0 + 5} C ${w} ${-r0 - L * 0.2}, ${w * 0.95 + sk} ${-r0 - L * 0.72}, ${sk} ${tip} C ${-w * 0.95 + sk} ${-r0 - L * 0.72}, ${-w} ${-r0 - L * 0.2}, 0 ${-r0 + 5} Z`,
          fill: `url(#${fill})`,
          stroke: "#8f4a00",
          "stroke-opacity": 0.35,
          "stroke-width": 0.8,
        }, wrap);
        el("path", {
          d: `M0 ${-r0} Q ${sk * 0.5} ${-r0 - L * 0.5} ${sk * 0.9} ${tip + 7}`,
          fill: "none",
          stroke: "#a85f00",
          "stroke-opacity": 0.35,
          "stroke-width": 1,
        }, wrap);
        petals.push({ node: wrap, a, delay: delayBase + i * 0.022 });
      }
    };

    addLayer(el("g", {}, head), 24, 7.5, "sunPetalBack", 1.06, 0);
    addLayer(el("g", {}, head), 24, 0, "sunPetal", 0.94, 0.25);

    const D = r0 + 6;
    el("circle", { r: D, fill: "url(#sunDisk)" }, head);
    const seeds = el("g", {}, head);
    const N = 300;
    for (let i = 1; i <= N; i++) {
      const q = Math.sqrt(i / N);
      const rr = (D - 3) * q;
      const ang = i * 2.39996;
      const x = rr * Math.cos(ang);
      const y = rr * Math.sin(ang);
      const size = 0.8 + 1.5 * q;
      const fill = q < 0.3 ? "#6d6a1e" : q < 0.82 ? (i % 3 ? "#35200e" : "#4f3013") : "#8e5012";
      el("ellipse", {
        cx: x.toFixed(2),
        cy: y.toFixed(2),
        rx: size.toFixed(2),
        ry: (size * 0.72).toFixed(2),
        transform: `rotate(${((ang * 180) / Math.PI).toFixed(1)} ${x.toFixed(2)} ${y.toFixed(2)})`,
        fill,
      }, seeds);
    }
    for (let i = 0; i < 46; i++) {
      const ang = (i / 46) * Math.PI * 2;
      el("circle", { cx: (Math.cos(ang) * (D - 1)).toFixed(2), cy: (Math.sin(ang) * (D - 1)).toFixed(2), r: 1.7, fill: "#d9961d" }, seeds);
    }
    el("circle", { r: D, fill: "url(#diskShine)" }, head);
    return petals;
  }

  function buildRose(head) {
    const rings = [
      { n: 5, r: 72, off: 0 },
      { n: 5, r: 61, off: 36 },
      { n: 5, r: 50, off: 12 },
      { n: 4, r: 39, off: 50 },
      { n: 4, r: 29, off: 5 },
      { n: 3, r: 20, off: 40 },
    ];
    const petals = [];
    rings.forEach((ring, k) => {
      if (k > 0) el("circle", { r: ring.r * 0.97, fill: "#5a2e00", "fill-opacity": 0.32 }, head);
      const g = el("g", {}, head);
      for (let i = 0; i < ring.n; i++) {
        const a = ring.off + (i * 360) / ring.n + rand(-6, 6);
        const Rk = ring.r * rand(0.95, 1.04);
        const w = Rk * Math.sin(Math.PI / ring.n) * 1.35;
        const base = Rk * 0.12;
        const wrap = el("g", {}, g);
        el("path", {
          d: `M ${-w * 0.35} ${-base} C ${-w * 1.15} ${-Rk * 0.45}, ${-w * 0.85} ${-Rk * 1.06}, 0 ${-Rk} C ${w * 0.85} ${-Rk * 1.06}, ${w * 1.15} ${-Rk * 0.45}, ${w * 0.35} ${-base} Z`,
          fill: "url(#rosePetal)",
          stroke: "#b06a05",
          "stroke-opacity": 0.5,
          "stroke-width": 1,
        }, wrap);
        el("path", {
          d: `M ${-w * 0.7} ${-Rk * 0.9} Q 0 ${-Rk * 1.08} ${w * 0.7} ${-Rk * 0.9}`,
          fill: "none",
          stroke: "#fff4b8",
          "stroke-opacity": 0.5,
          "stroke-width": 1.6,
          "stroke-linecap": "round",
        }, wrap);
        petals.push({ node: wrap, a, delay: (rings.length - 1 - k) * 0.13 + i * 0.04 });
      }
    });
    el("circle", { r: 11, fill: "url(#roseCore)" }, head);
    el("path", {
      d: "M0 0 m -2 0 a 2 2 0 1 1 4 0 a 4 4 0 1 1 -8 0 a 6 6 0 1 1 12 0 a 8 8 0 1 1 -16 0",
      fill: "none",
      stroke: "#7a4600",
      "stroke-opacity": 0.75,
      "stroke-width": 1.6,
    }, head);
    return petals;
  }

  function buildDaisy(head) {
    const R = 50;
    const r0 = 12;
    const petals = [];
    const g = el("g", {}, head);
    for (let i = 0; i < 14; i++) {
      const a = (i * 360) / 14 + rand(-4, 4);
      const L = (R - r0) * rand(0.9, 1.05);
      const w = 6 * rand(0.9, 1.1);
      const wrap = el("g", {}, g);
      el("path", {
        d: `M0 ${-r0 + 3} C ${w} ${-r0 - L * 0.15}, ${w} ${-r0 - L * 0.85}, ${w * 0.4} ${-r0 - L} Q 0 ${-r0 - L * 0.92} ${-w * 0.4} ${-r0 - L} C ${-w} ${-r0 - L * 0.85}, ${-w} ${-r0 - L * 0.15}, 0 ${-r0 + 3} Z`,
        fill: "url(#daisyPetal)",
        stroke: "#a86b00",
        "stroke-opacity": 0.35,
        "stroke-width": 0.7,
      }, wrap);
      petals.push({ node: wrap, a, delay: i * 0.03 });
    }
    el("circle", { r: r0 + 2, fill: "url(#daisyCenter)" }, head);
    for (let i = 1; i <= 50; i++) {
      const q = Math.sqrt(i / 50);
      const ang = i * 2.39996;
      el("circle", {
        cx: (Math.cos(ang) * q * r0).toFixed(2),
        cy: (Math.sin(ang) * q * r0).toFixed(2),
        r: (0.6 + q * 0.8).toFixed(2),
        fill: q > 0.75 ? "#ffc02e" : "#6b3000",
      }, head);
    }
    el("circle", { r: r0 + 2, fill: "url(#diskShine)" }, head);
    return petals;
  }

  const builders = { sun: buildSunflower, rose: buildRose, daisy: buildDaisy };

  /* ---------------- Ramo ---------------- */

  const PLAN = [
    { type: "sun", gx: 170, gy: 440, bx: 385, by: 425, s: 1.0 },
    { type: "sun", gx: 830, gy: 410, bx: 615, by: 415, s: 1.0 },
    { type: "sun", gx: 500, gy: 300, bx: 500, by: 300, s: 1.1 },
    { type: "rose", gx: 330, gy: 560, bx: 415, by: 565, s: 1.0 },
    { type: "rose", gx: 670, gy: 545, bx: 590, by: 560, s: 1.0 },
    { type: "rose", gx: 500, gy: 620, bx: 500, by: 470, s: 0.95 },
    { type: "rose", gx: 80, gy: 650, bx: 290, by: 525, s: 0.85 },
    { type: "rose", gx: 920, gy: 630, bx: 712, by: 520, s: 0.85 },
    { type: "daisy", gx: 250, gy: 730, bx: 300, by: 380, s: 0.9 },
    { type: "daisy", gx: 750, gy: 710, bx: 700, by: 370, s: 0.9 },
    { type: "daisy", gx: 420, gy: 770, bx: 430, by: 665, s: 0.78 },
    { type: "daisy", gx: 585, gy: 780, bx: 570, by: 672, s: 0.78 },
  ];

  const flowers = PLAN.map((p, i) => {
    const lean = rand(-35, 35);
    const f = {
      ...p,
      garden: [
        [p.gx, 1100],
        [p.gx + rand(-25, 25), lerp(1100, p.gy, 0.35)],
        [p.gx + lean * 0.5, lerp(1100, p.gy, 0.75)],
        [p.gx + lean, p.gy],
      ],
      bouquet: [
        [TIE.x + (p.bx - 500) * 0.06, 1065],
        [TIE.x + (p.bx - 500) * 0.03, TIE.y],
        [lerp(TIE.x, p.bx, 0.8), lerp(TIE.y, p.by, 0.55)],
        [p.bx, p.by],
      ],
      growAt: 0.3 + i * 0.22,
      gatherAt: 7.4 + i * 0.06,
      phase: rand(0, Math.PI * 2),
      grown: false,
      bloomed: false,
    };
    f.bloomAt = f.growAt + 1.5;
    const width = p.type === "sun" ? 7 : 5;
    const dash = { pathLength: 1, "stroke-dasharray": "1 1", "stroke-dashoffset": 1, "stroke-linecap": "round", fill: "none" };
    f.stem = el("path", { ...dash, stroke: "#2d7526", "stroke-width": width }, layer.stems);
    f.stemHi = el("path", { ...dash, stroke: "#9ad873", "stroke-opacity": 0.45, "stroke-width": 1.3, transform: "translate(-1.4 0)" }, layer.stems);
    f.leaves = [
      { u: 0.5, side: 1 },
      { u: 0.7, side: -1 },
    ].map((o) => ({ ...o, node: buildLeaf(layer.leaves, p.type === "sun" ? 1.15 : 0.85, o.side < 0) }));
    f.head = el("g", { transform: "scale(0)" }, layer.heads);
    f.petals = builders[p.type](f.head);
    return f;
  });

  // Follaje y paniculata que aparecen al formar el ramo
  const extras = [];
  for (let k = 0; k < 14; k++) {
    const a = lerp(-172, -8, k / 13) * (Math.PI / 180);
    const x = 500 + Math.cos(a) * 250 * rand(0.9, 1.02);
    const y = 500 + Math.sin(a) * 240 * rand(0.9, 1.02);
    const node = buildLeaf(layer.greens, rand(1.4, 1.9), k % 2 === 0);
    extras.push({ node, x, y, rot: (a * 180) / Math.PI + 90 + rand(-12, 12), at: 7.9 + k * 0.06 });
  }

  const sprigs = [];
  for (let k = 0; k < 9; k++) {
    const a = lerp(-165, -15, k / 8) * (Math.PI / 180) + rand(-0.08, 0.08);
    const cx = 500 + Math.cos(a) * 285;
    const cy = 520 + Math.sin(a) * 280;
    const g = el("g", { opacity: 0 }, layer.greens);
    el("path", {
      d: `M${TIE.x} ${TIE.y} Q ${f1(lerp(TIE.x, cx, 0.7))} ${f1(lerp(TIE.y, cy, 0.3))} ${f1(cx)} ${f1(cy)}`,
      fill: "none",
      stroke: "#5f7f3c",
      "stroke-width": 1.4,
    }, g);
    for (let d = 0; d < 16; d++) {
      const dx = cx + rand(-30, 30);
      const dy = cy + rand(-26, 22);
      el("path", { d: `M${f1(cx)} ${f1(cy)} L${f1(dx)} ${f1(dy)}`, stroke: "#6f8f4a", "stroke-width": 0.7 }, g);
      el("circle", { cx: f1(dx), cy: f1(dy), r: rand(2.4, 4).toFixed(1), fill: "#fffdf3", stroke: "#e6dcc0", "stroke-width": 0.8 }, g);
    }
    sprigs.push({ node: g, at: 8.2 + k * 0.08 });
  }

  const aura = el("circle", { cx: 500, cy: 480, r: 420, fill: "url(#aura)", opacity: 0 }, layer.aura);

  // Papel kraft
  el("path", {
    d: "M205 650 Q300 585 385 632 Q445 575 500 625 Q555 575 615 632 Q700 585 795 650 L535 985 L465 985 Z",
    fill: "url(#paperBack)",
    stroke: "#9c7a45",
    "stroke-opacity": 0.5,
    "stroke-width": 1.5,
  }, layer.paperBack);
  el("path", {
    d: "M780 712 C 690 690, 585 720, 468 790 L 478 988 L 535 988 Z",
    fill: "url(#paperRight)",
    stroke: "#9c7a45",
    "stroke-opacity": 0.55,
    "stroke-width": 1.5,
  }, layer.paperFront);
  el("path", {
    d: "M220 716 C 310 692, 420 724, 532 796 L 522 988 L 465 988 Z",
    fill: "url(#paperLeft)",
    stroke: "#9c7a45",
    "stroke-opacity": 0.55,
    "stroke-width": 1.5,
  }, layer.paperFront);
  el("path", {
    d: "M300 722 Q 400 830 472 975 M700 716 Q 600 830 528 975",
    fill: "none",
    stroke: "#785a28",
    "stroke-opacity": 0.22,
    "stroke-width": 2,
  }, layer.paperFront);

  // Lazo
  const ribbonAttrs = { fill: "url(#ribbon)", stroke: "#a86b00", "stroke-opacity": 0.5, "stroke-width": 1.2 };
  el("path", { ...ribbonAttrs, d: "M494 940 C 480 975, 462 1010, 446 1052 L 462 1044 L 474 1062 C 484 1022, 496 985, 506 944 Z" }, layer.ribbon);
  el("path", { ...ribbonAttrs, d: "M506 940 C 520 975, 538 1010, 554 1052 L 538 1044 L 526 1062 C 516 1022, 504 985, 494 944 Z" }, layer.ribbon);
  el("path", { ...ribbonAttrs, d: "M408 918 Q500 934 592 918 L588 944 Q500 960 412 944 Z" }, layer.ribbon);
  el("path", { ...ribbonAttrs, d: "M498 934 C 455 880, 388 885, 402 930 C 412 965, 470 958, 498 934 Z" }, layer.ribbon);
  el("path", { ...ribbonAttrs, d: "M502 934 C 545 880, 612 885, 598 930 C 588 965, 530 958, 502 934 Z" }, layer.ribbon);
  el("path", {
    d: "M490 931 C 460 900, 420 905, 424 928 M510 931 C 540 900, 580 905, 576 928",
    fill: "none",
    stroke: "#9a5f00",
    "stroke-opacity": 0.4,
    "stroke-width": 2,
  }, layer.ribbon);
  el("ellipse", { ...ribbonAttrs, cx: 500, cy: 934, rx: 14, ry: 12 }, layer.ribbon);
  layer.paperBack.setAttribute("opacity", 0);
  layer.paperFront.setAttribute("opacity", 0);
  layer.ribbon.setAttribute("opacity", 0);

  // Pasto
  for (let k = 0; k < 90; k++) {
    const x = rand(-10, 1010);
    const h = rand(40, 150);
    const w = rand(5, 11);
    const bend = rand(-25, 25);
    el("path", {
      class: "grass-blade",
      d: `M${f1(x - w / 2)} 1102 Q ${f1(x + bend * 0.3)} ${f1(1100 - h * 0.6)} ${f1(x + bend)} ${f1(1100 - h)} Q ${f1(x + bend * 0.3 + w * 0.2)} ${f1(1100 - h * 0.55)} ${f1(x + w / 2)} 1102 Z`,
      fill: "url(#grass)",
      opacity: rand(0.75, 1).toFixed(2),
      style: `--dur:${rand(2.5, 4.5).toFixed(2)}s;--delay:${(-rand(0, 4)).toFixed(2)}s`,
    }, layer.grass);
  }

  /* ---------------- Animación ---------------- */

  function bezier(P, t) {
    const u = 1 - t;
    const a = u * u * u, b = 3 * u * u * t, c = 3 * u * t * t, d = t * t * t;
    return [a * P[0][0] + b * P[1][0] + c * P[2][0] + d * P[3][0], a * P[0][1] + b * P[1][1] + c * P[2][1] + d * P[3][1]];
  }

  function tangent(P, t) {
    const u = 1 - t;
    const k = (i) => 3 * u * u * (P[1][i] - P[0][i]) + 6 * u * t * (P[2][i] - P[1][i]) + 3 * t * t * (P[3][i] - P[2][i]);
    return [k(0), k(1)];
  }

  const angleDeg = ([dx, dy]) => (Math.atan2(dy, dx) * 180) / Math.PI;

  function updateFlower(f, t) {
    const gt = easeInOutCubic(clamp01((t - f.gatherAt) / 2.4));
    const P = f.garden.map((g, k) => [lerp(g[0], f.bouquet[k][0], gt), lerp(g[1], f.bouquet[k][1], gt)]);
    const amp = lerp(7, 2.5, gt);
    const sway = Math.sin(t * 1.2 + f.phase) * amp;
    P[3][0] += sway;
    P[3][1] += Math.cos(t * 0.9 + f.phase) * amp * 0.3;
    P[2][0] += sway * 0.55;

    const d = `M${f1(P[0][0])} ${f1(P[0][1])}C${f1(P[1][0])} ${f1(P[1][1])} ${f1(P[2][0])} ${f1(P[2][1])} ${f1(P[3][0])} ${f1(P[3][1])}`;
    f.stem.setAttribute("d", d);
    f.stemHi.setAttribute("d", d);

    if (!f.grown) {
      const grow = easeOutCubic(clamp01((t - f.growAt) / 1.8));
      const off = (1 - grow).toFixed(4);
      f.stem.setAttribute("stroke-dashoffset", off);
      f.stemHi.setAttribute("stroke-dashoffset", off);
      f.grown = grow >= 1;
    }

    for (const lf of f.leaves) {
      const [x, y] = bezier(P, lf.u);
      const rot = angleDeg(tangent(P, lf.u)) + 90 + lf.side * 48;
      const s = easeOutBack(clamp01((t - (f.growAt + 1.8 * lf.u)) / 0.7));
      lf.node.setAttribute("transform", `translate(${f1(x)} ${f1(y)}) rotate(${f1(rot)}) scale(${s.toFixed(3)})`);
    }

    const hs = easeOutBack(clamp01((t - f.bloomAt) / 1.1));
    const tilt = (angleDeg(tangent(P, 1)) + 90) * 0.35;
    f.head.setAttribute("transform", `translate(${f1(P[3][0])} ${f1(P[3][1])}) rotate(${f1(tilt)}) scale(${(hs * f.s).toFixed(3)})`);

    if (!f.bloomed) {
      let done = true;
      for (const p of f.petals) {
        const q = clamp01((t - f.bloomAt - 0.15 - p.delay) / 0.9);
        if (q < 1) done = false;
        const e = easeOutBack(q);
        p.node.setAttribute("transform", `rotate(${(p.a + (1 - e) * 25).toFixed(2)}) scale(${lerp(0.15, 1, e).toFixed(3)})`);
      }
      f.bloomed = done;
    }
  }

  function updateBouquet(t) {
    const pp = easeOutCubic(clamp01((t - 9.2) / 1.4));
    const shift = `translate(0 ${f1((1 - pp) * 160)})`;
    for (const g of [layer.paperBack, layer.paperFront]) {
      g.setAttribute("opacity", pp.toFixed(3));
      g.setAttribute("transform", shift);
    }
    const rb = easeOutBack(clamp01((t - 10.3) / 0.9));
    layer.ribbon.setAttribute("opacity", rb > 0 ? 1 : 0);
    layer.ribbon.setAttribute("transform", `translate(500 934) scale(${rb.toFixed(3)}) translate(-500 -934)`);

    aura.setAttribute("opacity", easeOutCubic(clamp01((t - 7.6) / 2.5)).toFixed(3));
    for (const g of extras) {
      const s = easeOutBack(clamp01((t - g.at) / 0.9));
      g.node.setAttribute("transform", `translate(${f1(g.x)} ${f1(g.y)}) rotate(${f1(g.rot + Math.sin(t * 0.8 + g.x) * 2)}) scale(${s.toFixed(3)})`);
    }
    for (const s of sprigs) s.node.setAttribute("opacity", clamp01((t - s.at) / 1).toFixed(3));
  }

  /* ---------------- Cielo: estrellas, luciérnagas, pétalos, corazones ---------------- */

  const sky = document.getElementById("sky");
  const ctx = sky.getContext("2d");
  let W = 0, H = 0;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    sky.width = W * dpr;
    sky.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  window.addEventListener("resize", resize);
  resize();

  const glow = document.createElement("canvas");
  glow.width = glow.height = 64;
  {
    const g = glow.getContext("2d");
    const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grd.addColorStop(0, "rgba(255,240,150,1)");
    grd.addColorStop(0.25, "rgba(255,205,70,0.45)");
    grd.addColorStop(1, "rgba(255,190,40,0)");
    g.fillStyle = grd;
    g.fillRect(0, 0, 64, 64);
  }

  const stars = Array.from({ length: 170 }, () => ({ x: Math.random(), y: Math.random() * 0.8, r: rand(0.4, 1.4), p: rand(0, 6.28), s: rand(0.6, 2) }));
  const flies = Array.from({ length: 28 }, () => ({ x: Math.random(), y: rand(0.2, 0.95), a: rand(0, 6.28), v: rand(0.012, 0.03), p: rand(0, 6.28), s: rand(10, 24) }));
  const spawnPetal = (p = {}, initial) =>
    Object.assign(p, { x: rand(0, W), y: initial ? -rand(20, H * 1.2) : -20, r: rand(5, 9), rot: rand(0, 6.28), vr: rand(-2, 2), vy: rand(25, 55), ph: rand(0, 6.28) });
  const fallingPetals = Array.from({ length: 24 }, () => spawnPetal({}, true));
  const spawnHeart = (h = {}, initial) =>
    Object.assign(h, { x: rand(0, W), y: H + (initial ? rand(0, H) : 20), vy: rand(20, 45), s: rand(8, 16), ph: rand(0, 6.28) });
  const hearts = Array.from({ length: 12 }, () => spawnHeart({}, true));

  function heartPath(x, y, s) {
    ctx.beginPath();
    ctx.moveTo(x, y + s * 0.3);
    ctx.bezierCurveTo(x, y, x - s * 0.5, y, x - s * 0.5, y + s * 0.3);
    ctx.bezierCurveTo(x - s * 0.5, y + s * 0.6, x, y + s * 0.75, x, y + s);
    ctx.bezierCurveTo(x, y + s * 0.75, x + s * 0.5, y + s * 0.6, x + s * 0.5, y + s * 0.3);
    ctx.bezierCurveTo(x + s * 0.5, y, x, y, x, y + s * 0.3);
    ctx.fill();
  }

  function drawSky(t, dt) {
    ctx.clearRect(0, 0, W, H);

    for (const s of stars) {
      ctx.globalAlpha = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(t * s.s + s.p));
      ctx.fillStyle = "#fffae6";
      ctx.beginPath();
      ctx.arc(s.x * W, s.y * H, s.r, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalCompositeOperation = "lighter";
    for (const f of flies) {
      f.a += Math.sin(t * 0.7 + f.p) * dt;
      f.x = (f.x + Math.cos(f.a) * f.v * dt + 1) % 1;
      f.y += Math.sin(f.a) * f.v * dt;
      if (f.y < 0.15 || f.y > 0.98) f.a = -f.a;
      ctx.globalAlpha = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * 2.2 + f.p));
      ctx.drawImage(glow, f.x * W - f.s / 2, f.y * H - f.s / 2, f.s, f.s);
    }
    ctx.globalCompositeOperation = "source-over";

    if (t > 10.5) {
      const fade = clamp01((t - 10.5) / 2);
      for (const p of fallingPetals) {
        p.y += p.vy * dt;
        p.x += Math.sin(t * 1.3 + p.ph) * 22 * dt;
        p.rot += p.vr * dt;
        if (p.y > H + 20) spawnPetal(p);
        ctx.save();
        ctx.globalAlpha = 0.9 * fade;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        const grd = ctx.createLinearGradient(0, -p.r, 0, p.r);
        grd.addColorStop(0, "#fff0a0");
        grd.addColorStop(1, "#f2a900");
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.ellipse(0, 0, p.r * 0.55, p.r, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      ctx.fillStyle = "#ffcf40";
      for (const h of hearts) {
        h.y -= h.vy * dt;
        if (h.y < -30) spawnHeart(h);
        ctx.globalAlpha = fade * 0.55 * (0.6 + 0.4 * Math.sin(t * 2 + h.ph));
        heartPath(h.x + Math.sin(t + h.ph) * 12, h.y, h.s);
      }
    }
    ctx.globalAlpha = 1;
  }

  /* ---------------- Fotos: una distinta cada segundo ---------------- */

  const PHOTOS = Array.from({ length: 13 }, (_, i) => `fotos/foto${String(i + 1).padStart(2, "0")}.jpg`);
  for (const src of PHOTOS) new Image().src = src;

  const polaroid = document.getElementById("polaroid");
  const imgs = polaroid.querySelectorAll(".polaroid__img");
  let front = 0;
  let bag = [];
  let lastShown = -1;

  function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // Bolsa barajada: salen todas sin repetir; al vaciarse se baraja de nuevo sin repetir la última.
  function nextPhoto() {
    if (!bag.length) {
      bag = shuffle(PHOTOS.map((_, i) => i));
      if (bag[bag.length - 1] === lastShown) [bag[0], bag[bag.length - 1]] = [bag[bag.length - 1], bag[0]];
    }
    lastShown = bag.pop();
    return PHOTOS[lastShown];
  }

  function showNextPhoto() {
    const back = imgs[1 - front];
    back.src = nextPhoto();
    const swap = () => {
      back.classList.add("is-visible");
      imgs[front].classList.remove("is-visible");
      front = 1 - front;
    };
    back.decode().then(swap, swap);
  }

  /* ---------------- Música ---------------- */

  const song = document.getElementById("song");
  const musicBtn = document.getElementById("music");

  function setMuted(muted) {
    musicBtn.classList.toggle("is-muted", muted);
    musicBtn.setAttribute("aria-label", muted ? "Reproducir música" : "Pausar música");
  }

  function tryPlay() {
    song.play().then(() => setMuted(false), () => setMuted(true));
  }

  function onFirstTouch(e) {
    if (musicBtn.contains(e.target)) return;
    window.removeEventListener("pointerdown", onFirstTouch);
    if (song.paused) tryPlay();
  }

  window.addEventListener("pointerdown", onFirstTouch);
  musicBtn.addEventListener("click", () => {
    if (song.paused) tryPlay();
    else {
      song.pause();
      setMuted(true);
    }
  });
  tryPlay();

  /* ---------------- Bucle principal ---------------- */

  const message = document.getElementById("message");
  let t0 = null;
  let prev = 0;
  let photosStarted = false;

  function frame(now) {
    if (t0 === null) t0 = now;
    const t = (now - t0) / 1000;
    const dt = Math.min(0.05, t - prev);
    prev = t;

    for (const f of flowers) updateFlower(f, t);
    updateBouquet(t);
    drawSky(t, dt);

    if (!photosStarted && t > 2.2) {
      photosStarted = true;
      polaroid.classList.add("is-in");
      showNextPhoto();
      setInterval(showNextPhoto, 1000);
    }
    if (t > 11) message.classList.add("is-visible");

    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
})();
