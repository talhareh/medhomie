import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { MainLayout } from '../../components/layout/MainLayout';
import { User, UserRole } from '../../types/auth';
import api from '../../utils/axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faArrowLeft,
    faDesktop,
    faMobileAlt,
    faGlobe,
    faClock,
    faMapMarkerAlt,
    faTrash,
    faBook,
    faMoneyBillWave,
    faCheckCircle,
    faTimesCircle,
    faHourglassHalf,
    faBan,
    faCheck
} from '@fortawesome/free-solid-svg-icons';

interface UserDevice {
    _id: string;
    deviceName: string;
    deviceFingerprint: string;
    lastLogin: string;
    isActive: boolean;
    isBlocked?: boolean;
    ipAddress?: string;
    deviceInfo: {
        browser: string;
        os: string;
        platform: string;
        userAgent: string;
    };
}

interface Enrollment {
    _id: string;
    course?: {
        _id: string;
        title: string;
        price: number;
        thumbnail: string;
    } | null;
    status: 'pending' | 'approved' | 'rejected';
    enrollmentDate: string;
}

interface Payment {
    _id: string;
    course: {
        _id: string;
        title: string;
    };
    amount: number;
    paymentDate: string;
    paymentMethod: string;
    status: 'pending' | 'verified' | 'rejected';
    transactionId?: string;
}

interface UserDetails extends User {
    devices: UserDevice[];
    enrollments: Enrollment[];
    payments: Payment[];
}

