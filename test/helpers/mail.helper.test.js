const nodemailer = require('nodemailer');
const {
  sendOtpEmail,
  sendTransactionEmail,
} = require('../../src/helpers/mail.helper'); // Adjust path as needed
const { throwCustomError } = require('../../src/helpers/common.helper');
const { faker } = require('@faker-js/faker');

jest.mock('nodemailer');
jest.mock('../../src/helpers/common.helper', () => ({
  throwCustomError: jest.fn(),
}));

describe('Email Service', () => {
  const sendMailMock = jest.fn();
  const transporterMock = {
    sendMail: sendMailMock,
  };

  beforeEach(() => {
    sendMailMock.mockClear();
    nodemailer.createTransport.mockReturnValue(transporterMock);
  });

  describe('sendOtpEmail', () => {
    it('should send an OTP email successfully', async () => {
      const email = faker.internet.email();
      const otp = '123456';

      sendMailMock.mockResolvedValueOnce({});

      await expect(sendOtpEmail(email, otp)).resolves.not.toThrow();
      expect(sendMailMock).toHaveBeenCalledWith({
        from: process.env.SMTP_USER,
        to: email,
        subject: 'Account Verification Code',
        text: `Your OTP code is ${otp}`,
      });
    });

    it('should throw an error if email fails to send', async () => {
      const email = faker.internet.email();
      const otp = '987654';

      const error = new Error('SMTP Error');
      sendMailMock.mockRejectedValueOnce(error);

      await expect(sendOtpEmail(email, otp)).rejects.toThrow(
        'Failed to send OTP email',
      );
      expect(throwCustomError).toHaveBeenCalledWith(
        'Failed to send OTP email',
        403,
      );
    });
  });

  describe('sendTransactionEmail', () => {
    it('should send a transaction email successfully', async () => {
      const emailData = {
        to: faker.internet.email(),
        subject: 'Booking Confirmation',
        description: faker.lorem.sentence(),
        movie_name: faker.word.words(2),
        show_time: faker.date.future().toLocaleTimeString(),
        show_date: faker.date.future().toLocaleDateString(),
        booking_date: faker.date.recent().toISOString(),
        total_amount: faker.finance.amount(100, 1000, 2),
        total_gst: faker.finance.amount(10, 100, 2),
        amount_paid: faker.finance.amount(50, 500, 2),
        booking_status: 'Confirmed',
      };

      sendMailMock.mockResolvedValueOnce({});

      await expect(sendTransactionEmail(emailData)).resolves.not.toThrow();
      expect(sendMailMock).toHaveBeenCalledWith({
        from: process.env.SMTP_USER,
        to: emailData.to,
        subject: emailData.subject,
        html: expect.stringContaining(`<h1>${emailData.subject}</h1>`),
      });
    });

    it('should throw an error if email fails to send', async () => {
      const emailData = {
        to: faker.internet.email(),
        subject: 'Booking Confirmation',
        description: faker.lorem.sentence(),
        movie_name: faker.word.words(2),
        show_time: faker.date.future().toLocaleTimeString(),
        show_date: faker.date.future().toLocaleDateString(),
        booking_date: faker.date.recent().toISOString(),
        total_amount: faker.finance.amount(100, 1000, 2),
        total_gst: faker.finance.amount(10, 100, 2),
        amount_paid: faker.finance.amount(50, 500, 2),
        booking_status: 'Confirmed',
      };

      const error = new Error('SMTP Error');
      sendMailMock.mockRejectedValueOnce(error);

      await expect(sendTransactionEmail(emailData)).rejects.toThrow();
    });
  });
});
