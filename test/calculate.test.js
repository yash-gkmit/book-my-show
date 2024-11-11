const add = require('./helpers/calculate');

describe('add', () => {
  it('should return the sum of two numbers', () => {
    expect(add(2, 7)).toBe(9);
  });

  it('should return a negative number when adding two negative numbers', () => {
    expect(add(-6, -2)).toBe(-8);
  });

it('should fail to check test', () => {
    expect(add(2, 3)).toBe(6); 
  });
});
