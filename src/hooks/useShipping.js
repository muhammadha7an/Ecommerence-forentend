import { useSelector } from 'react-redux'
import { calculateShipping } from '../utils/commerce'

/** Shipping quote for a subtotal, based on the admin shipping settings. */
export default function useShipping(subtotal) {
  const shipping = useSelector((state) => state.settings?.shipping)
  return calculateShipping(subtotal, shipping)
}

/** The configured free-shipping threshold, or null while settings load. */
export function useFreeShippingThreshold() {
  const shipping = useSelector((state) => state.settings?.shipping)
  if (!shipping) return null
  return Number(shipping.shippingFee) === 0 ? 0 : Number(shipping.freeShippingThreshold)
}
