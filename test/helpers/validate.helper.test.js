const {
  validateEmail,
  validatePassword,
  validateOtp,
  validatePhone,
  validateString,
  validateArray,
  validateRequest,
} = require('../../src/helpers/validate.helper'); // Adjust the path as necessary
const { throwCustomError } = require('../../src/helpers/common.helper');
const { faker } = require('@faker-js/faker');

jest.mock('../../src/helpers/validate.helper', () => ({
  throwCustomError: jest.fn(message => {
    throw new Error(message);
  }),
}));

describe('Validation Helper', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateEmail', () => {
    it('should validate a correct email address', () => {
      const email = faker.internet.email();
      expect(() => validateEmail(email)).not.toThrow();
    });

    it('should throw an error for an invalid email', () => {
      expect(() => validateEmail('invalid-email')).toThrow(
        'Invalid email format',
      );
      expect(throwCustomError).toHaveBeenCalledWith(
        'Invalid email format',
        400,
      );
    });
  });

  describe('validatePassword', () => {
    it('should validate a strong password', () => {
      const password = 'Strong@123';
      expect(() => validatePassword(password)).not.toThrow();
    });

    it('should throw an error for a weak password', () => {
      expect(() => validatePassword('weak')).toThrow(
        'Password must be at least 8 characters long, include one uppercase letter, one lowercase letter, one number, and one special character',
      );
      expect(throwCustomError).toHaveBeenCalled();
    });
  });

  describe('validateOtp', () => {
    it('should validate a correct OTP', () => {
      const otp = Array.from({ length: 6 }, () =>
        Math.floor(Math.random() * 10),
      ).join('');
      expect(() => validateOtp(otp)).not.toThrow();
    });

    it('should throw an error for an invalid OTP', () => {
      expect(() => validateOtp('12345')).toThrow('Invalid OTP format');
      expect(throwCustomError).toHaveBeenCalledWith('Invalid OTP format', 400);
    });
  });

  describe('validatePhone', () => {
    it('should validate a correct phone number', () => {
      const phone = faker.phone.number('##########');
      expect(() => validatePhone(phone)).not.toThrow();
    });

    it('should throw an error for an invalid phone number', () => {
      expect(() => validatePhone('123')).toThrow('Invalid phone format');
      expect(throwCustomError).toHaveBeenCalledWith(
        'Invalid phone format',
        400,
      );
    });
  });

  describe('validateString', () => {
    it('should validate a non-empty string', () => {
      const string = faker.lorem.word();
      expect(() => validateString(string)).not.toThrow();
    });

    it('should throw an error for an empty string', () => {
      expect(() => validateString('')).toThrow(
        'This field must be a valid string',
      );
      expect(throwCustomError).toHaveBeenCalledWith(
        'This field must be a valid string',
        400,
      );
    });
  });

  describe('validateArray', () => {
    it('should validate a non-empty array', () => {
      const array = [faker.lorem.word()];
      expect(() => validateArray(array)).not.toThrow();
    });

    it('should throw an error for an empty array', () => {
      expect(() => validateArray([])).toThrow(
        'Roles must be a non-empty array',
      );
      expect(throwCustomError).toHaveBeenCalledWith(
        'Roles must be a non-empty array',
        400,
      );
    });
  });

  describe('validateRequest', () => {
    const data = {
      email: faker.internet.email(),
      password: 'Strong@123',
      otp: Array.from({ length: 6 }, () => Math.floor(Math.random() * 10)).join(
        '',
      ),
      phone: faker.phone.number('##########'),
      roles: [faker.lorem.word()],
      name: faker.lorem.word(),
    };

    const rules = {
      email: 'email',
      password: 'password',
      otp: 'otp',
      phone: 'phone',
      roles: 'array',
      name: 'string',
    };

    it('should validate all fields correctly', () => {
      expect(() => validateRequest(data, rules)).not.toThrow();
    });

    it('should throw an error for an invalid field', () => {
      const invalidData = { ...data, email: 'invalid-email' };

      expect(() => validateRequest(invalidData, rules)).toThrow(
        'Invalid email format',
      );
      expect(throwCustomError).toHaveBeenCalledWith(
        'Invalid email format',
        400,
      );
    });

    it('should throw an error for unknown validation rule', () => {
      const invalidRules = { ...rules, unknownField: 'unknown' };

      expect(() => validateRequest(data, invalidRules)).toThrow(
        'Unknown validation rule for unknownField',
      );
      expect(throwCustomError).toHaveBeenCalledWith(
        'Unknown validation rule for unknownField',
        400,
      );
    });
  });
});
