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

  // Get IP address
  const ipAddress =
    req.headers['x-forwarded-for'] as string ||
    req.socket.remoteAddress ||
    'unknown';

  return {
    deviceInfo,
    userAgent,
    ipAddress: ipAddress.split(',')[0].trim() // Get first IP if multiple are present
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
