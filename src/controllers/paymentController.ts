
import { Request, Response } from 'express';
import Payment from '../models/Payment';
import Registration from '../models/Registration';
import Ticket from '../models/Ticket';
import {
  verifyRazorpaySignature,
  refundPayment,
} from '../services/paymentService';
import { sendConfirmationEmail } from '../services/emailService';
import { createTicketsForRegistration } from './registrationController';
import { sendResponse, throwError } from '../utils/helpers';
import { paymentVerifySchema } from '../utils/validators';

export const verifyPayment = async (req: Request, res: Response) => {
  try {
    const { error, value } = paymentVerifySchema.validate(req.body);
    if (error) {
      throwError(400, error.details[0].message);
    }

    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, registrationId } = value;

    const isValid = verifyRazorpaySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);
    if (!isValid) {
      throwError(400, 'Invalid payment signature');
    }

    const payment = await Payment.findOne({ razorpayOrderId });
    if (!payment) {
      throwError(404, 'Payment not found');
    }

    payment.razorpayPaymentId = razorpayPaymentId;
    payment.razorpaySignature = razorpaySignature;
    payment.status = 'success';
    payment.paidAt = new Date();
    await payment.save();

    const registration = await Registration.findById(registrationId);
    if (!registration) {
      throwError(404, 'Registration not found');
    }

    registration.status = 'confirmed';
    await registration.save();

    const ticketCount = registration.numPasses || registration.numTickets || 1;
    const ticketType = registration.ticketType || 'vendor';
    const tickets = await createTicketsForRegistration(
      registrationId,
      ticketCount,
      ticketType,
      `${registration.firstName} ${registration.lastName}`,
      registration.email,
      registration.phone
    );

    registration.ticketIds = tickets.map((ticket: any) => ticket._id);
    await registration.save();

    try {
      await sendConfirmationEmail(registration.email, `${registration.firstName} ${registration.lastName}`, tickets);
    } catch (emailErr) {
      console.error('Failed to send confirmation email:', emailErr);
    }

    sendResponse(res, 200, { verified: true, tickets });
  } catch (err) {
    const error = err as any;
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Internal Server Error',
    });
  }
};

export const handleRazorpayWebhook = async (req: Request, res: Response) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || '';
    const signature = req.headers['x-razorpay-signature'] as string;
    const body = JSON.stringify(req.body);

    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(body)
      .digest('hex');

    if (expectedSignature !== signature) {
      return sendResponse(res, 400, null, 'Invalid webhook signature');
    }

    const event = req.body.event;
    if (event === 'payment.captured') {
      const paymentEntity = req.body.payload.payment.entity;
      const razorpayOrderId = paymentEntity.order_id;
      const razorpayPaymentId = paymentEntity.id;

      const payment = await Payment.findOne({ razorpayOrderId });
      if (payment && payment.status !== 'success') {
        payment.razorpayPaymentId = razorpayPaymentId;
        payment.status = 'success';
        payment.paidAt = new Date();
        await payment.save();

        const registration = await Registration.findById(payment.registrationId);
        if (registration) {
          registration.status = 'confirmed';
          await registration.save();

          const ticketCount = registration.numPasses || registration.numTickets || 1;
          const ticketType = registration.ticketType || 'vendor';
          const tickets = await createTicketsForRegistration(
            registration._id.toString(),
            ticketCount,
            ticketType,
            `${registration.firstName} ${registration.lastName}`,
            registration.email,
            registration.phone
          );
          registration.ticketIds = tickets.map((ticket: any) => ticket._id);
          await registration.save();

          try {
            await sendConfirmationEmail(registration.email, `${registration.firstName} ${registration.lastName}`, tickets);
          } catch (emailErr) {
            console.error('Failed to send confirmation email:', emailErr);
          }
        }
      }
    }

    sendResponse(res, 200);
  } catch (err) {
    const error = err as any;
    console.error('Webhook error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};
