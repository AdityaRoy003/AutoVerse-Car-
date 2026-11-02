import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { User } from '../models/User.js';
import { CustomerProfile } from '../models/CustomerProfile.js';
import { signToken } from '../middleware/auth.js';
import { AuthenticatedRequest } from '../types/index.js';
import { AppError } from '../middleware/errorHandler.js';

const RegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().optional(),
  consentGiven: z.boolean().refine((val) => val === true, 'Consent to privacy policy is required'),
  marketingOptIn: z.boolean().optional().default(false),
});

const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const parsed = RegisterSchema.parse(req.body);
    const existing = await User.findOne({ email: parsed.email.toLowerCase() });
    if (existing) {
      throw new AppError('An account with this email already exists.', 409);
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(parsed.password, salt);

    const user = await User.create({
      name: parsed.name,
      email: parsed.email.toLowerCase(),
      passwordHash,
      phone: parsed.phone,
      role: 'BUYER',
      active: true,
    });

    await CustomerProfile.create({
      userId: user._id,
      alternatePhone: parsed.phone,
      marketingOptIn: parsed.marketingOptIn,
      consentHistory: [
        {
          type: 'PRIVACY_POLICY',
          consentGiven: true,
          consentedAt: new Date(),
          policyVersion: '1.0',
          ipAddress: req.ip,
        },
      ],
    });

    const token = signToken({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const parsed = LoginSchema.parse(req.body);
    const user = await User.findOne({ email: parsed.email.toLowerCase() })
      .populate('assignedShowroom', 'name')
      .populate('supportedModels', 'name');

    if (!user) {
      throw new AppError('Invalid email or password credentials.', 401);
    }

    if (!user.active) {
      throw new AppError('Your account has been deactivated. Please contact dealership administration.', 403);
    }

    const isMatch = await bcrypt.compare(parsed.password, user.passwordHash);
    if (!isMatch) {
      throw new AppError('Invalid email or password credentials.', 401);
    }

    const token = signToken({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
      assignedShowroom: user.assignedShowroom?._id?.toString(),
    });

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        assignedShowroom: user.assignedShowroom,
        supportedModels: user.supportedModels,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const user = await User.findById(req.user.id)
      .select('-passwordHash')
      .populate('assignedShowroom', 'name address city')
      .populate('supportedModels', 'name slug');

    const profile = await CustomerProfile.findOne({ userId: req.user.id });

    res.json({
      success: true,
      user,
      profile,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401);

    const { name, phone, address, city, preferredShowroom, marketingOptIn } = req.body;

    if (name) {
      await User.findByIdAndUpdate(req.user.id, { name, phone });
    }

    let profile = await CustomerProfile.findOne({ userId: req.user.id });
    if (!profile) {
      profile = new CustomerProfile({ userId: req.user.id });
    }

    if (address !== undefined) profile.address = address;
    if (city !== undefined) profile.city = city;
    if (preferredShowroom !== undefined) profile.preferredShowroom = preferredShowroom;
    if (marketingOptIn !== undefined) {
      profile.marketingOptIn = marketingOptIn;
      profile.consentHistory.push({
        type: 'MARKETING_SMS_EMAIL',
        consentGiven: marketingOptIn,
        consentedAt: new Date(),
        policyVersion: '1.0',
        ipAddress: req.ip,
      });
    }

    await profile.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      profile,
    });
  } catch (error) {
    next(error);
  }
};

