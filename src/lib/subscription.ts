import api from '@/lib/api'

/** Interfaces for Subscription API Responses */
export interface Subscription {
  subscriptionId: string
  type: string // "VIP" or "FEATURED"
  startDate: string
  endDate: string
  isActive: boolean
}

export interface PriceResponse {
  type: string // "VIP" or "FEATURED"
  price: number
}

/** Fetch subscription status */
export async function getSubscriptionStatus(): Promise<Subscription[]> {
  const { data } = await api.get('/api/v1/subscriptions')
  return data
}

/** Fetch subscription price */
export async function getSubscriptionPrice(cityId: number, subscriptionType: string): Promise<number> {
  const { data } = await api.get('/api/v1/prices', {
    params: {
      cityId,
      subscriptionType,
    },
  })
  return data.price
}

/** Subscribe to a plan */
export async function subscribeToPlan(cityId: number, subscriptionType: string): Promise<Subscription> {
  const payload = { cityId, type: subscriptionType }
  const { data } = await api.post('/api/v1/subscriptions', payload)
  return data
}
