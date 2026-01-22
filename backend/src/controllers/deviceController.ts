import { Request, Response } from 'express';
import { UserDevice } from '../models/UserDevice';
import { UserRole } from '../models/User';
import { AuthRequest } from '../middleware/auth';

// Delete device (Admin only)
export const deleteDevice = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
    if (!authReq.user || authReq.user.role !== UserRole.ADMIN) {
      res.status(403).json({ message: 'Access denied' });
      return;
    }

    const { userId, deviceId } = req.params;

    // Verify device belongs to the user
    const device = await UserDevice.findOne({ _id: deviceId, userId });
    if (!device) {
      res.status(404).json({ message: 'Device not found' });
      return;
    }

    await UserDevice.findByIdAndDelete(deviceId);

    res.status(200).json({ message: 'Device deleted successfully' });
  } catch (error) {
    console.error('Error deleting device:', error);
    res.status(500).json({ message: 'Error deleting device', error });
  }
};

// Delete all devices for a user (Admin only)
export const deleteAllDevices = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
    if (!authReq.user || authReq.user.role !== UserRole.ADMIN) {
      res.status(403).json({ message: 'Access denied' });
      return;
    }

    const { userId } = req.params;

    // Delete all devices for the user
    const result = await UserDevice.deleteMany({ userId });

    res.status(200).json({
      message: 'All devices deleted successfully',
      count: result.deletedCount
    });
  } catch (error) {
    console.error('Error deleting all devices:', error);
    res.status(500).json({ message: 'Error deleting all devices', error });
  }
};

// Block/Unblock device (Admin only)
export const blockDevice = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
    if (!authReq.user || authReq.user.role !== UserRole.ADMIN) {
      res.status(403).json({ message: 'Access denied' });
      return;
    }

    const { userId, deviceId } = req.params;
    const { isBlocked } = req.body;

    // Verify device belongs to the user
    const device = await UserDevice.findOne({ _id: deviceId, userId });
    if (!device) {
      res.status(404).json({ message: 'Device not found' });
      return;
    }

    device.isBlocked = isBlocked;
    await device.save();

    res.status(200).json({
      message: isBlocked ? 'Device blocked successfully' : 'Device unblocked successfully',
      device: {
        _id: device._id,
        deviceName: device.deviceName,
        isBlocked: device.isBlocked
      }
    });
  } catch (error) {
    console.error('Error updating device block status:', error);
    res.status(500).json({ message: 'Error updating device block status', error });
  }
};

