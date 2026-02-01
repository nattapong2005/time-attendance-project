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

// Public Master Data
router.get('/public/departments', dataController.getDepartments);
router.get('/public/sakas', dataController.getSakas);

// Profile
router.get('/profile', authenticateToken, userController.getMe);
router.put('/profile', authenticateToken, userController.updateMe);

// --- Student Routes ---
router.post('/attendance/check-in', authenticateToken, requireRole(['STUDENT']), attendanceController.checkIn);
router.post('/attendance/check-out', authenticateToken, requireRole(['STUDENT']), attendanceController.checkOut);
router.get('/attendance/my-history', authenticateToken, requireRole(['STUDENT']), attendanceController.getMyAttendance);
router.get('/attendance/today', authenticateToken, requireRole(['STUDENT']), attendanceController.getTodayAttendance);
router.post('/leaves', authenticateToken, requireRole(['STUDENT']), leaveController.createLeaveRequest);
router.get('/leaves/my-history', authenticateToken, requireRole(['STUDENT']), leaveController.getMyLeaves);

// --- Admin Routes ---
// Users
router.post('/users', authenticateToken, requireRole(['ADMIN', 'TEACHER']), userController.createUser);
router.get('/users', userController.getUsers);
router.put('/users/:id', authenticateToken, requireRole(['ADMIN', 'TEACHER']), userController.updateUser);
router.delete('/users/:id', authenticateToken, requireRole(['ADMIN', 'TEACHER']), userController.deleteUser);

// Master Data (Departments/Locations)
router.post('/departments', authenticateToken, requireRole(['ADMIN', 'TEACHER']), dataController.createDepartment);
router.get('/departments', authenticateToken, requireRole(['ADMIN', 'TEACHER']), dataController.getDepartments);
router.put('/departments/:id', authenticateToken, requireRole(['ADMIN', 'TEACHER']), dataController.updateDepartment);
router.delete('/departments/:id', authenticateToken, requireRole(['ADMIN', 'TEACHER']), dataController.deleteDepartment);

router.post('/sakas', authenticateToken, requireRole(['ADMIN', 'TEACHER']), dataController.createSaka);
router.get('/sakas', authenticateToken, requireRole(['ADMIN', 'TEACHER']), dataController.getSakas);
router.put('/sakas/:id', authenticateToken, requireRole(['ADMIN', 'TEACHER']), dataController.updateSaka);
router.delete('/sakas/:id', authenticateToken, requireRole(['ADMIN', 'TEACHER']), dataController.deleteSaka);

// Attendance Management
router.post('/attendance', authenticateToken, requireRole(['ADMIN', 'TEACHER']), attendanceController.createAttendance);
router.post('/attendance/absent', authenticateToken, requireRole(['ADMIN', 'TEACHER']), attendanceController.recordAbsence);
router.put('/attendance/:id', authenticateToken, requireRole(['ADMIN', 'TEACHER']), attendanceController.updateAttendance); // 1.4/2.3 Implemented
router.delete('/attendance/:id', authenticateToken, requireRole(['ADMIN', 'TEACHER']), attendanceController.deleteAttendance);
router.get('/attendance/monthly-report', authenticateToken, requireRole(['ADMIN', 'TEACHER']), attendanceController.getMonthlyReport); // 2.6 Implemented

// Leave Management
router.get('/leaves', authenticateToken, requireRole(['ADMIN', 'TEACHER']), leaveController.getAllLeaves);
router.put('/leaves/:id/status', authenticateToken, requireRole(['ADMIN', 'TEACHER']), leaveController.updateLeaveStatus);
router.delete('/leaves/:id', authenticateToken, requireRole(['ADMIN', 'TEACHER']), leaveController.deleteLeave);

// Reports
router.get('/reports/dashboard', authenticateToken, requireRole(['ADMIN', 'TEACHER']), reportController.getDashboardStats);
router.get('/reports/attendance-summary', authenticateToken, requireRole(['ADMIN', 'TEACHER']), reportController.getAttendanceSummary);
router.get('/reports/monthly-trends', authenticateToken, requireRole(['ADMIN', 'TEACHER']), reportController.getMonthlyTrends);
router.get('/reports/student-stats', authenticateToken, requireRole(['ADMIN', 'TEACHER']), reportController.getStudentStats);

// --- Teacher Routes ---
// View specific student 
router.get('/students/:studentId/attendance', authenticateToken, requireRole(['ADMIN', 'TEACHER']), attendanceController.getStudentAttendance);

export default router;
