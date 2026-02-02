import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { validateBody, validateParams, asyncHandler } from '../middleware';
import { createUserSchema, userIdSchema } from '../models/users';

const router = Router();

/**
 * @route   POST /api/v1/users
 * @desc    Create a new user
 * @access  Public
 */
router.post(
  '/',
  validateBody(createUserSchema),
  asyncHandler(UserController.createUser)
);

/**
 * @route   GET /api/v1/users
 * @desc    Get all users with pagination
 * @access  Public
 */
router.get('/', asyncHandler(UserController.getAllUsers));

/**
 * @route   GET /api/v1/users/:id
 * @desc    Get user by ID
 * @access  Public
 */
router.get(
  '/:id',
  validateParams(userIdSchema),
  asyncHandler(UserController.getUserById)
);

/**
 * @route   GET /api/v1/users/address/:address
 * @desc    Get user by address
 * @access  Public
 */
router.get('/address/:address', asyncHandler(UserController.getUserByAddress));

/**
 * @route   DELETE /api/v1/users/:id
 * @desc    Delete user
 * @access  Public
 */
router.delete(
  '/:id',
  validateParams(userIdSchema),
  asyncHandler(UserController.deleteUser)
);

export default router;

