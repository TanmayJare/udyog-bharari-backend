
import { Request, Response } from 'express';
import Registration from '../models/Registration';
import Payment from '../models/Payment';
import Ticket from '../models/Ticket';
import User from '../models/User';
import Otp from '../models/Otp';
import { createRazorpayOrder } from '../services/paymentService';
import { generateQRCode } from '../services/qrService';
import { sendConfirmationEmail, sendOtpEmail } from '../services/emailService';
import {
  generateUniqueTicketNumber,
  generateUniqueQRCode,
  generateOTP,
  sendResponse,
  throwError,
} from '../utils/helpers';
import { vendorRegistrationSchema, visitorRegistrationSchema } from '../utils/validators';
import { VENDOR_PASS_PRICE, TICKET_PRICES } from '../config/constants';
import ExcelJS from 'exceljs';
import { protect } from '../middleware/auth';

export const sendOTP = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      throwError(400, 'Email is required');
    }

    // Delete any existing OTP for this email
    await Otp.deleteMany({ email });

    // Generate new OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save OTP to database
    const newOtp = new Otp({ email, otp, expiresAt });
    await newOtp.save();

    // Send OTP email
    await sendOtpEmail(email, otp);

    sendResponse(res, 200, null, 'OTP sent to your email');
  } catch (err) {
    const error = err as any;
    console.error('Error sending OTP:', err);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to send OTP',
    });
  }
};

export const verifyOTP = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      throwError(400, 'Email and OTP are required');
    }

    // Find OTP in database
    const storedOtp = await Otp.findOne({ email, otp });

    if (!storedOtp) {
      throwError(400, 'Invalid or expired OTP');
    }

    // Check if OTP is expired
    if (new Date() > storedOtp.expiresAt) {
      throwError(400, 'OTP has expired');
    }

    // Delete used OTP
    await storedOtp.deleteOne();

    sendResponse(res, 200, null, 'OTP verified successfully');
  } catch (err) {
    const error = err as any;
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to verify OTP',
    });
  }
};

export const createVendorRegistration = async (req: Request, res: Response) => {
  try {
    const { error, value } = vendorRegistrationSchema.validate(req.body);
    if (error) {
      throwError(400, error.details[0].message);
    }

    const {
      firstName,
      lastName,
      email,
      phone,
      companyName,
      stallDescription,
      numPasses,
      specialRequirements,
    } = value;

     const amount = numPasses * VENDOR_PASS_PRICE;



    const registration = new Registration({
      userType: 'vendor',
      firstName,
      lastName,
      email,
      phone,
      companyName,
      stallDescription,
      numPasses,
      specialRequirements,
    });
    await registration.save();

    const razorpayOrder = await createRazorpayOrder(amount);

    const payment = new Payment({
      registrationId: registration._id,
      amount,
      razorpayOrderId: razorpayOrder.id,
      status: 'pending',
    });
    await payment.save();

    registration.paymentId = payment._id;
    await registration.save();

    let user = await User.findOne({ email });
    if (!user) {
      user = new User({
        email,
        name: `${firstName} ${lastName}`,
        phone,
        userType: 'vendor',
        registrations: [registration._id],
      });
    } else {
      user.registrations.push(registration._id);
    }
    await user.save();

    sendResponse(res, 201, {
      registrationId: registration._id,
      amount,
      razorpayOrderId: razorpayOrder.id,
    });
  } catch (err) {
    const error = err as any;
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Internal Server Error',
    });
  }
};

