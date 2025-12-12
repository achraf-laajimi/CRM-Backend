import { Router } from 'express';
import { loginSuccess, loginFailed, googleAuth, googleCallback, logout } from '../controllers/authController';
import {login ,signup} from '../controllers/Auth';
import {
  getUsers,
  getUserss,
  getUser,
  createUser,
  updateUser,
  deleteUser,} from '../controllers/crud';
  import {blockUser} from '../controllers/blockUser';
  import {requireauth} from '../middlewares/requireauth';
  import checkRole from '../middlewares/checkRole';

const router = Router();

router.get('/login/success', loginSuccess);
router.get('/login/failed', loginFailed);
router.get('/google', googleAuth);
router.get('/google/callback', googleCallback);
router.post('/logout', logout);
router.post('/login', login);
router.post('/signup', signup);
router.get('/getUsers', checkRole( 'admin','Rep Commerciale'),getUserss);
router.get('/getUser/:id',checkRole( 'admin', 'client','Rep Commerciale') ,getUser);
router.post('/adduser', checkRole( 'admin'),createUser);
router.put('/updateUser/:id',checkRole( 'admin',"client",'Rep Commerciale'), updateUser);
router.delete('/deleteUser/:id', checkRole( 'admin','Rep Commerciale'), deleteUser);
router.get('/filter',checkRole('Rep Commerciale', 'admin',"client"), getUsers);
router.put('/blockUser/:userId',checkRole('Rep Commerciale', 'admin'), blockUser);


export default router;
