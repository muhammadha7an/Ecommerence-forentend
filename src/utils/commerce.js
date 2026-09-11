/*
 * Shared storefront helpers for prices, stock and shipping.
 * The backend (services/orderService + services/shippingService) applies the same rules and is
 * the source of truth at checkout; these helpers only keep the UI consistent with it.
 */

export const getProductId = (product) =>
  product ? product._id || product.id || product.legacyId || null : null;

/** Same ids can appear as _id, id or legacyId depending on where the object came from. */
export const sameProduct = (a, b) => {
  if (!a || !b) return false;
  const idsA = [a._id, a.id, a.legacyId].filter((v) => v !== undefined && v !== null).map(String);
  const idsB = [b._id, b.id, b.legacyId].filter((v) => v !== undefined && v !== null).map(String);
  return idsA.some((id) => idsB.includes(id));
};

/** A valid sale price below the regular price is what the customer pays. */
export const getEffectivePrice = (product) => {
  const price = Number(product?.price || 0);
  const sale = Number(product?.salePrice);
  return Number.isFinite(sale) && sale > 0 && sale < price ? sale : price;
};

export const hasSalePrice = (product) => getEffectivePrice(product) < Number(product?.price || 0);

/**
 * Maximum units that can be bought. 0 = out of stock, null = stock unknown
 * (e.g. placeholder data before the catalog loads — the server still validates).
 */
export const getStockLimit = (product) => {
  if (!product) return null;
  if (product.inStock === false) return 0;
  const stock = Number(product.stock);
  return product.stock !== undefined && product.stock !== null && Number.isFinite(stock)
    ? Math.max(0, Math.floor(stock))
    : null;
};

export const isOutOfStock = (product) => getStockLimit(product) === 0;

export const LOW_STOCK_LEVEL = 5;

export const getStockStatus = (product) => {
  const limit = getStockLimit(product);
  if (limit === 0) return "out";
  if (limit !== null && limit <= LOW_STOCK_LEVEL) return "low";
  return "in";
};

export const formatMoney = (amount) => `$${Number(amount || 0).toFixed(2)}`;

const toCents = (dollars) => Math.round(Number(dollars || 0) * 100);

/**
 * Mirrors backend/services/shippingService.calculateShipping (display only).
 * @param {number} subtotal dollars
 * @param {{freeShippingThreshold:number, shippingFee:number}|null} shipping
 */
export const calculateShipping = (subtotal, shipping) => {
  if (!shipping) {
    return { ready: false, subtotal, shippingFee: null, total: subtotal, isFree: false, amountToFree: null, progress: 0 };
  }

  const subtotalCents = Math.max(0, toCents(subtotal));
  const thresholdCents = toCents(shipping.freeShippingThreshold);
  const feeCents = toCents(shipping.shippingFee);
  const isFree = feeCents === 0 || subtotalCents >= thresholdCents;
  const shippingCents = isFree ? 0 : feeCents;

  return {
    ready: true,
    subtotal: subtotalCents / 100,
    shippingFee: shippingCents / 100,
    total: (subtotalCents + shippingCents) / 100,
    isFree,
    amountToFree: isFree ? 0 : (thresholdCents - subtotalCents) / 100,
    threshold: thresholdCents / 100,
    progress: thresholdCents > 0 ? Math.min(100, (subtotalCents / thresholdCents) * 100) : 100,
  };
};

/** Human copy for the free-shipping rule, e.g. "on orders of $78.00 or more". */
export const freeShippingPhrase = (threshold) => {
  if (threshold === 0) return 'on every order'
  if (typeof threshold === 'number' && threshold > 0) {
    const amount = Number.isInteger(threshold) ? `$${threshold}` : `$${threshold.toFixed(2)}`
    return `on orders of ${amount} or more`
  }
  return 'on qualifying orders'
}
