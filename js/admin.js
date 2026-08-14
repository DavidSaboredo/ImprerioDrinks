(() => {
  "use strict";

  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  const els = {
    status: $("#saveStatus"), toast: $("#toast"), plans: $("#plansEditor"), products: $("#productsEditor"),
    tiers: $("#tiersEditor"), productSearch: $("#productSearch")
  };

  if (location.protocol === "file:") $("#fileWarning").classList.remove("hidden");

  let config = ImperioStore.load();
  let saveTimer = null;
  let isDirty = false;

  const escapeHtml = value => String(value ?? "").replace(/[&<>'"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char]));
  const nonNegative = (value, fallback = 0) => Math.max(0, Number.isFinite(Number(value)) ? Number(value) : fallback);
  const formatSavedAt = value => new Intl.DateTimeFormat("es-AR", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));

  function showToast(message) {
    els.toast.textContent = message;
    els.toast.classList.add("show");
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => els.toast.classList.remove("show"), 2300);
  }

  function setDirty() {
    isDirty = true;
    els.status.textContent = "Guardando cambios…";
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => save(false), 650);
  }

  function loadGeneral() {
    const business = config.business;
    $("#businessName").value = business.name || "";
    $("#businessPhone").value = business.phone || "";
    $("#businessInstagram").value = business.instagram || "";
    $("#paymentAlias").value = business.paymentAlias || "";
    $("#validityDays").value = business.validityDays || 7;
    $("#minimumGuests").value = business.minimumGuests || 50;
    $("#depositPercent").value = business.depositPercent ?? 30;
    $("#countryCode").value = business.countryCode || "54";
    $("#conditions").value = business.conditions || "";
  }

  function readGeneral() {
    config.business = {
      ...config.business,
      name: $("#businessName").value.trim() || "Imperio Drinks",
      phone: $("#businessPhone").value.trim(),
      instagram: $("#businessInstagram").value.trim(),
      paymentAlias: $("#paymentAlias").value.trim(),
      validityDays: Math.max(1, Math.floor(nonNegative($("#validityDays").value, 7))),
      minimumGuests: Math.max(1, Math.floor(nonNegative($("#minimumGuests").value, 50))),
      depositPercent: Math.min(100, nonNegative($("#depositPercent").value, 30)),
      countryCode: $("#countryCode").value.replace(/\D/g, "") || "54",
      conditions: $("#conditions").value.trim()
    };
  }

  function renderPlans() {
    els.plans.innerHTML = "";
    config.plans.forEach((plan, index) => {
      const editor = document.createElement("div");
      editor.className = "plan-editor";
      editor.dataset.index = index;
      editor.innerHTML = `
        <div class="plan-editor-head">
          <strong>${escapeHtml(plan.name || `Plan ${index + 1}`)}</strong>
          <div class="checkline"><input data-field="active" type="checkbox" ${plan.active !== false ? "checked" : ""}><span>Activo</span><button class="btn btn-danger btn-small" data-action="delete" type="button">Eliminar</button></div>
        </div>
        <div class="grid grid-3">
          <label class="field"><span>Nombre</span><input data-field="name" value="${escapeHtml(plan.name)}"></label>
          <label class="field"><span>Precio por persona</span><input data-field="price" type="number" min="0" step="100" value="${plan.price}"></label>
          <label class="field"><span>Descripción</span><input data-field="description" value="${escapeHtml(plan.description)}"></label>
          <label class="field field-wide"><span>Incluye (una bebida o descripción por línea)</span><textarea data-field="includes" rows="6">${escapeHtml((plan.includes || []).join("\n"))}</textarea></label>
        </div>`;
      editor.querySelectorAll("input, textarea").forEach(input => input.addEventListener("input", () => {
        syncPlan(editor);
        setDirty();
      }));
      editor.querySelector('[data-action="delete"]').addEventListener("click", () => {
        if (config.plans.length <= 1) return showToast("Debe quedar al menos un plan");
        config.plans.splice(index, 1);
        renderPlans();
        setDirty();
      });
      els.plans.appendChild(editor);
    });
  }

  function syncPlan(editor) {
    const plan = config.plans[Number(editor.dataset.index)];
    plan.name = editor.querySelector('[data-field="name"]').value.trim() || "Plan";
    plan.price = Math.round(nonNegative(editor.querySelector('[data-field="price"]').value));
    plan.description = editor.querySelector('[data-field="description"]').value.trim();
    plan.active = editor.querySelector('[data-field="active"]').checked;
    plan.includes = editor.querySelector('[data-field="includes"]').value.split(/\n/).map(value => value.trim()).filter(Boolean);
    editor.querySelector(".plan-editor-head strong").textContent = plan.name;
  }

  function renderProducts() {
    const query = els.productSearch.value.trim().toLowerCase();
    els.products.innerHTML = "";
    config.products.forEach((product, index) => {
      const searchable = `${product.category} ${product.name} ${product.unit}`.toLowerCase();
      if (query && !searchable.includes(query)) return;
      const row = document.createElement("tr");
      row.dataset.index = index;
      row.innerHTML = `
        <td><input aria-label="Categoría" data-field="category" value="${escapeHtml(product.category)}"></td>
        <td><input aria-label="Producto" data-field="name" value="${escapeHtml(product.name)}"></td>
        <td><input aria-label="Unidad" data-field="unit" value="${escapeHtml(product.unit)}"></td>
        <td><input aria-label="Precio" data-field="price" type="number" min="0" step="100" value="${product.price}"></td>
        <td><label class="checkline"><input aria-label="Producto activo" data-field="active" type="checkbox" ${product.active !== false ? "checked" : ""}><span>Sí</span></label></td>
        <td><button class="btn btn-danger btn-small" data-action="delete" type="button">Eliminar</button></td>`;
      row.querySelectorAll("input").forEach(input => input.addEventListener("input", () => {
        syncProduct(row);
        setDirty();
      }));
      row.querySelector('[data-action="delete"]').addEventListener("click", () => {
        config.products.splice(index, 1);
        renderProducts();
        setDirty();
      });
      els.products.appendChild(row);
    });
    if (!els.products.children.length) {
      const row = document.createElement("tr");
      row.innerHTML = '<td colspan="6"><div class="empty">No se encontraron productos.</div></td>';
      els.products.appendChild(row);
    }
  }

  function syncProduct(row) {
    const product = config.products[Number(row.dataset.index)];
    product.category = row.querySelector('[data-field="category"]').value.trim() || "General";
    product.name = row.querySelector('[data-field="name"]').value.trim() || "Producto";
    product.unit = row.querySelector('[data-field="unit"]').value.trim() || "unidad";
    product.price = Math.round(nonNegative(row.querySelector('[data-field="price"]').value));
    product.active = row.querySelector('[data-field="active"]').checked;
  }

  function renderTiers() {
    els.tiers.innerHTML = "";
    config.discountTiers.forEach((tier, index) => {
      const editor = document.createElement("div");
      editor.className = "admin-row";
      editor.dataset.index = index;
      editor.innerHTML = `
        <label class="field"><span>Desde personas</span><input data-field="from" type="number" min="0" value="${tier.from}"></label>
        <label class="field"><span>Hasta personas</span><input data-field="to" type="number" min="0" value="${tier.to ?? ""}" placeholder="Sin límite"></label>
        <label class="field"><span>Descuento (%)</span><input data-field="percent" type="number" min="0" max="100" step="0.1" value="${tier.percent}"></label>
        <button class="btn btn-danger btn-small" data-action="delete" type="button">Eliminar</button>`;
      editor.querySelectorAll("input").forEach(input => input.addEventListener("input", () => {
        syncTier(editor);
        setDirty();
      }));
      editor.querySelector('[data-action="delete"]').addEventListener("click", () => {
        config.discountTiers.splice(index, 1);
        renderTiers();
        setDirty();
      });
      els.tiers.appendChild(editor);
    });
  }

  function syncTier(editor) {
    const tier = config.discountTiers[Number(editor.dataset.index)];
    tier.from = Math.floor(nonNegative(editor.querySelector('[data-field="from"]').value));
    const to = editor.querySelector('[data-field="to"]').value.trim();
    tier.to = to === "" ? null : Math.floor(nonNegative(to));
    tier.percent = Math.min(100, nonNegative(editor.querySelector('[data-field="percent"]').value));
  }

  function validateTiers() {
    const sorted = [...config.discountTiers].sort((a, b) => a.from - b.from);
    for (let index = 0; index < sorted.length; index += 1) {
      const tier = sorted[index];
      if (tier.to !== null && tier.to < tier.from) return "En un rango, el valor 'Hasta' es menor que 'Desde'.";
      const next = sorted[index + 1];
      if (next && (tier.to === null || tier.to >= next.from)) return "Hay rangos de descuento superpuestos.";
    }
    return "";
  }

  function save(showMessage = true) {
    clearTimeout(saveTimer);
    readGeneral();
    const tierError = validateTiers();
    if (tierError) {
      els.status.textContent = tierError;
      if (showMessage) showToast(tierError);
      return false;
    }
    config.discountTiers.sort((a, b) => a.from - b.from);
    try {
      config = ImperioStore.save(config);
      isDirty = false;
      els.status.innerHTML = `<strong>Guardado</strong> · ${formatSavedAt(config.updatedAt)}`;
      if (showMessage) showToast("Cambios guardados");
      return true;
    } catch {
      els.status.textContent = "No se pudieron guardar los cambios.";
      showToast("Error al guardar");
      return false;
    }
  }

  function renderAll() {
    loadGeneral();
    renderPlans();
    renderProducts();
    renderTiers();
    isDirty = false;
    els.status.textContent = config.updatedAt ? `Último guardado: ${formatSavedAt(config.updatedAt)}` : "Configuración inicial cargada.";
  }

  $$(".nav-btn").forEach(button => button.addEventListener("click", () => {
    $$(".nav-btn").forEach(item => item.classList.remove("active"));
    $$(".admin-section").forEach(section => section.classList.remove("active"));
    button.classList.add("active");
    $(`#tab-${button.dataset.tab}`).classList.add("active");
  }));

  $$("#tab-general input, #tab-general textarea").forEach(input => input.addEventListener("input", setDirty));
  els.productSearch.addEventListener("input", renderProducts);

  $("#addPlan").addEventListener("click", () => {
    config.plans.push({ id: ImperioStore.uid("plan"), name: "Nuevo plan", price: 0, active: true, description: "", includes: [] });
    renderPlans();
    setDirty();
  });
  $("#addProduct").addEventListener("click", () => {
    config.products.push({ id: ImperioStore.uid("product"), category: "General", name: "Nuevo producto", unit: "unidad", price: 0, active: true });
    els.productSearch.value = "";
    renderProducts();
    setDirty();
  });
  $("#addTier").addEventListener("click", () => {
    const last = [...config.discountTiers].sort((a, b) => a.from - b.from).at(-1);
    const from = last?.to !== null && typeof last?.to !== "undefined" ? last.to + 1 : (last ? last.from + 50 : 0);
    config.discountTiers.push({ id: ImperioStore.uid("tier"), from, to: null, percent: 0 });
    renderTiers();
    setDirty();
  });

  $("#saveTop").addEventListener("click", () => save(true));
  $("#saveBottom").addEventListener("click", () => save(true));

  $("#exportData").addEventListener("click", () => {
    readGeneral();
    const blob = new Blob([JSON.stringify(ImperioStore.normalize(config), null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `imperio-drinks-precios-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1200);
    showToast("Copia descargada");
  });

  $("#importData").addEventListener("change", async event => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      config = ImperioStore.normalize(JSON.parse(await file.text()));
      renderAll();
      save(false);
      showToast("Copia importada y guardada");
    } catch {
      showToast("El archivo no es válido");
    }
    event.target.value = "";
  });

  $("#resetData").addEventListener("click", () => {
    if (!confirm("¿Restaurar todos los planes y precios iniciales?")) return;
    config = ImperioStore.reset();
    renderAll();
    save(false);
    showToast("Valores iniciales restaurados");
  });

  window.addEventListener("beforeunload", () => { if (isDirty) save(false); });
  renderAll();
})();
