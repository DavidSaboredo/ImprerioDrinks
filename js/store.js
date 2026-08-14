(() => {
  "use strict";

  const STORAGE_KEY = "imperioDrinksConfigV4";
  const LEGACY_KEYS = ["imperioDrinksConfigV3"];

  const DEFAULT_CONFIG = {
    version: 4,
    updatedAt: "",
    business: {
      name: "Imperio Drinks",
      phone: "",
      instagram: "@imperiodrinks",
      paymentAlias: "",
      validityDays: 7,
      minimumGuests: 50,
      depositPercent: 30,
      countryCode: "54",
      conditions: "La fecha queda reservada una vez abonada la seña. El saldo restante se cancela según lo acordado con el cliente. Los valores pueden actualizarse hasta confirmar la reserva."
    },
    discountTiers: [
      { id: "tier-50", from: 50, to: 100, percent: 0 },
      { id: "tier-101", from: 101, to: 150, percent: 5 },
      { id: "tier-151", from: 151, to: null, percent: 10 }
    ],
    plans: [
      {
        id: "super-economico",
        name: "Plan Súper Económico",
        price: 13000,
        active: true,
        description: "Una opción simple con los clásicos más pedidos.",
        includes: ["Gin", "Vodka", "Fernet", "Campari", "Gancia"]
      },
      {
        id: "silver",
        name: "Plan Silver",
        price: 18000,
        active: true,
        description: "Variedad de tragos clásicos y agua mineral.",
        includes: [
          "Fernet con Coca",
          "Gancia",
          "Vodka con Speed o jugo de naranja",
          "Gin tonic",
          "Agua mineral 500 ml"
        ]
      },
      {
        id: "gold",
        name: "Plan Gold",
        price: 20000,
        active: true,
        description: "Una propuesta completa con mayor variedad de tragos.",
        includes: [
          "Fernet con Coca",
          "Fernet menta con Coca",
          "Daiquiri de frutilla",
          "Caipirinha",
          "Aperol Citric",
          "Campari",
          "Champagne",
          "Vodka con Speed o jugo de naranja",
          "Gin tonic frutos rojos o limón",
          "Agua mineral 500 ml"
        ]
      },
      {
        id: "black",
        name: "Plan Black",
        price: 25000,
        active: true,
        description: "Incluye todo el Plan Gold más tres tragos exclusivos de la casa a elección del cliente.",
        includes: [
          "Todo lo incluido en el Plan Gold",
          "3 tragos exclusivos de la casa a elección del cliente"
        ]
      }
    ],
    products: [
      { id: "gin", category: "Bebidas", name: "Gin", unit: "botella", price: 0, active: true },
      { id: "vodka", category: "Bebidas", name: "Vodka", unit: "botella", price: 0, active: true },
      { id: "fernet", category: "Bebidas", name: "Fernet", unit: "botella", price: 0, active: true },
      { id: "fernet-menta", category: "Bebidas", name: "Fernet menta", unit: "botella", price: 0, active: true },
      { id: "campari", category: "Aperitivos", name: "Campari", unit: "botella", price: 0, active: true },
      { id: "gancia", category: "Aperitivos", name: "Gancia", unit: "botella", price: 0, active: true },
      { id: "aperol", category: "Aperitivos", name: "Aperol", unit: "botella", price: 0, active: true },
      { id: "champagne", category: "Bebidas", name: "Champagne", unit: "botella", price: 0, active: true },
      { id: "coca", category: "Sin alcohol", name: "Coca-Cola", unit: "botella", price: 0, active: true },
      { id: "speed", category: "Sin alcohol", name: "Speed", unit: "lata", price: 0, active: true },
      { id: "jugo-naranja", category: "Sin alcohol", name: "Jugo de naranja", unit: "litro", price: 0, active: true },
      { id: "agua", category: "Sin alcohol", name: "Agua mineral 500 ml", unit: "unidad", price: 0, active: true },
      { id: "hielo", category: "Insumos", name: "Hielo", unit: "bolsa", price: 0, active: true },
      { id: "vasos", category: "Insumos", name: "Vasos", unit: "pack", price: 0, active: true }
    ]
  };

  const clone = value => JSON.parse(JSON.stringify(value));
  const uid = prefix => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
  const asMoney = value => Math.max(0, Math.round(Number(value) || 0));
  const asNumber = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;

  function normalize(source = {}) {
    const cfg = clone(DEFAULT_CONFIG);
    cfg.version = 4;
    cfg.updatedAt = String(source.updatedAt || "");
    cfg.business = { ...cfg.business, ...(source.business || {}) };
    cfg.business.minimumGuests = Math.max(1, Math.floor(asNumber(cfg.business.minimumGuests, 50)));
    cfg.business.depositPercent = Math.min(100, Math.max(0, asNumber(cfg.business.depositPercent, 30)));
    cfg.business.validityDays = Math.max(1, Math.floor(asNumber(cfg.business.validityDays, 7)));
    cfg.business.countryCode = String(cfg.business.countryCode || "54").replace(/\D/g, "") || "54";

    cfg.plans = Array.isArray(source.plans) && source.plans.length
      ? source.plans.map((p, i) => ({
          id: String(p.id || uid(`plan-${i + 1}`)),
          name: String(p.name || `Plan ${i + 1}`),
          price: asMoney(p.price),
          active: p.active !== false,
          description: String(p.description || ""),
          includes: Array.isArray(p.includes) ? p.includes.map(String).map(x => x.trim()).filter(Boolean) : []
        }))
      : clone(DEFAULT_CONFIG.plans);

    cfg.products = Array.isArray(source.products)
      ? source.products.map((p, i) => ({
          id: String(p.id || uid(`product-${i + 1}`)),
          category: String(p.category || "General"),
          name: String(p.name || `Producto ${i + 1}`),
          unit: String(p.unit || "unidad"),
          price: asMoney(p.price),
          active: p.active !== false
        }))
      : clone(DEFAULT_CONFIG.products);

    cfg.discountTiers = Array.isArray(source.discountTiers) && source.discountTiers.length
      ? source.discountTiers.map((t, i) => ({
          id: String(t.id || uid(`tier-${i + 1}`)),
          from: Math.max(0, Math.floor(asNumber(t.from, 0))),
          to: t.to === null || t.to === "" || typeof t.to === "undefined" ? null : Math.max(0, Math.floor(asNumber(t.to, 0))),
          percent: Math.min(100, Math.max(0, asNumber(t.percent, 0)))
        })).sort((a, b) => a.from - b.from)
      : clone(DEFAULT_CONFIG.discountTiers);

    return cfg;
  }

  function load() {
    try {
      const current = localStorage.getItem(STORAGE_KEY);
      if (current) return normalize(JSON.parse(current));
      for (const key of LEGACY_KEYS) {
        const legacy = localStorage.getItem(key);
        if (legacy) {
          const migrated = normalize(JSON.parse(legacy));
          localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
          return migrated;
        }
      }
    } catch (error) {
      console.warn("No se pudo leer la configuración", error);
    }
    return clone(DEFAULT_CONFIG);
  }

  function save(config) {
    const normalized = normalize(config);
    normalized.updatedAt = new Date().toISOString();
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    } catch (error) {
      console.error("No se pudo guardar la configuración", error);
      throw error;
    }
    return normalized;
  }

  function reset() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    return clone(DEFAULT_CONFIG);
  }

  function discountTier(guests, config = load()) {
    const count = Math.max(0, Math.floor(Number(guests) || 0));
    const tiers = [...(config.discountTiers || [])].sort((a, b) => a.from - b.from);
    return tiers.find(tier => count >= tier.from && (tier.to === null || count <= tier.to)) || { percent: 0, from: 0, to: null };
  }

  window.ImperioStore = {
    key: STORAGE_KEY,
    defaults: () => clone(DEFAULT_CONFIG),
    normalize,
    load,
    save,
    reset,
    uid,
    discountTier,
    discountPercent: (guests, config) => discountTier(guests, config).percent
  };
})();