export const AdminUserDetailsPage: React.FC = () => {
    const { userId } = useParams<{ userId: string }>();
    const navigate = useNavigate();
    const [user, setUser] = useState<UserDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchUserDetails();
    }, [userId]);

    const fetchUserDetails = async () => {
        try {
            setIsLoading(true);
            const response = await api.get<UserDetails>(`/users/${userId}`);
            setUser(response.data);
        } catch (error: any) {
            console.error('Error fetching user details:', error);
            toast.error('Failed to load user details');
            navigate('/admin/users');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteDevice = async (deviceId: string, e?: React.MouseEvent) => {
        if (e) {
            e.stopPropagation();
        }
        
        if (!window.confirm('Are you sure you want to remove this device? The user will be logged out from this device.')) {
            return;
        }

        try {
            await api.delete(`/users/${userId}/devices/${deviceId}`);
            toast.success('Device deleted successfully');
            fetchUserDetails(); // Refresh the user details
        } catch (error: any) {
            console.error('Error deleting device:', error);
            toast.error(error.response?.data?.message || 'Failed to remove device');
        }
    };

    const handleBlockDevice = async (deviceId: string, isBlocked: boolean, e?: React.MouseEvent) => {
        if (e) {
            e.stopPropagation();
        }

        try {
            await api.patch(`/users/${userId}/devices/${deviceId}/block`, { isBlocked });
            toast.success(isBlocked ? 'Device blocked successfully' : 'Device unblocked successfully');
            fetchUserDetails(); // Refresh the user details
        } catch (error: any) {
            console.error('Error blocking device:', error);
            toast.error(error.response?.data?.message || 'Failed to update device status');
        }
    };

    const handleDeleteAllDevices = async () => {
        if (!window.confirm('Are you sure you want to delete all devices? The user will be logged out from all devices.')) {
            return;
        }

        try {
            const response = await api.delete(`/users/${userId}/devices`);
            toast.success(`All devices deleted successfully (${response.data.count} devices removed)`);
            fetchUserDetails(); // Refresh the user details
        } catch (error: any) {
            console.error('Error deleting all devices:', error);
            toast.error(error.response?.data?.message || 'Failed to delete all devices');
        }
    };

    const handleDeleteDeviceGroup = async (deviceName: string, deviceIds: string[]) => {
        if (!window.confirm(`Are you sure you want to delete all "${deviceName}" devices? The user will be logged out from these devices.`)) {
            return;
        }

        try {
            // Delete all devices in the group
            await Promise.all(deviceIds.map(deviceId => api.delete(`/users/${userId}/devices/${deviceId}`)));
            toast.success(`All "${deviceName}" devices deleted successfully`);
            fetchUserDetails(); // Refresh the user details
        } catch (error: any) {
            console.error('Error deleting device group:', error);
            toast.error(error.response?.data?.message || 'Failed to delete devices');
        }
    };

    if (isLoading) {
        return (
            <MainLayout>
                <div className="flex justify-center items-center min-h-[60vh]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            </MainLayout>
        );
    }

    if (!user) return null;

    // Group devices by deviceName
    const groupDevicesByName = () => {
        if (!user.devices || user.devices.length === 0) return [];

        const grouped = user.devices.reduce((acc: any, device) => {
            const key = device.deviceName;
            if (!acc[key]) {
                acc[key] = {
                    deviceName: device.deviceName,
                    devices: [],
                    count: 0,
                    browser: device.deviceInfo?.browser || '-',
                    os: device.deviceInfo?.os || '-',
                    lastActive: device.lastLogin,
                    ipAddresses: new Set<string>(),
                    deviceIds: [],
                    platform: device.deviceInfo?.platform
                };
            }
            acc[key].devices.push(device);
            acc[key].count++;
            if (device.ipAddress) acc[key].ipAddresses.add(device.ipAddress);
            if (new Date(device.lastLogin) > new Date(acc[key].lastActive)) {
                acc[key].lastActive = device.lastLogin;
            }
            acc[key].deviceIds.push(device._id);
            return acc;
        }, {});

        return Object.values(grouped).map((group: any) => ({
            ...group,
            ipAddresses: Array.from(group.ipAddresses)
        }));
    };

    const groupedDevices = groupDevicesByName();

    return (
        <MainLayout>
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/admin/users')}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <FontAwesomeIcon icon={faArrowLeft} className="text-gray-600" />
                    </button>
                    <h1 className="text-2xl font-bold text-gray-800">User Details</h1>
                </div>

                {/* User Profile Card */}
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-start gap-6">
                        <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center text-2xl font-bold text-gray-500">
                            {user.profilePicture ? (
                                <img src={user.profilePicture} alt={user.fullName} className="h-full w-full rounded-full object-cover" />
                            ) : (
                                user.fullName[0]
                            )}
                        </div>
                        <div className="flex-1">
                            <h2 className="text-xl font-bold text-gray-900">{user.fullName}</h2>
                            <p className="text-gray-500">{user.email}</p>
                            <div className="mt-4 flex gap-4">
                                <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                                    {user.role}
                                </div>
                                <div className={`px-3 py-1 rounded-full text-sm font-medium ${user.isApproved ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {user.isApproved ? 'Approved' : 'Pending Approval'}
                                </div>
                            </div>
                            <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-gray-600">
                                <div>
                                    <span className="font-medium">WhatsApp:</span> {user.whatsappNumber || '-'}
                                </div>
                                <div>
                                    <span className="font-medium">Last Login:</span> {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Devices Section */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="px-4 md:px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-gray-800">
                            Registered Devices ({user.devices?.length || 0}/3)
                        </h3>
                        {user.devices && user.devices.length > 0 && (
                            <button
                                onClick={handleDeleteAllDevices}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 text-sm font-medium"
                            >
                                Delete All Devices
                            </button>
                        )}
                    </div>

                    {(!user.devices || user.devices.length === 0) ? (
                        <div className="p-8 text-center text-gray-500">
                            No devices registered for this user.
                        </div>
                    ) : (
                        <div className="overflow-x-auto w-full">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Device Name</th>
                                        <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Count</th>
                                        <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Browser</th>
                                        <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">OS</th>
                                        <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP Addresses</th>
                                        <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Active</th>
                                        <th className="px-4 md:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {groupedDevices.map((group: any, index: number) => {
                                        const ipDisplay = group.ipAddresses.length === 0 
                                            ? '-' 
                                            : group.ipAddresses.length <= 3
                                                ? group.ipAddresses.join(', ')
                                                : `${group.ipAddresses.slice(0, 3).join(', ')} (+${group.ipAddresses.length - 3} more)`;
                                        
                                        return (
                                            <tr key={`${group.deviceName}-${index}`}>
                                                <td className="px-4 md:px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <FontAwesomeIcon 
                                                            icon={group.platform === 'mobile' ? faMobileAlt : faDesktop} 
                                                            className="text-gray-400" 
                                                        />
                                                        <span className="font-medium text-gray-900">{group.deviceName}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 md:px-6 py-4">
                                                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                                        {group.count}
                                                    </span>
                                                </td>
                                                <td className="px-4 md:px-6 py-4 text-sm text-gray-500">
                                                    {group.browser}
                                                </td>
                                                <td className="px-4 md:px-6 py-4 text-sm text-gray-500">
                                                    {group.os}
                                                </td>
                                                <td className="px-4 md:px-6 py-4 text-sm text-gray-500 font-mono">
                                                    {ipDisplay}
                                                </td>
                                                <td className="px-4 md:px-6 py-4 text-sm text-gray-500">
                                                    <div className="flex items-center gap-2">
                                                        <FontAwesomeIcon icon={faClock} className="text-gray-400" />
                                                        {new Date(group.lastActive).toLocaleString()}
                                                    </div>
                                                </td>
                                                <td className="px-4 md:px-6 py-4 text-right text-sm font-medium">
                                                    <button
                                                        onClick={() => handleDeleteDeviceGroup(group.deviceName, group.deviceIds)}
                                                        className="text-red-600 hover:text-red-900 px-2 py-1"
                                                        title="Delete All Devices of This Type"
                                                    >
                                                        <FontAwesomeIcon icon={faTrash} />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Enrolled Courses Section */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-gray-800">
                            Enrolled Courses ({user.enrollments?.length || 0})
                        </h3>
                    </div>

                    {(!user.enrollments || user.enrollments.length === 0) ? (
                        <div className="p-8 text-center text-gray-500">
                            No enrolled courses found.
                        </div>
                    ) : (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {user.enrollments.map((enrollment) => (
                                    <tr key={enrollment._id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 flex-shrink-0">
                                                    {enrollment.course?.thumbnail ? (
                                                        <img className="h-10 w-10 rounded object-cover" src={enrollment.course.thumbnail} alt="" />
                                                    ) : (
                                                        <div className="h-10 w-10 rounded bg-gray-200 flex items-center justify-center">
                                                            <FontAwesomeIcon icon={faBook} className="text-gray-400" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {enrollment.course?.title || 'Unknown Course'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                ${enrollment.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                    enrollment.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                        'bg-yellow-100 text-yellow-800'}`}>
                                                {enrollment.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(enrollment.enrollmentDate).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                                            ${enrollment.course?.price || 0}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Payment History Section */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-gray-800">
                            Payment History ({user.payments?.length || 0})
                        </h3>
                    </div>

                    {(!user.payments || user.payments.length === 0) ? (
                        <div className="p-8 text-center text-gray-500">
                            No payment history found.
                        </div>
                    ) : (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction ID</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {user.payments.map((payment) => (
                                    <tr key={payment._id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {payment.course?.title || 'Unknown Course'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            ${payment.amount}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                                            {payment.paymentMethod.replace('_', ' ')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                ${payment.status === 'verified' ? 'bg-green-100 text-green-800' :
                                                    payment.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                        'bg-yellow-100 text-yellow-800'}`}>
                                                {payment.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(payment.paymentDate).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                                            {payment.transactionId || '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </MainLayout>
    );
};
