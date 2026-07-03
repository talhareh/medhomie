import geoip from 'geoip-lite';
import { normalizeIp } from './deviceInfo';

export interface GeoLocation {
  country?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
}

/**
 * Resolve an approximate geographic location for an IP address using the
 * offline MaxMind GeoLite2 database bundled with `geoip-lite`.
 *
 * Returns `undefined` for unknown, loopback, or private IPs (the lookup yields
 * no match), so the caller can simply omit the `location` field.
 */
export const lookupLocation = (ipAddress?: string): GeoLocation | undefined => {
  if (!ipAddress) return undefined;

  const ip = normalizeIp(ipAddress);
  if (!ip || ip === 'unknown') return undefined;

  const geo = geoip.lookup(ip);
  if (!geo) return undefined;

  return {
    country: geo.country || undefined,
    city: geo.city || undefined,
    latitude: Array.isArray(geo.ll) ? geo.ll[0] : undefined,
    longitude: Array.isArray(geo.ll) ? geo.ll[1] : undefined
  };
};
