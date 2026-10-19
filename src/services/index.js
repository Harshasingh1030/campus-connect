/**
 * Unified Service Layer Factory
 * Strictly selects between isolated Demo Services and live AWS API Services based on environment.
 * 
 * SAFEGUARD: When VITE_USE_MOCK_DATA is 'false', it strictly calls production API services and
 * does NOT silently fallback to mock data on error.
 */

import { authDemoService } from './demo/authDemo';
import { eventDemoService } from './demo/eventDemo';
import { registrationDemoService } from './demo/registrationDemo';
import { attendanceDemoService } from './demo/attendanceDemo';
import { uploadDemoService } from './demo/uploadDemo';
import { resetToSeedData } from './demo/storage';

import { authApiService } from './api/authApi';
import { eventApiService } from './api/eventApi';
import { registrationApiService } from './api/registrationApi';
import { attendanceApiService } from './api/attendanceApi';
import { uploadApiService } from './api/uploadApi';

const useMockData = import.meta.env.VITE_USE_MOCK_DATA !== 'false';

export const isDemoMode = () => useMockData;

export const authService = useMockData ? authDemoService : authApiService;
export const eventService = useMockData ? eventDemoService : eventApiService;
export const registrationService = useMockData ? registrationDemoService : registrationApiService;
export const attendanceService = useMockData ? attendanceDemoService : attendanceApiService;
export const uploadService = useMockData ? uploadDemoService : uploadApiService;

export { resetToSeedData };
