const nodemailer = require('nodemailer');
const {
  sendOtpEmail,
  sendTransactionEmail,
} = require('../../src/helpers/mail.helper');
const { throwCustomError } = require('../../src/helpers/common.helper');
const { faker } = require('@faker-js/faker');

jest.mock('nodemailer');
jest.mock('../../src/helpers/common.helper');

describe('Email Utils', () => {
  const mockSendMail = jest.fn();

  beforeEach(() => {
    nodemailer.createTransport.mockReturnValue({
      sendMail: mockSendMail,
    });
    jest.clearAllMocks();
  });

  describe('sendOtpEmail', () => {
    it('should send an OTP email successfully', async () => {
      const email = faker.internet.email();
      const otp = faker.number.int({ min: 100000, max: 999999 });

      await sendOtpEmail(email, otp);

      expect(nodemailer.createTransport).toHaveBeenCalledWith({
        service: 'gmail',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      });

      expect(mockSendMail).toHaveBeenCalledWith({
        from: process.env.SMTP_USER,
        to: email,
        subject: 'Account Verification Code',
        text: `Your OTP code is ${otp}`,
      });
    });

    it('should throw a custom error if sending OTP email fails', async () => {
      const email = faker.internet.email();
      const otp = faker.number.int({ min: 100000, max: 999999 });

      mockSendMail.mockRejectedValue(new Error('SMTP Error'));

      await expect(sendOtpEmail(email, otp)).rejects.toThrow();
      expect(throwCustomError).toHaveBeenCalledWith(
        'Failed to send OTP email',
        403,
      );
    });
  });

  describe('sendTransactionEmail', () => {
    it('should send a transaction email successfully', async () => {
      const transactionDetails = {
        to: faker.internet.email(),
        subject: faker.lorem.sentence(),
        description: faker.lorem.paragraph(),
        movie_name: faker.lorem.words(2),
        show_time: faker.date.future().toLocaleTimeString(),
        show_date: faker.date.future().toLocaleDateString(),
        booking_date: faker.date.recent().toISOString(),
        total_amount: faker.commerce.price(500, 1000, 2),
        total_gst: faker.commerce.price(50, 200, 2),
        amount_paid: faker.commerce.price(500, 1000, 2),
        booking_status: 'Confirmed',
      };

      await sendTransactionEmail(transactionDetails);

      expect(mockSendMail).toHaveBeenCalledWith({
        from: process.env.SMTP_USER,
        to: transactionDetails.to,
        subject: transactionDetails.subject,
        html: expect.stringContaining(`<h1>${transactionDetails.subject}</h1>`),
      });
    });

    it('should throw an error if sending transaction email fails', async () => {
      const transactionDetails = {
        to: faker.internet.email(),
        subject: faker.lorem.sentence(),
        description: faker.lorem.paragraph(),
        movie_name: faker.lorem.words(2),
        show_time: faker.date.future().toLocaleTimeString(),
        show_date: faker.date.future().toLocaleDateString(),
        booking_date: faker.date.recent().toISOString(),
        total_amount: faker.commerce.price(500, 1000, 2),
        total_gst: faker.commerce.price(50, 200, 2),
        amount_paid: faker.commerce.price(500, 1000, 2),
        booking_status: 'Confirmed',
      };

      mockSendMail.mockRejectedValue(new Error('SMTP Error'));

      await expect(sendTransactionEmail(transactionDetails)).rejects.toThrow();
    });
  });
});
