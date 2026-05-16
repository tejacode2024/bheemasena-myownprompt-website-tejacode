export type GeocodeResult = {
  flat?: string
  street?: string
  landmark?: string
  city?: string
  pincode?: string
}

type NominatimResp = {
  address?: {
    house_number?: string
    road?: string
    suburb?: string
    neighbourhood?: string
    city?: string
    town?: string
    village?: string
    postcode?: string
  }
}

export async function reverseGeocode(lat: number, lon: number): Promise<GeocodeResult> {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`
  const res = await fetch(url, { headers: { 'Accept': 'application/json' } })
  if (!res.ok) throw new Error('Reverse geocode failed')
  const data = (await res.json()) as NominatimResp
  const a = data.address ?? {}
  return {
    flat:     a.house_number,
    street:   a.road,
    landmark: a.suburb ?? a.neighbourhood,
    city:     a.city ?? a.town ?? a.village,
    pincode:  a.postcode,
  }
}

export function getBrowserLocation(): Promise<{ lat: number; lon: number }> {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(new Error('Geolocation not supported'))
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      (err) => reject(err),
      { enableHighAccuracy: false, timeout: 8000 },
    )
  })
}
