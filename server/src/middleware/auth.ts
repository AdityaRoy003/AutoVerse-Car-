import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest, UserRole, AuthUser } from '../types/index.js';
import { User } from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'autoverse_secret_key_development_2026_jwt';

export const signToken = (payload: AuthUser): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '7d',
  } as any);
};

export const authenticateJWT = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Authentication required. No token provided.',
      });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;

    // Check user active status in database
    const userDoc = await User.findById(decoded.id).select('active role name email assignedShowroom supportedModels');
    if (!userDoc || !userDoc.active) {
      res.status(401).json({
        success: false,
        message: 'User account is deactivated or no longer exists.',
      });
      return;
    }

    req.user = {
      id: userDoc._id.toString(),
      email: userDoc.email,
      role: userDoc.role,
      name: userDoc.name,
      assignedShowroom: userDoc.assignedShowroom?.toString(),
      supportedModels: userDoc.supportedModels?.map((m) => m.toString()),
    };

    next();
  } catch (error: any) {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication token.',
      error: error.message,
    });
  }
};

export const optionalAuth = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
      const userDoc = await User.findById(decoded.id).select('active role name email assignedShowroom');
      if (userDoc && userDoc.active) {
        req.user = {
          id: userDoc._id.toString(),
          email: userDoc.email,
          role: userDoc.role,
          name: userDoc.name,
          assignedShowroom: userDoc.assignedShowroom?.toString(),
        };
      }
    }
  } catch {
    // Ignore invalid optional tokens
  }
  next();
};

export const requireRole = (allowedRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required before checking permissions.',
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Forbidden: Access requires one of [${allowedRoles.join(', ')}]. Your role is ${req.user.role}.`,
      });
      return;
    }

    next();
  };
};
