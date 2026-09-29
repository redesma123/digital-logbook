import { Router } from 'express';
import { authRouter } from './auth.routes.js';
import { userRouter } from './user.routes.js';
import { plantRouter } from './plant.routes.js';
import { unitRouter } from './unit.routes.js';
import { logbookRouter } from './logbook.routes.js';
import { incidentRouter } from './incident.routes.js';
import { maintenanceRouter } from './maintenance.routes.js';
import { attachmentRouter } from './attachment.routes.js';

export const router = Router();

router.get('/health', (_req, res) => {
  res.json({ statusCode: 200, success: true, message: 'HYDRO-MON API is running' });
});

router.use('/auth', authRouter);
router.use('/users', userRouter);
router.use('/plants', plantRouter);
router.use('/units', unitRouter);
router.use('/logbook', logbookRouter);
router.use('/incidents', incidentRouter);
router.use('/maintenance', maintenanceRouter);
router.use('/attachments', attachmentRouter);
