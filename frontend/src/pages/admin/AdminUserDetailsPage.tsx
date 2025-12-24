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
    faHourglassHalf
} from '@fortawesome/free-solid-svg-icons';

interface UserDevice {
    _id: string;
    deviceName: string;
    deviceFingerprint: string;
    lastLogin: string;
    isActive: boolean;
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

    const handleDeleteDevice = async (deviceId: string) => {
        if (!window.confirm('Are you sure you want to remove this device? The user will be logged out from this device.')) {
            return;
        }

        try {
            // We need to implement this endpoint in backend if we want to support deletion
            // For now, let's assume we might add it later or just show the UI
            // await api.delete(`/users/${userId}/devices/${deviceId}`);
            toast.info('Device removal not implemented yet in backend');

            // Optimistic update for demo
            // if (user) {
            //   setUser({
            //     ...user,
            //     devices: user.devices.filter(d => d._id !== deviceId)
            //   });
            // }
        } catch (error) {
            toast.error('Failed to remove device');
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
                    <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-gray-800">
                            Registered Devices ({user.devices?.length || 0}/3)
                        </h3>
                    </div>

                    {(!user.devices || user.devices.length === 0) ? (
                        <div className="p-8 text-center text-gray-500">
                            No devices registered for this user.
                        </div>
                    ) : (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Device Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Active</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Browser/OS</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {user.devices.map((device) => (
                                    <tr key={device._id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <FontAwesomeIcon icon={faDesktop} className="text-gray-400 mr-3" />
                                                <span className="font-medium text-gray-900">{device.deviceName}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {device.deviceInfo?.platform || 'Desktop'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <div className="flex items-center gap-2">
                                                <FontAwesomeIcon icon={faClock} className="text-gray-400" />
                                                {new Date(device.lastLogin).toLocaleString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {device.deviceInfo?.browser} on {device.deviceInfo?.os}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => handleDeleteDevice(device._id)}
                                                className="text-red-600 hover:text-red-900"
                                                title="Remove Device"
                                            >
                                                <FontAwesomeIcon icon={faTrash} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
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
