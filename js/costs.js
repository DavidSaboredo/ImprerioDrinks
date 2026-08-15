(() => {
  "use strict";

  /**
   * Calcula la cantidad necesaria de un producto para un evento
   * @param {number} baseQuantity - Cantidad configurada en la receta
   * @param {number} guestCount - Cantidad de personas del evento
   * @param {number} basePeople - Cantidad base para la receta (ej: 50)
   * @returns {number} Cantidad redondeada hacia arriba
   */
  function calculateQuantityNeeded(baseQuantity, guestCount, basePeople) {
    if (!baseQuantity || !guestCount || !basePeople) return 0;
    const factor = guestCount / basePeople;
    return Math.ceil(baseQuantity * factor);
  }

  /**
   * Calcula los costos internos de un evento
   * @param {Object} config - Configuración del sistema (store)
   * @param {Object} event - Datos del evento
   * @param {string} event.planId - ID del plan seleccionado
   * @param {number} event.guestCount - Cantidad de personas facturables
   * @param {number} event.serviceHours - Horas de servicio
   * @param {Array} event.selectedProducts - Productos adicionales: [{productId, quantity}]
   * @returns {Object} Detalles de costos internos
   */
  function calculateInternalCosts(config, event) {
    const { plans = [], products = [], operatingCosts = {} } = config;
    const { planId, guestCount = 0, serviceHours = 0, selectedProducts = [] } = event;

    const result = {
      productsCost: 0,
      productDetails: [],
      staffCost: 0,
      transportCost: operatingCosts.transportCostInternal || 0,
      rentalCost: operatingCosts.rentalCostPerEvent || 0,
      otherCost: operatingCosts.otherCostsPerEvent || 0,
      totalCost: 0,
      costBreakdown: []
    };

    // Buscar el plan seleccionado
    const plan = plans.find(p => p.id === planId);
    if (!plan) return result;

    // Crear mapa de productos para búsqueda rápida
    const productMap = {};
    products.forEach(p => { productMap[p.id] = p; });

    // Calcular costo de productos del plan
    if (plan.consumptions && Array.isArray(plan.consumptions)) {
      plan.consumptions.forEach(consumption => {
        const product = productMap[consumption.productId];
        if (!product) return;

        const quantityNeeded = calculateQuantityNeeded(
          consumption.quantity,
          guestCount,
          plan.basePeople
        );

        const costForProduct = quantityNeeded * product.costPrice;

        result.productDetails.push({
          productId: product.id,
          name: product.name,
          unit: product.unit,
          quantityNeeded,
          costPrice: product.costPrice,
          subtotal: costForProduct
        });

        result.productsCost += costForProduct;
      });
    }

    // Calcular costo de productos adicionales vendidos
    selectedProducts.forEach(item => {
      const product = productMap[item.productId];
      if (!product) return;

      const costForProduct = item.quantity * product.costPrice;

      result.productDetails.push({
        productId: product.id,
        name: product.name,
        unit: product.unit,
        quantityNeeded: item.quantity,
        costPrice: product.costPrice,
        subtotal: costForProduct,
        isAdditional: true
      });

      result.productsCost += costForProduct;
    });

    // Calcular costo de personal
    if (serviceHours && operatingCosts.staffCostPerHour) {
      result.staffCost = serviceHours * operatingCosts.staffCostPerHour;
    }

    // Calcular total
    result.totalCost = 
      result.productsCost +
      result.staffCost +
      result.transportCost +
      result.rentalCost +
      result.otherCost;

    // Construir desglose
    result.costBreakdown = [];
    if (result.productsCost > 0) {
      result.costBreakdown.push({
        label: "Productos",
        amount: result.productsCost
      });
    }
    if (result.staffCost > 0) {
      result.costBreakdown.push({
        label: "Personal",
        amount: result.staffCost
      });
    }
    if (result.transportCost > 0) {
      result.costBreakdown.push({
        label: "Traslado interno",
        amount: result.transportCost
      });
    }
    if (result.rentalCost > 0) {
      result.costBreakdown.push({
        label: "Alquiler",
        amount: result.rentalCost
      });
    }
    if (result.otherCost > 0) {
      result.costBreakdown.push({
        label: "Otros gastos",
        amount: result.otherCost
      });
    }

    return result;
  }

  /**
   * Calcula ganancia y margen
   * @param {number} salePrice - Precio de venta al cliente
   * @param {number} internalCost - Costo interno total
   * @returns {Object} {profit, margin}
   */
  function calculateProfitMargin(salePrice, internalCost) {
    const profit = Math.max(0, salePrice - internalCost);
    const margin = salePrice > 0 ? Math.round((profit / salePrice) * 100 * 10) / 10 : 0;
    return { profit, margin };
  }

  window.ImperioCosts = {
    calculateQuantityNeeded,
    calculateInternalCosts,
    calculateProfitMargin
  };
})();
