(() => {
  "use strict";

  const $ = selector => document.querySelector(selector);
  const currency = new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });
  const dateFormatter = new Intl.DateTimeFormat("es-AR");

  const els = {
    form: $("#quoteForm"), quoteNumber: $("#quoteNumber"), clientName: $("#clientName"), clientPhone: $("#clientPhone"),
    eventType: $("#eventType"), eventDate: $("#eventDate"), eventLocation: $("#eventLocation"), serviceHours: $("#serviceHours"),
    guestCount: $("#guestCount"), guestHint: $("#guestHint"), depositPercent: $("#depositPercent"), planGrid: $("#planGrid"),
    productSelect: $("#productSelect"), addProduct: $("#addProduct"), selectedProducts: $("#selectedProducts"), travelCost: $("#travelCost"),
    otherCost: $("#otherCost"), manualDiscount: $("#manualDiscount"), notes: $("#notes"), summaryPlan: $("#summaryPlan"),
    summaryPeople: $("#summaryPeople"), grandTotal: $("#grandTotal"), perPersonTotal: $("#perPersonTotal"), planSubtotal: $("#planSubtotal"),
    productsSubtotal: $("#productsSubtotal"), adjustmentsSubtotal: $("#adjustmentsSubtotal"), autoDiscountLabel: $("#autoDiscountLabel"),
    autoDiscountAmount: $("#autoDiscountAmount"), manualDiscountAmount: $("#manualDiscountAmount"), depositAmount: $("#depositAmount"),
    depositLabel: $("#depositLabel"), balanceAmount: $("#balanceAmount"), sharePdf: $("#sharePdf"), downloadPdf: $("#downloadPdf"),
    copyQuote: $("#copyQuote"), reloadPrices: $("#reloadPrices"), shareHelp: $("#shareHelp"), toast: $("#toast")
  };

  if (location.protocol === "file:") $("#fileWarning").classList.remove("hidden");

  let config = ImperioStore.load();
  let selectedPlanId = config.plans.find(plan => plan.active)?.id || null;
  let cart = [];

  const escapeHtml = value => String(value ?? "").replace(/[&<>'"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char]));
  const numberOf = element => Number.isFinite(Number(element.value)) ? Number(element.value) : 0;
  const money = value => currency.format(Math.round(Number(value) || 0));
  const formatDate = value => value ? dateFormatter.format(new Date(`${value}T12:00:00`)) : "A coordinar";

  function showToast(message) {
    els.toast.textContent = message;
    els.toast.classList.add("show");
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => els.toast.classList.remove("show"), 2600);
  }

  function generateQuoteNumber() {
    const now = new Date();
    const date = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
    const time = `${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}`;
    return `ID-${date}-${time}`;
  }

  function planTone(plan) {
    const name = plan.name.toLowerCase();
    if (name.includes("silver")) return "silver";
    if (name.includes("gold")) return "gold";
    if (name.includes("black")) return "black";
    return "economic";
  }

  function reloadConfig(showMessage = true) {
    const previousPlan = selectedPlanId;
    config = ImperioStore.load();
    selectedPlanId = config.plans.some(plan => plan.id === previousPlan && plan.active)
      ? previousPlan
      : (config.plans.find(plan => plan.active)?.id || null);
    cart = cart.filter(item => config.products.some(product => product.id === item.productId && product.active));
    const minimum = config.business.minimumGuests || 1;
    els.guestCount.min = String(minimum);
    if (numberOf(els.guestCount) < minimum) els.guestCount.value = String(minimum);
    els.depositPercent.value = String(config.business.depositPercent ?? 30);
    renderPlans();
    renderProductSelect();
    renderCart();
    update();
    if (showMessage) showToast("Precios actualizados");
  }

  function renderPlans() {
    els.planGrid.innerHTML = "";
    const plans = config.plans.filter(plan => plan.active);
    if (!plans.length) {
      els.planGrid.innerHTML = '<div class="empty">No hay planes activos. Agregalos desde Administración.</div>';
      return;
    }

    plans.forEach(plan => {
      const card = document.createElement("label");
      card.className = `plan-card ${plan.id === selectedPlanId ? "selected" : ""}`;
      card.dataset.tone = planTone(plan);
      const visibleIncludes = plan.includes.slice(0, 6).map(item => `<li>${escapeHtml(item)}</li>`).join("");
      const remaining = plan.includes.length > 6 ? `<li>+ ${plan.includes.length - 6} opciones más</li>` : "";
      card.innerHTML = `
        <input type="radio" name="plan" value="${escapeHtml(plan.id)}" ${plan.id === selectedPlanId ? "checked" : ""}>
        <h3>${escapeHtml(plan.name)}</h3>
        <p>${escapeHtml(plan.description)}</p>
        <ul class="includes">${visibleIncludes}${remaining}</ul>
        <div class="plan-price-row"><div><div class="price">${money(plan.price)}</div><small>por persona</small></div><span class="plan-check">✓</span></div>`;
      card.querySelector("input").addEventListener("change", () => {
        selectedPlanId = plan.id;
        renderPlans();
        update();
      });
      els.planGrid.appendChild(card);
    });
  }

  function renderProductSelect() {
    const activeProducts = config.products.filter(product => product.active);
    els.productSelect.innerHTML = '<option value="">Seleccionar producto…</option>' + activeProducts.map(product =>
      `<option value="${escapeHtml(product.id)}">${escapeHtml(product.category)} · ${escapeHtml(product.name)} — ${money(product.price)} / ${escapeHtml(product.unit)}</option>`
    ).join("");
  }

  function addProduct() {
    const productId = els.productSelect.value;
    if (!productId) return showToast("Elegí un producto");
    const existing = cart.find(item => item.productId === productId);
    if (existing) existing.qty += 1;
    else cart.push({ id: ImperioStore.uid("line"), productId, qty: 1 });
    els.productSelect.value = "";
    renderCart();
    update();
  }

  function renderCart() {
    els.selectedProducts.innerHTML = "";
    if (!cart.length) {
      els.selectedProducts.innerHTML = '<div class="empty">No agregaste productos adicionales.</div>';
      return;
    }

    cart.forEach(item => {
      const product = config.products.find(candidate => candidate.id === item.productId);
      if (!product) return;
      const row = document.createElement("div");
      row.className = "product-row";
      row.innerHTML = `
        <div><strong>${escapeHtml(product.name)}</strong><small>${escapeHtml(product.category)} · ${money(product.price)} por ${escapeHtml(product.unit)}</small></div>
        <input aria-label="Cantidad de ${escapeHtml(product.name)}" type="number" min="0.01" step="0.01" value="${item.qty}">
        <strong class="line-total">${money(product.price * item.qty)}</strong>
        <button class="icon-btn" type="button" aria-label="Quitar producto">×</button>`;
      row.querySelector("input").addEventListener("input", event => {
        item.qty = Math.max(0.01, Number(event.target.value) || 0.01);
        row.querySelector(".line-total").textContent = money(product.price * item.qty);
        update();
      });
      row.querySelector("button").addEventListener("click", () => {
        cart = cart.filter(candidate => candidate.id !== item.id);
        renderCart();
        update();
      });
      els.selectedProducts.appendChild(row);
    });
  }

  function quote() {
    const minimumGuests = Math.max(1, Number(config.business.minimumGuests) || 1);
    const enteredGuests = Math.max(0, Math.floor(numberOf(els.guestCount)));
    const billableGuests = Math.max(minimumGuests, enteredGuests || minimumGuests);
    const plan = config.plans.find(candidate => candidate.id === selectedPlanId && candidate.active)
      || config.plans.find(candidate => candidate.active)
      || null;
    const planUnitPrice = Math.max(0, Number(plan?.price) || 0);
    const planSubtotal = planUnitPrice * billableGuests;

    const products = cart.map(item => {
      const product = config.products.find(candidate => candidate.id === item.productId && candidate.active);
      if (!product) return null;
      const qty = Math.max(0, Number(item.qty) || 0);
      const unitPrice = Math.max(0, Number(product.price) || 0);
      return { ...item, qty, product, unitPrice, total: unitPrice * qty };
    }).filter(Boolean);
    const productsSubtotal = products.reduce((sum, item) => sum + item.total, 0);
    const travel = Math.max(0, numberOf(els.travelCost));
    const other = Math.max(0, numberOf(els.otherCost));
    const adjustments = travel + other;

    const tier = ImperioStore.discountTier(billableGuests, config);
    const automaticDiscountPercent = Math.min(100, Math.max(0, Number(tier.percent) || 0));
    const automaticDiscount = planSubtotal * automaticDiscountPercent / 100;
    const beforeManualDiscount = Math.max(0, planSubtotal + productsSubtotal + adjustments - automaticDiscount);
    const requestedManualDiscount = Math.max(0, numberOf(els.manualDiscount));
    const manualDiscount = Math.min(requestedManualDiscount, beforeManualDiscount);
    const total = Math.max(0, beforeManualDiscount - manualDiscount);
    const depositPercent = Math.min(100, Math.max(0, numberOf(els.depositPercent)));
    const deposit = total * depositPercent / 100;
    const balance = Math.max(0, total - deposit);

    return {
      minimumGuests, enteredGuests, billableGuests, plan, planUnitPrice, planSubtotal,
      products, productsSubtotal, travel, other, adjustments, tier,
      automaticDiscountPercent, automaticDiscount, requestedManualDiscount, manualDiscount,
      total, depositPercent, deposit, balance
    };
  }

  function update() {
    const data = quote();
    const belowMinimum = data.enteredGuests > 0 && data.enteredGuests < data.minimumGuests;
    els.guestCount.classList.toggle("input-error", belowMinimum);
    els.guestHint.textContent = belowMinimum
      ? `El mínimo es ${data.minimumGuests}. El cálculo se realiza sobre ${data.billableGuests} personas.`
      : `Mínimo de contratación: ${data.minimumGuests} personas.`;

    els.summaryPlan.textContent = data.plan?.name || "Sin plan activo";
    els.summaryPeople.textContent = data.enteredGuests && data.enteredGuests !== data.billableGuests
      ? `${data.enteredGuests} invitados · se facturan ${data.billableGuests}`
      : `Para ${data.billableGuests} personas`;
    els.planSubtotal.textContent = money(data.planSubtotal);
    els.productsSubtotal.textContent = money(data.productsSubtotal);
    els.adjustmentsSubtotal.textContent = money(data.adjustments);
    els.autoDiscountLabel.textContent = `Descuento por cantidad (${data.automaticDiscountPercent}%)`;
    els.autoDiscountAmount.textContent = `-${money(data.automaticDiscount)}`;
    els.manualDiscountAmount.textContent = `-${money(data.manualDiscount)}`;
    els.grandTotal.textContent = money(data.total);
    els.perPersonTotal.textContent = `${money(data.billableGuests ? data.total / data.billableGuests : 0)} por persona facturable`;
    els.depositAmount.textContent = money(data.deposit);
    els.depositLabel.textContent = `${data.depositPercent}% del total`;
    els.balanceAmount.textContent = money(data.balance);

    if (data.requestedManualDiscount > data.manualDiscount) {
      els.manualDiscount.title = "El descuento fue limitado para que el total no sea negativo.";
    } else {
      els.manualDiscount.removeAttribute("title");
    }
  }

  function buildMessage() {
    const data = quote();
    const included = data.plan?.includes?.length ? data.plan.includes.map(item => `• ${item}`).join("\n") : "• A confirmar";
    const products = data.products.length
      ? data.products.map(item => `• ${item.product.name}: ${item.qty} ${item.product.unit} — ${money(item.total)}`).join("\n")
      : "• Sin productos adicionales";
    const peopleText = data.enteredGuests && data.enteredGuests !== data.billableGuests
      ? `${data.enteredGuests} invitados (mínimo facturable: ${data.billableGuests})`
      : `${data.billableGuests}`;

    return [
      `*PRESUPUESTO ${String(config.business.name || "IMPERIO DRINKS").toUpperCase()}*`,
      `N.º: ${els.quoteNumber.value || generateQuoteNumber()}`,
      "",
      `Cliente: ${els.clientName.value.trim() || "A confirmar"}`,
      `Evento: ${els.eventType.value}`,
      `Fecha: ${formatDate(els.eventDate.value)}`,
      `Lugar: ${els.eventLocation.value.trim() || "A confirmar"}`,
      `Personas: ${peopleText}`,
      "",
      `*${data.plan?.name || "Plan"}* — ${money(data.planUnitPrice)} por persona`,
      "Incluye:", included,
      "",
      "Productos adicionales:", products,
      "",
      `Subtotal del plan: ${money(data.planSubtotal)}`,
      `Productos: ${money(data.productsSubtotal)}`,
      `Traslado y otros: ${money(data.adjustments)}`,
      `Descuento por cantidad (${data.automaticDiscountPercent}%): -${money(data.automaticDiscount)}`,
      `Descuento manual: -${money(data.manualDiscount)}`,
      `*TOTAL: ${money(data.total)}*`,
      `Seña (${data.depositPercent}%): ${money(data.deposit)}`,
      `Saldo: ${money(data.balance)}`,
      els.notes.value.trim() ? `\nObservaciones: ${els.notes.value.trim()}` : "",
      `\nVigencia: ${config.business.validityDays} días.`
    ].filter(Boolean).join("\n");
  }

  async function copyMessage() {
    try {
      await navigator.clipboard.writeText(buildMessage());
      showToast("Resumen copiado");
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = buildMessage();
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      textarea.remove();
      showToast("Resumen copiado");
    }
  }

  function cleanPdfText(value) {
    return String(value ?? "")
      .replace(/[–—]/g, "-")
      .replace(/[“”]/g, '"')
      .replace(/[‘’]/g, "'")
      .replace(/•/g, "-")
      .replace(/✓/g, "-")
      .replace(/[^\x20-\x7E\xA0-\xFF]/g, "");
  }
  const pdfEscape = value => cleanPdfText(value).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
  function latin1Bytes(value) { const bytes = new Uint8Array(value.length); for (let i = 0; i < value.length; i += 1) bytes[i] = value.charCodeAt(i) & 255; return bytes; }
  function concatByteArrays(arrays) { const length = arrays.reduce((sum, array) => sum + array.length, 0); const result = new Uint8Array(length); let offset = 0; arrays.forEach(array => { result.set(array, offset); offset += array.length; }); return result; }
  function base64ToBytes(base64) { const binary = atob(base64); const bytes = new Uint8Array(binary.length); for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i); return bytes; }
  function wrapText(text, maxChars) {
    const words = cleanPdfText(text).split(/\s+/).filter(Boolean);
    const lines = [];
    let line = "";
    words.forEach(word => {
      const candidate = line ? `${line} ${word}` : word;
      if (candidate.length <= maxChars) line = candidate;
      else { if (line) lines.push(line); line = word.length > maxChars ? word.slice(0, maxChars) : word; }
    });
    if (line) lines.push(line);
    return lines.length ? lines : [""];
  }
  const pdfMoney = value => `$ ${Math.round(Number(value) || 0).toLocaleString("es-AR")}`;
  const approxWidth = (text, size, bold = false) => cleanPdfText(text).length * size * (bold ? 0.56 : 0.51);

  function createPdfBytes() {
    const data = quote();
    if (!data.plan) throw new Error("No hay un plan activo");

    const W = 595.28, H = 841.89, M = 38;
    const COLORS = {
      dark: [0.01, 0.025, 0.03], cyan: [0.06, 0.76, 0.79], amber: [0.95, 0.56, 0.10],
      ink: [0.08, 0.10, 0.11], muted: [0.38, 0.44, 0.46], light: [0.965, 0.975, 0.975],
      border: [0.82, 0.86, 0.87], white: [1, 1, 1], green: [0.10, 0.55, 0.31], red: [0.70, 0.16, 0.13]
    };
    const pages = [];
    let commands = null;
    let cursor = 0;

    const rgb = color => `${color.map(value => Number(value).toFixed(3)).join(" ")} rg`;
    const strokeRgb = color => `${color.map(value => Number(value).toFixed(3)).join(" ")} RG`;
    const yFromTop = top => H - top;
    const rectTop = (x, top, width, height, fill, stroke = null, lineWidth = 1) => {
      const y = H - top - height;
      commands.push(`${rgb(fill)} ${x} ${y} ${width} ${height} re f\n`);
      if (stroke) commands.push(`${strokeRgb(stroke)} ${lineWidth} w ${x} ${y} ${width} ${height} re S\n`);
    };
    const lineTop = (x1, top1, x2, top2, color, lineWidth = 1) => commands.push(`${strokeRgb(color)} ${lineWidth} w ${x1} ${yFromTop(top1)} m ${x2} ${yFromTop(top2)} l S\n`);
    const textTop = (text, x, top, size = 10, bold = false, color = COLORS.ink) => {
      const baseline = H - top - size;
      commands.push(`BT /${bold ? "F2" : "F1"} ${size} Tf ${rgb(color)} 1 0 0 1 ${x} ${baseline} Tm (${pdfEscape(text)}) Tj ET\n`);
    };
    const rightTextTop = (text, rightX, top, size = 10, bold = false, color = COLORS.ink) => textTop(text, rightX - approxWidth(text, size, bold), top, size, bold, color);

    function startPage(isContinuation = false) {
      commands = [];
      pages.push(commands);
      rectTop(0, 0, W, H, COLORS.white);
      rectTop(0, 0, W, 112, COLORS.dark);
      rectTop(0, 109, W, 3, COLORS.cyan);
      commands.push(`q 76 0 0 76 ${M} ${H - 94} cm /Im1 Do Q\n`);
      textTop(cleanPdfText(config.business.name || "IMPERIO DRINKS").toUpperCase(), 132, 27, 19, true, COLORS.white);
      textTop(isContinuation ? "PRESUPUESTO - CONTINUACIÓN" : "PRESUPUESTO DE BEBIDAS PARA EVENTOS", 132, 54, 9.5, true, COLORS.cyan);
      textTop("Servicio personalizado", 132, 72, 8.5, false, [0.78, 0.82, 0.83]);
      const number = cleanPdfText(els.quoteNumber.value || generateQuoteNumber());
      rightTextTop(`N.º ${number}`, W - M, 29, 8.8, true, COLORS.amber);
      rightTextTop(`Emitido: ${dateFormatter.format(new Date())}`, W - M, 49, 8.1, false, [0.80, 0.83, 0.84]);
      rightTextTop(`Vigencia: ${config.business.validityDays} días`, W - M, 66, 8.1, false, [0.80, 0.83, 0.84]);
      lineTop(M, 804, W - M, 804, COLORS.border, 0.7);
      textTop(cleanPdfText(config.business.name || "IMPERIO DRINKS"), M, 811, 8.2, true, COLORS.ink);
      const contacts = [config.business.phone ? `WhatsApp: ${config.business.phone}` : "", config.business.instagram || "", config.business.paymentAlias ? `Alias: ${config.business.paymentAlias}` : ""].filter(Boolean).join(" | ");
      rightTextTop(cleanPdfText(contacts), W - M, 812, 7.1, false, COLORS.muted);
      cursor = 132;
    }

    function ensure(height) {
      if (cursor + height > 792) startPage(true);
    }

    function sectionTitle(title) {
      ensure(22);
      textTop(title, M, cursor, 9.4, true, COLORS.cyan);
      cursor += 17;
    }

    function drawWrapped(text, x, widthChars, size = 8.2, color = COLORS.muted, bold = false, lineHeight = 11) {
      const lines = wrapText(text, widthChars);
      lines.forEach(line => { textTop(line, x, cursor, size, bold, color); cursor += lineHeight; });
      return lines.length;
    }

    startPage(false);

    sectionTitle("DATOS DEL EVENTO");
    ensure(94);
    rectTop(M, cursor, W - M * 2, 88, COLORS.light, COLORS.border, 0.7);
    const leftX = M + 14, rightX = 310;
    const peopleValue = data.enteredGuests && data.enteredGuests !== data.billableGuests
      ? `${data.enteredGuests} invitados / ${data.billableGuests} facturables`
      : `${data.billableGuests}`;
    const fields = [
      ["Cliente", els.clientName.value.trim() || "A confirmar", leftX, cursor + 12],
      ["WhatsApp", els.clientPhone.value.trim() || "A confirmar", rightX, cursor + 12],
      ["Evento", els.eventType.value, leftX, cursor + 40],
      ["Fecha", formatDate(els.eventDate.value), rightX, cursor + 40],
      ["Lugar / duración", [els.eventLocation.value.trim(), els.serviceHours.value.trim()].filter(Boolean).join(" - ") || "A confirmar", leftX, cursor + 68],
      ["Personas", peopleValue, rightX, cursor + 68]
    ];
    fields.forEach(([label, value, x, top]) => {
      textTop(label, x, top, 7.2, true, COLORS.muted);
      textTop(cleanPdfText(value).slice(0, x === leftX ? 52 : 34), x, top + 11, 9, label === "Cliente" || label === "Personas", COLORS.ink);
    });
    cursor += 105;

    sectionTitle("PLAN SELECCIONADO");
    ensure(65);
    rectTop(M, cursor, W - M * 2, 58, COLORS.dark);
    textTop(data.plan.name, M + 15, cursor + 13, 12.5, true, COLORS.white);
    textTop(`${pdfMoney(data.planUnitPrice)} por persona × ${data.billableGuests} personas`, M + 15, cursor + 36, 8.7, false, [0.80, 0.83, 0.84]);
    rightTextTop(pdfMoney(data.planSubtotal), W - M - 15, cursor + 20, 17.5, true, COLORS.amber);
    cursor += 76;

    sectionTitle("INCLUYE");
    const items = data.plan.includes || [];
    const midpoint = Math.ceil(items.length / 2);
    const columns = [items.slice(0, midpoint), items.slice(midpoint)];
    const columnData = columns.map(column => column.map(item => wrapText(item, 44)));
    const heights = columnData.map(column => column.reduce((sum, lines) => sum + Math.max(15, lines.length * 10 + 4), 0));
    const includesHeight = Math.max(heights[0] || 0, heights[1] || 0, 18);
    ensure(includesHeight + 4);
    const startIncludes = cursor;
    columnData.forEach((column, columnIndex) => {
      let localTop = startIncludes;
      const x = M + columnIndex * 260;
      column.forEach(lines => {
        textTop("-", x, localTop, 8.2, true, COLORS.cyan);
        lines.forEach((line, lineIndex) => textTop(line, x + 11, localTop + lineIndex * 10, 8.0, false, COLORS.ink));
        localTop += Math.max(15, lines.length * 10 + 4);
      });
    });
    cursor += includesHeight + 13;

    sectionTitle("DETALLE DE IMPORTES");
    const detailRows = [
      { label: `${data.plan.name} - ${data.billableGuests} personas`, amount: data.planSubtotal },
      ...data.products.map(item => ({ label: `${item.product.name} - ${item.qty} ${item.product.unit}`, amount: item.total })),
      ...(data.travel > 0 ? [{ label: "Traslado / logística", amount: data.travel }] : []),
      ...(data.other > 0 ? [{ label: "Otros gastos", amount: data.other }] : []),
      ...(data.automaticDiscount > 0 ? [{ label: `Descuento por cantidad (${data.automaticDiscountPercent}%)`, amount: -data.automaticDiscount }] : []),
      ...(data.manualDiscount > 0 ? [{ label: "Descuento manual", amount: -data.manualDiscount }] : [])
    ];

    function tableHeader() {
      ensure(28);
      rectTop(M, cursor, W - M * 2, 23, COLORS.dark);
      textTop("CONCEPTO", M + 10, cursor + 7, 8.1, true, COLORS.white);
      rightTextTop("IMPORTE", W - M - 10, cursor + 7, 8.1, true, COLORS.white);
      cursor += 23;
    }
    tableHeader();
    detailRows.forEach((row, index) => {
      if (cursor + 22 > 790) { startPage(true); sectionTitle("DETALLE DE IMPORTES"); tableHeader(); }
      if (index % 2 === 0) rectTop(M, cursor, W - M * 2, 21, [0.982, 0.987, 0.987]);
      textTop(cleanPdfText(row.label).slice(0, 70), M + 10, cursor + 6, 8.1, false, COLORS.ink);
      rightTextTop(`${row.amount < 0 ? "-" : ""}${pdfMoney(Math.abs(row.amount))}`, W - M - 10, cursor + 6, 8.1, row.amount < 0, row.amount < 0 ? COLORS.red : COLORS.ink);
      lineTop(M, cursor + 21, W - M, cursor + 21, COLORS.border, 0.35);
      cursor += 21;
    });
    cursor += 10;

    ensure(88);
    rectTop(M, cursor, W - M * 2, 78, COLORS.dark);
    textTop("TOTAL", M + 15, cursor + 14, 9.5, true, COLORS.cyan);
    rightTextTop(pdfMoney(data.total), W - M - 15, cursor + 12, 21, true, COLORS.white);
    textTop(`Seña (${data.depositPercent}%)`, M + 15, cursor + 43, 8.2, false, [0.80, 0.83, 0.84]);
    rightTextTop(pdfMoney(data.deposit), W - M - 15, cursor + 41, 10.5, true, COLORS.amber);
    textTop("Saldo", M + 15, cursor + 61, 8.2, false, [0.80, 0.83, 0.84]);
    rightTextTop(pdfMoney(data.balance), W - M - 15, cursor + 59, 10.5, true, COLORS.white);
    cursor += 94;

    if (els.notes.value.trim()) {
      sectionTitle("OBSERVACIONES");
      const noteLines = wrapText(els.notes.value.trim(), 104);
      ensure(noteLines.length * 11 + 8);
      noteLines.forEach(line => { textTop(line, M, cursor, 8.0, false, COLORS.muted); cursor += 11; });
      cursor += 8;
    }

    sectionTitle("CONDICIONES");
    const conditionLines = wrapText(config.business.conditions || "", 104);
    conditionLines.forEach(line => {
      ensure(12);
      textTop(line, M, cursor, 7.8, false, COLORS.muted);
      cursor += 10.5;
    });

    pages.forEach((page, index) => {
      const pageNumber = `${index + 1} / ${pages.length}`;
      const originalCommands = commands;
      commands = page;
      textTop(pageNumber, (W - approxWidth(pageNumber, 7.1, false)) / 2, 811, 7.1, false, COLORS.muted);
      commands = originalCommands;
    });

    const imageBytes = base64ToBytes(window.IMPERIO_LOGO_DATA.split(",")[1]);
    const pageCount = pages.length;
    const pageIds = Array.from({ length: pageCount }, (_, index) => 3 + index);
    const contentIds = Array.from({ length: pageCount }, (_, index) => 3 + pageCount + index);
    const fontRegularId = 3 + pageCount * 2;
    const fontBoldId = fontRegularId + 1;
    const imageId = fontBoldId + 1;
    const maxObjectId = imageId;
    const objects = new Array(maxObjectId + 1);

    objects[1] = latin1Bytes("<< /Type /Catalog /Pages 2 0 R >>");
    objects[2] = latin1Bytes(`<< /Type /Pages /Kids [${pageIds.map(id => `${id} 0 R`).join(" ")}] /Count ${pageCount} >>`);
    pages.forEach((pageCommands, index) => {
      objects[pageIds[index]] = latin1Bytes(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${W} ${H}] /Resources << /Font << /F1 ${fontRegularId} 0 R /F2 ${fontBoldId} 0 R >> /XObject << /Im1 ${imageId} 0 R >> >> /Contents ${contentIds[index]} 0 R >>`);
      const content = latin1Bytes(pageCommands.join(""));
      objects[contentIds[index]] = concatByteArrays([latin1Bytes(`<< /Length ${content.length} >>\nstream\n`), content, latin1Bytes("\nendstream")]);
    });
    objects[fontRegularId] = latin1Bytes("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>");
    objects[fontBoldId] = latin1Bytes("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>");
    objects[imageId] = concatByteArrays([
      latin1Bytes(`<< /Type /XObject /Subtype /Image /Width 1254 /Height 1254 /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${imageBytes.length} >>\nstream\n`),
      imageBytes,
      latin1Bytes("\nendstream")
    ]);

    const parts = [latin1Bytes("%PDF-1.4\n%âãÏÓ\n")];
    const offsets = new Array(maxObjectId + 1).fill(0);
    let totalLength = parts[0].length;
    for (let id = 1; id <= maxObjectId; id += 1) {
      offsets[id] = totalLength;
      const objectBytes = concatByteArrays([latin1Bytes(`${id} 0 obj\n`), objects[id], latin1Bytes("\nendobj\n")]);
      parts.push(objectBytes);
      totalLength += objectBytes.length;
    }
    const xrefOffset = totalLength;
    let xref = `xref\n0 ${maxObjectId + 1}\n0000000000 65535 f \n`;
    for (let id = 1; id <= maxObjectId; id += 1) xref += `${String(offsets[id]).padStart(10, "0")} 00000 n \n`;
    xref += `trailer\n<< /Size ${maxObjectId + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
    parts.push(latin1Bytes(xref));
    return concatByteArrays(parts);
  }

  function safeFilename() {
    const client = (els.clientName.value.trim() || "cliente")
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9_-]+/g, "_");
    return `Presupuesto_Imperio_Drinks_${client}.pdf`;
  }

  function createPdfFile() {
    if (!els.quoteNumber.value) els.quoteNumber.value = generateQuoteNumber();
    const bytes = createPdfBytes();
    return new File([bytes], safeFilename(), { type: "application/pdf", lastModified: Date.now() });
  }

  function downloadFile(file) {
    const url = URL.createObjectURL(file);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = file.name;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2500);
  }

  function normalizedWhatsappPhone(raw) {
    let digits = String(raw || "").replace(/\D/g, "");
    if (!digits) return "";
    const countryCode = String(config.business.countryCode || "54").replace(/\D/g, "") || "54";
    if (digits.startsWith(countryCode)) return digits;
    digits = digits.replace(/^0+/, "");
    digits = digits.replace(/^(\d{2,4})15/, "$1");
    return countryCode === "54" ? `549${digits}` : `${countryCode}${digits}`;
  }

  function whatsappUrl() {
    const phone = normalizedWhatsappPhone(els.clientPhone.value);
    const client = els.clientName.value.trim();
    const text = `Hola${client ? ` ${client}` : ""}, te envío el presupuesto de ${config.business.name || "Imperio Drinks"}. El PDF contiene el detalle completo del servicio.`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
  }

  async function sharePdf() {
    try {
      const file = createPdfFile();
      const shareData = {
        title: `Presupuesto ${config.business.name || "Imperio Drinks"}`,
        text: `Presupuesto para ${els.clientName.value.trim() || "el evento"}.`,
        files: [file]
      };
      const canShareFiles = Boolean(navigator.share && (!navigator.canShare || navigator.canShare({ files: [file] })));
      if (canShareFiles && window.isSecureContext) {
        try {
          await navigator.share(shareData);
          showToast("Presupuesto compartido");
          return;
        } catch (error) {
          if (error?.name === "AbortError") return;
          console.warn("No se pudo usar el menú de compartir", error);
        }
      }

      downloadFile(file);
      const whatsapp = window.open(whatsappUrl(), "_blank", "noopener,noreferrer");
      if (!whatsapp) location.href = whatsappUrl();
      showToast("PDF descargado. Adjuntalo en el chat de WhatsApp");
    } catch (error) {
      console.error(error);
      showToast("No se pudo generar el PDF");
    }
  }

  function downloadPdf() {
    try {
      const file = createPdfFile();
      downloadFile(file);
      showToast("PDF descargado");
    } catch (error) {
      console.error(error);
      showToast("No se pudo generar el PDF");
    }
  }

  function updateShareHelp() {
    const supported = Boolean(navigator.share && window.isSecureContext);
    els.shareHelp.textContent = supported
      ? "Al tocar Compartir se abrirá el menú del celular. Elegí WhatsApp y el PDF se enviará como archivo adjunto."
      : "Este navegador descargará el PDF y abrirá WhatsApp. Por seguridad, el archivo debe adjuntarse manualmente en el chat.";
  }

  els.quoteNumber.value = generateQuoteNumber();
  els.form.addEventListener("input", update);
  els.addProduct.addEventListener("click", addProduct);
  els.sharePdf.addEventListener("click", sharePdf);
  els.downloadPdf.addEventListener("click", downloadPdf);
  els.copyQuote.addEventListener("click", copyMessage);
  els.reloadPrices.addEventListener("click", () => reloadConfig(true));
  window.addEventListener("storage", event => { if (event.key === ImperioStore.key) reloadConfig(false); });

  updateShareHelp();
  reloadConfig(false);
})();
