
import { v4 as uuidv4 } from 'uuid';

export const generateUniqueTicketNumber = () => {
  return `TKT-${uuidv4().split('-')[0].toUpperCase()}`;
};

export const generateUniqueQRCode = () => {
  return uuidv4();
};

export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
};

export const sendResponse = (res: any, statusCode: number, data?: any, message?: string) => {
  res.status(statusCode).json({
    success: statusCode >= 200 && statusCode < 300,
    data,
    message,
  });
};

export const throwError = (statusCode: number, message: string) => {
  const error: any = new Error(message);
  error.statusCode = statusCode;
  throw error;
};
