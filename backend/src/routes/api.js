import express from 'express';
import * as authController from '../controllers/authController.js';
import * as attendanceController from '../controllers/attendanceController.js';
import * as userController from '../controllers/userController.js';
import * as leaveController from '../controllers/leaveController.js';
import * as dataController from '../controllers/dataController.js';
import * as reportController from '../controllers/reportController.js';
import { authenticateToken, requireRole } from '../middlewares/auth.js';

const router = express.Router();

// Auth
router.post('/login', authController.login);
router.post('/register', authController.register);

// --- Student Routes ---
router.post('/attendance/check-in', authenticateToken, requireRole(['STUDENT']), attendanceController.checkIn);
router.post('/attendance/check-out', authenticateToken, requireRole(['STUDENT']), attendanceController.checkOut);
router.get('/attendance/my-history', authenticateToken, requireRole(['STUDENT']), attendanceController.getMyAttendance);
router.post('/leaves', authenticateToken, requireRole(['STUDENT']), leaveController.createLeaveRequest);
router.get('/leaves/my-history', authenticateToken, requireRole(['STUDENT']), leaveController.getMyLeaves);

// --- Admin Routes ---
// Users
router.post('/users', authenticateToken, requireRole(['ADMIN']), userController.createUser);
router.get('/users', userController.getUsers);
router.put('/users/:id', authenticateToken, requireRole(['ADMIN']), userController.updateUser);
router.delete('/users/:id', authenticateToken, requireRole(['ADMIN']), userController.deleteUser);

// Master Data (Departments/Locations)
router.post('/departments', authenticateToken, requireRole(['ADMIN']), dataController.createDepartment);
router.get('/departments', authenticateToken, requireRole(['ADMIN']), dataController.getDepartments);
router.put('/departments/:id', authenticateToken, requireRole(['ADMIN']), dataController.updateDepartment);
router.delete('/departments/:id', authenticateToken, requireRole(['ADMIN']), dataController.deleteDepartment);

router.post('/locations', authenticateToken, requireRole(['ADMIN']), dataController.createLocation);
router.get('/locations', authenticateToken, requireRole(['ADMIN']), dataController.getLocations);
router.put('/locations/:id', authenticateToken, requireRole(['ADMIN']), dataController.updateLocation);
router.delete('/locations/:id', authenticateToken, requireRole(['ADMIN']), dataController.deleteLocation);

// Attendance Management
router.post('/attendance/absent', authenticateToken, requireRole(['ADMIN']), attendanceController.recordAbsence);
router.put('/attendance/:id', authenticateToken, requireRole(['ADMIN']), attendanceController.updateAttendance); // 1.4/2.3 Implemented
router.get('/attendance/monthly-report', authenticateToken, requireRole(['ADMIN', 'TEACHER']), attendanceController.getMonthlyReport); // 2.6 Implemented

// Leave Management
router.get('/leaves', authenticateToken, requireRole(['ADMIN']), leaveController.getAllLeaves);
router.put('/leaves/:id/status', authenticateToken, requireRole(['ADMIN']), leaveController.updateLeaveStatus);
router.delete('/leaves/:id', authenticateToken, requireRole(['ADMIN']), leaveController.deleteLeave);

// Reports
router.get('/reports/dashboard', authenticateToken, requireRole(['ADMIN']), reportController.getDashboardStats);
router.get('/reports/attendance-summary', authenticateToken, requireRole(['ADMIN']), reportController.getAttendanceSummary);

// --- Teacher Routes ---
// View specific student 
router.get('/students/:studentId/attendance', authenticateToken, requireRole(['ADMIN', 'TEACHER']), attendanceController.getStudentAttendance);

export default router;
