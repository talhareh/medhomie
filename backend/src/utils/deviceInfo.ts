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