export const createVisitorRegistration = async (req: Request, res: Response) => {
  try {
    const { error, value } = visitorRegistrationSchema.validate(req.body);
    if (error) {
      throwError(400, error.details[0].message);
    }

    const {
      firstName,
      lastName,
      email,
      phone,
      ticketType,
      numTickets,
      dietaryRequirements,
    } = value;
    const ticketPrice = TICKET_PRICES[ticketType as keyof typeof TICKET_PRICES] || 2;
    const amount = numTickets * ticketPrice;

    const registration = new Registration({
      userType: 'visitor',
      firstName,
      lastName,
      email,
      phone,
      ticketType,
      numTickets,
      dietaryRequirements,
    });
    await registration.save();

    const razorpayOrder = await createRazorpayOrder(amount);

    const payment = new Payment({
      registrationId: registration._id,
      amount,
      razorpayOrderId: razorpayOrder.id,
      status: 'pending',
    });
    await payment.save();

    registration.paymentId = payment._id;
    await registration.save();

    let user = await User.findOne({ email });
    if (!user) {
      user = new User({
        email,
        name: `${firstName} ${lastName}`,
        phone,
        userType: 'visitor',
        registrations: [registration._id],
      });
    } else {
      user.registrations.push(registration._id);
    }
    await user.save();

    sendResponse(res, 201, {
      registrationId: registration._id,
      amount,
      razorpayOrderId: razorpayOrder.id,
    });
  } catch (err) {
    const error = err as any;
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Internal Server Error',
    });
  }
};

export const createTicketsForRegistration = async (
  registrationId: string,
  ticketCount: number,
  ticketType: string,
  name: string,
  email: string,
  phone: string
) => {
  const tickets = [];
  for (let i = 0; i < ticketCount; i++) {
    const ticketNumber = generateUniqueTicketNumber();
    const qrCode = generateUniqueQRCode();
    const qrCodeImage = await generateQRCode(qrCode);

    const ticket = new Ticket({
      registrationId,
      ticketNumber,
      qrCode,
      qrCodeImage,
      name,
      email,
      phone,
      ticketType,
    });
    await ticket.save();
    tickets.push(ticket);
  }
  return tickets;
};

export const exportRegistrationsToExcel = async (req: Request, res: Response) => {
  try {
    // Get all registrations with payment and user details
    const registrations = await Registration.find()
      .populate('paymentId')
      .sort({ createdAt: -1 });

    // Create a new Excel workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Registrations');

    // Set up columns
    worksheet.columns = [
      { header: 'Registration ID', key: '_id', width: 30 },
      { header: 'User Type', key: 'userType', width: 15 },
      { header: 'First Name', key: 'firstName', width: 15 },
      { header: 'Last Name', key: 'lastName', width: 15 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Phone', key: 'phone', width: 15 },
      { header: 'Company/Stall Name', key: 'companyName', width: 25 },
      { header: 'Ticket Type', key: 'ticketType', width: 15 },
      { header: 'Number of Passes/Tickets', key: 'numPasses', width: 20 },
      { header: 'Payment Status', key: 'paymentStatus', width: 15 },
      { header: 'Total Amount', key: 'amount', width: 15 },
      { header: 'Razorpay Order ID', key: 'razorpayOrderId', width: 30 },
      { header: 'Registered At', key: 'createdAt', width: 25 },
    ];

    // Add rows
    registrations.forEach((reg: any) => {
      const payment = reg.paymentId || {};
      worksheet.addRow({
        _id: reg._id,
        userType: reg.userType,
        firstName: reg.firstName,
        lastName: reg.lastName,
        email: reg.email,
        phone: reg.phone,
        companyName: reg.companyName || 'N/A',
        ticketType: reg.ticketType || 'N/A',
        numPasses: reg.numPasses || reg.numTickets || 0,
        paymentStatus: payment.status || 'pending',
        amount: payment.amount || 0,
        razorpayOrderId: payment.razorpayOrderId || 'N/A',
        createdAt: new Date(reg.createdAt).toLocaleString(),
      });
    });

    // Set response headers for file download
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=udyog_bharari_registrations_${new Date().toISOString().split('T')[0]}.xlsx`
    );

    // Write the workbook to response
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error('Error exporting to Excel:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to export registrations to Excel',
    });
  }
};

export const getRegistrations = async (req: Request, res: Response) => {
  try {
    const registrations = await Registration.find().sort({ createdAt: -1 });
    sendResponse(res, 200, { registrations });
  } catch (err) {
    console.error('Error fetching registrations:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch registrations',
    });
  }
};
