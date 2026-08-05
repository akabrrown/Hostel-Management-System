import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

import adminaccountsRouter from './routes/admin_accounts';
app.use('/api/admin/accounts', adminaccountsRouter);

import adminadminroomsRouter from './routes/admin_admin-rooms';
app.use('/api/admin/admin-rooms', adminadminroomsRouter);

import adminallocatorRouter from './routes/admin_allocator';
app.use('/api/admin/allocator', adminallocatorRouter);

import adminhostelcontentRouter from './routes/admin_hostel-content';
app.use('/api/admin/hostel-content', adminhostelcontentRouter);

import adminhostelsidfloorconfigRouter from './routes/admin_hostels_[id]_floor-config';
app.use('/api/admin/hostels/:id/floor-config', adminhostelsidfloorconfigRouter);

import adminportersRouter from './routes/admin_porters';
app.use('/api/admin/porters', adminportersRouter);

import adminresetsystemRouter from './routes/admin_reset-system';
app.use('/api/admin/reset-system', adminresetsystemRouter);

import adminsettingsRouter from './routes/admin_settings';
app.use('/api/admin/settings', adminsettingsRouter);

import adminstatsRouter from './routes/admin_stats';
app.use('/api/admin/stats', adminstatsRouter);

import adminStudentsRouter from './routes/admin_students';
app.use('/api/admin/students', adminStudentsRouter);

import adminReservationsRouter from './routes/admin_reservations';
app.use('/api/admin/reservations', adminReservationsRouter);

import adminBookingsRouter from './routes/admin_bookings';
app.use('/api/admin/bookings', adminBookingsRouter);

import adminReportsRouter from './routes/admin_reports';
app.use('/api/admin/reports', adminReportsRouter);

import announcementsRouter from './routes/announcements';
app.use('/api/announcements', announcementsRouter);

import authRouter from './routes/auth';
app.use('/api/auth', authRouter);


import clearsampledataRouter from './routes/clear-sample-data';
app.use('/api/clear-sample-data', clearsampledataRouter);



import hostelsRouter from './routes/hostels';
app.use('/api/hostels', hostelsRouter);

import notificationsRouter from './routes/notifications';
app.use('/api/notifications', notificationsRouter);

import paymentsRouter from './routes/payments';
app.use('/api/payments', paymentsRouter);

import portercheckinRouter from './routes/porter_checkin';
app.use('/api/porter/checkin', portercheckinRouter);

import portercheckoutRouter from './routes/porter_checkout';
app.use('/api/porter/checkout', portercheckoutRouter);

import portersearchstudentRouter from './routes/porter_search-student';
app.use('/api/porter/search-student', portersearchstudentRouter);

import porterstatsRouter from './routes/porter_stats';
app.use('/api/porter/stats', porterstatsRouter);

import portertodaycheckinsRouter from './routes/porter_today-checkins';
app.use('/api/porter/today-checkins', portertodaycheckinsRouter);

import profileRouter from './routes/profile';
app.use('/api/profile', profileRouter);

import roommatesRouter from './routes/roommates';
app.use('/api/roommates', roommatesRouter);

import roomsRouter from './routes/rooms';
app.use('/api/rooms', roomsRouter);

import seedhostelsRouter from './routes/seed-hostels';
app.use('/api/seed-hostels', seedhostelsRouter);

import settingsRouter from './routes/settings';
app.use('/api/settings', settingsRouter);

import setuphostelcontentRouter from './routes/setup-hostel-content';
app.use('/api/setup-hostel-content', setuphostelcontentRouter);

import studentsRouter from './routes/students';
app.use('/api/students', studentsRouter);

import studentreservationsRouter from './routes/student_reservations';
app.use('/api/student/reservations', studentreservationsRouter);

import studentsettingsRouter from './routes/student_settings';
app.use('/api/student/settings', studentsettingsRouter);

import studentComplaintsRouter from './routes/student_complaints';
app.use('/api/student/complaints', studentComplaintsRouter);

import adminComplaintsRouter from './routes/admin_complaints';
app.use('/api/admin/complaints', adminComplaintsRouter);

import porterComplaintsRouter from './routes/porter_complaints';
app.use('/api/porter/complaints', porterComplaintsRouter);

import testhostelsRouter from './routes/test-hostels';
app.use('/api/test-hostels', testhostelsRouter);

import visitorsRouter from './routes/visitors';
app.use('/api/visitors', visitorsRouter);

import maintenanceRouter from './routes/maintenance';
app.use('/api/maintenance', maintenanceRouter);

import roomKeysRouter from './routes/room_keys';
app.use('/api/room_keys', roomKeysRouter);

import webhookRouter from './routes/webhook';
app.use('/api/webhooks', webhookRouter);

import adminMaintenanceRouter from './routes/admin_maintenance';
app.use('/api/admin/maintenance', adminMaintenanceRouter);

import adminSettingsRouter from './routes/admin_settings';
app.use('/api/admin/settings', adminSettingsRouter);

import adminRoomKeysRouter from './routes/admin_room_keys';
app.use('/api/admin/room-keys', adminRoomKeysRouter);

import adminVisitorsRouter from './routes/admin_visitors';
app.use('/api/admin/visitors', adminVisitorsRouter);

import porterMaintenanceRouter from './routes/porter_maintenance';
app.use('/api/porter/maintenance', porterMaintenanceRouter);

import porterKeysRouter from './routes/porter_keys';
app.use('/api/porter/keys', porterKeysRouter);

import porterVisitorsRouter from './routes/porter_visitors';
app.use('/api/porter/visitors', porterVisitorsRouter);

import porterRoomsRouter from './routes/porter_rooms';
app.use('/api/porter/rooms', porterRoomsRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

import { createServer } from 'http';
import { initSocket } from './socket';
import { initWorkers } from './queue/worker';

const server = createServer(app);
initSocket(server);
try {
  initWorkers();
} catch (error: any) {
  console.warn('Failed to initialize BullMQ workers. Background tasks will be disabled.', error.message);
}

server.listen(port, () => {
  console.log(`Backend server running on port ${port}`);
});
