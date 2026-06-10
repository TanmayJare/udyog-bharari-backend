
import Joi from 'joi';

export const vendorRegistrationSchema = Joi.object({
  firstName: Joi.string().required().messages({
    'any.required': 'First name is required',
  }),
  lastName: Joi.string().required().messages({
    'any.required': 'Last name is required',
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Invalid email address',
    'any.required': 'Email is required',
  }),
  phone: Joi.string().min(10).required().messages({
    'string.min': 'Phone number must be at least 10 digits',
    'any.required': 'Phone number is required',
  }),
  companyName: Joi.string().required().messages({
    'any.required': 'Company name is required',
  }),
  stallDescription: Joi.string().required().messages({
    'any.required': 'Stall description is required',
  }),
  numPasses: Joi.number().min(1).max(5).required().messages({
    'number.min': 'Number of passes must be at least 1',
    'number.max': 'Number of passes must be at most 5',
    'any.required': 'Number of passes is required',
  }),
  specialRequirements: Joi.string().optional(),
});

export const visitorRegistrationSchema = Joi.object({
  firstName: Joi.string().required().messages({
    'any.required': 'First name is required',
  }),
  lastName: Joi.string().required().messages({
    'any.required': 'Last name is required',
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Invalid email address',
    'any.required': 'Email is required',
  }),
  phone: Joi.string().min(10).required().messages({
    'string.min': 'Phone number must be at least 10 digits',
    'any.required': 'Phone number is required',
  }),
  ticketType: Joi.string().valid('general', 'vip', 'couple', 'student').required().messages({
    'any.only': 'Ticket type must be one of general, vip, couple, student',
    'any.required': 'Ticket type is required',
  }),
  numTickets: Joi.number().min(1).max(10).required().messages({
    'number.min': 'Number of tickets must be at least 1',
    'number.max': 'Number of tickets must be at most 10',
    'any.required': 'Number of tickets is required',
  }),
  dietaryRequirements: Joi.string().optional(),
});

export const adminLoginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Invalid email address',
    'any.required': 'Email is required',
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required',
  }),
});

export const paymentVerifySchema = Joi.object({
  razorpayOrderId: Joi.string().required(),
  razorpayPaymentId: Joi.string().required(),
  razorpaySignature: Joi.string().required(),
  registrationId: Joi.string().required(),
});
