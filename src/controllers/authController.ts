
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin';
import { sendResponse, throwError } from '../utils/helpers';
import { adminLoginSchema } from '../utils/validators';

export const login = async (req: Request, res: Response) => {
  try {
    const { error, value } = adminLoginSchema.validate(req.body);
    if (error) {
      throwError(400, error.details[0].message);
    }

    const { email, password } = value;
    const admin = await Admin.findOne({ email }).select('+password');

    if (!admin) {
      throwError(401, 'Invalid credentials');
    }

    if (!admin.isActive) {
      throwError(403, 'Account is inactive');
    }

    const isPasswordMatch = await admin.comparePassword(password);
    if (!isPasswordMatch) {
      throwError(401, 'Invalid credentials');
    }

    const token = jwt.sign(
      { id: admin!._id, role: admin!.role },
      process.env.JWT_SECRET || 'default_jwt_secret',
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    admin!.lastLogin = new Date();
    await admin!.save();

    sendResponse(res, 200, {
      token,
      admin: {
        id: admin!._id,
        name: admin!.name,
        role: admin!.role,
      },
    });
  } catch (err) {
    const error = err as any;
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Internal Server Error',
    });
  }
};

export const createInitialAdmin = async () => {
  try {
    const existingAdmin = await Admin.findOne({ email: 'admin@example.com' });
    if (!existingAdmin) {
      const admin = new Admin({
        email: 'admin@example.com',
        password: 'password123',
        name: 'Admin',
        role: 'admin',
      });
      await admin.save();
      console.log('Initial admin created: admin@example.com / password123');
    }
  } catch (err) {
    console.error('Failed to create initial admin:', err);
  }
};
