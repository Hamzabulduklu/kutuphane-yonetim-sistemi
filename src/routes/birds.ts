import express, { Request, Response, NextFunction } from 'express';

const router = express.Router();

// middleware that is specific to this router
const timeLog = (req: Request, res: Response, next: NextFunction): void => {
  console.log('Time: ', Date.now());
  next();
};

router.use(timeLog);

// define the home page route
router.get('/', (req: Request, res: Response): void => {
  res.send('Birds home page');
});

// define the about route
router.get('/about', (req: Request, res: Response): void => {
  res.send('About birds');
});

export default router;