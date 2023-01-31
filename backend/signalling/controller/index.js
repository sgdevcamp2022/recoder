import express from 'express';
import { v4 as uuidV4 } from 'uuid';

const router = express.Router();
router.get('/createLink', (req, res) => {
  const link = 'https://' + req.headers.host + '/' + uuidV4().slice(5, 17);
  res.send(link);
});

export default router;
