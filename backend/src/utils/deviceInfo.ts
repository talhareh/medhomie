import { UAParser } from 'ua-parser-js';
import { Request } from 'express';

interface DeviceInfo {
  browser?: string;
  os?: string;
  device?: string;
}

export interface RequestDeviceInfo {
  deviceInfo: DeviceInfo;
  userAgent: string | null;
  ipAddress: string;
}

/**
 * Normalize an IP address by stripping the IPv4-mapped IPv6 prefix
 * (e.g. `::ffff:203.0.113.5` -> `203.0.113.5`).
 */
export const normalizeIp = (ip: string): string => {
  if (!ip) return 'unknown';
  const trimmed = ip.trim();
  return trimmed.startsWith('::ffff:') ? trimmed.slice('::ffff:'.length) : trimmed;
};

/**
 * Resolve the real client IP. With `trust proxy` enabled on the Express app,
 * `req.ip` already accounts for the X-Forwarded-For chain set by nginx. We fall
 * back to parsing the header manually and finally to the socket address.
 */
export const getClientIp = (req: Request): string => {
  // Express populates req.ip from X-Forwarded-For when `trust proxy` is set.
  if (req.ip) {
    return normalizeIp(req.ip);
  }

  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return normalizeIp(forwarded.split(',')[0]);
  }
  if (Array.isArray(forwarded) && forwarded.length > 0) {
    return normalizeIp(forwarded[0]);
  }

  return normalizeIp(req.socket.remoteAddress || 'unknown');
};

export const extractDeviceInfo = (req: Request): RequestDeviceInfo => {
  const parser = new UAParser();
  const userAgent = req.headers['user-agent'] || null;

  if (userAgent) {
    parser.setUA(userAgent);
  }

  const result = parser.getResult();
  const deviceInfo: DeviceInfo = {
    browser: result.browser.name,
    os: result.os.name,
    device: result.device.type || result.device.model || 'unknown'
  };

  return {
    deviceInfo,
    userAgent,
    ipAddress: getClientIp(req)
  };
};

import crypto from 'crypto';

export const generateDeviceFingerprint = (req: Request): string => {
  const userAgent = req.headers['user-agent'] || '';
  const acceptLanguage = req.headers['accept-language'] || '';
  const secChUa = req.headers['sec-ch-ua'] || '';
  const platform = req.headers['sec-ch-ua-platform'] || '';

  // Create a hash of these values
  const data = `${userAgent}|${acceptLanguage}|${secChUa}|${platform}`;
  return crypto.createHash('sha256').update(data).digest('hex');
};

export const getDeviceName = (deviceInfo: DeviceInfo): string => {
  const browser = deviceInfo.browser || 'Unknown Browser';
  const os = deviceInfo.os || 'Unknown OS';
  const device = deviceInfo.device !== 'unknown' && deviceInfo.device ? ` on ${deviceInfo.device}` : '';

  return `${browser} on ${os}${device}`;
};
