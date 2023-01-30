import roomController from './room_controller.js';
import express from 'express';

const router = express.Router();
router.get('/createLink', roomController.createLink);

export default router;
