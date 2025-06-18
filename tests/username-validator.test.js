/**
 * Unit tests for username validation functionality
 */

// Import JSDOM for simulating DOM environment in tests
const { JSDOM } = require('jsdom');

// Create a DOM environment for testing
const dom = new JSDOM(`
<!DOCTYPE html>
<html>
<body>
  <div class="mb-3">
    <label for="username" class="form-label">Username</label>
    <input type="text" class="form-control" id="username" placeholder="Enter your username">
    <div id="username-feedback"></div>
  </div>
</body>
</html>
`);

// Set up global variables to mimic browser environment
global.document = dom.window.document;
global.window = dom.window;

// Extract the validation logic from script.js into a testable function
function validateUsername(username) {
  const usernameRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
  return usernameRegex.test(username);
}

// Mock the DOM manipulation functions for testing
function simulateUsernameChange(username) {
  // Set up the DOM elements
  const inputElement = document.getElementById('username');
  const feedbackElement = document.getElementById('username-feedback');
  
  // Set the input value
  inputElement.value = username;
  
  // Validate the username
  const isValid = validateUsername(username);
  
  // Update the UI based on validation result
  if (isValid) {
    inputElement.classList.remove('is-invalid');
    inputElement.classList.add('is-valid');
    if (feedbackElement) {
      feedbackElement.textContent = 'Username meets all requirements';
      feedbackElement.className = 'valid-feedback d-block';
    }
  } else {
    inputElement.classList.remove('is-valid');
    inputElement.classList.add('is-invalid');
    if (feedbackElement) {
      feedbackElement.textContent = 'Username must contain at least 1 capital letter, 1 number, and be at least 8 characters long.';
      feedbackElement.className = 'invalid-feedback d-block';
    }
  }
  
  return {
    isValid: isValid,
    inputClasses: inputElement.className,
    feedbackText: feedbackElement ? feedbackElement.textContent : null,
    feedbackClass: feedbackElement ? feedbackElement.className : null
  };
}

// Test cases for username validation
describe('Username Validation', () => {
  // Reset the DOM before each test
  beforeEach(() => {
    const input = document.getElementById('username');
    input.value = '';
    input.className = 'form-control';
    
    const feedback = document.getElementById('username-feedback');
    if (feedback) {
      feedback.textContent = '';
      feedback.className = '';
    }
  });
  
  // Test the regex validation function directly
  describe('validateUsername function', () => {
    test('should return false for username with less than 8 characters', () => {
      expect(validateUsername('Pass1')).toBe(false);
    });
    
    test('should return false for username without capital letter', () => {
      expect(validateUsername('username123')).toBe(false);
    });
    
    test('should return false for username without number', () => {
      expect(validateUsername('Username')).toBe(false);
    });
    
    test('should return true for valid username with capital letter, number, and 8+ chars', () => {
      expect(validateUsername('Username123')).toBe(true);
      expect(validateUsername('Complex1Password')).toBe(true);
      expect(validateUsername('A1bcdefgh')).toBe(true);
    });
    
    test('should handle special characters correctly', () => {
      expect(validateUsername('User@123')).toBe(true);
      expect(validateUsername('User_name1')).toBe(true);
    });
  });
  
  // Test the DOM manipulation functionality
  describe('DOM Update on Username Change', () => {
    test('should add is-invalid class for invalid username', () => {
      const result = simulateUsernameChange('invalid');
      expect(result.isValid).toBe(false);
      expect(result.inputClasses).toContain('is-invalid');
      expect(result.inputClasses).not.toContain('is-valid');
    });
    
    test('should add is-valid class for valid username', () => {
      const result = simulateUsernameChange('Valid123');
      expect(result.isValid).toBe(true);
      expect(result.inputClasses).toContain('is-valid');
      expect(result.inputClasses).not.toContain('is-invalid');
    });
    
    test('should update feedback text for invalid username', () => {
      const result = simulateUsernameChange('invalid');
      expect(result.feedbackText).toContain('must contain');
      expect(result.feedbackClass).toContain('invalid-feedback');
    });
    
    test('should update feedback text for valid username', () => {
      const result = simulateUsernameChange('Valid123');
      expect(result.feedbackText).toContain('meets all requirements');
      expect(result.feedbackClass).toContain('valid-feedback');
    });
    
    test('should handle edge cases correctly', () => {
      // Exactly 8 characters with 1 uppercase and 1 number
      const result = simulateUsernameChange('Abcdef1g');
      expect(result.isValid).toBe(true);
      expect(result.inputClasses).toContain('is-valid');
      
      // Only uppercase and numbers, still valid
      const result2 = simulateUsernameChange('ABCD1234');
      expect(result2.isValid).toBe(true);
      expect(result2.inputClasses).toContain('is-valid');
    });
  });
  
  // Test with various real-world username examples
  describe('Real-world username examples', () => {
    test('Common username patterns', () => {
      // Invalid examples
      expect(validateUsername('admin')).toBe(false);
      expect(validateUsername('user123')).toBe(false);
      expect(validateUsername('PASSWORD')).toBe(false);
      expect(validateUsername('12345678')).toBe(false);
      
      // Valid examples
      expect(validateUsername('Admin123')).toBe(true);
      expect(validateUsername('John.Doe1')).toBe(true);
      expect(validateUsername('Developer2023')).toBe(true);
      expect(validateUsername('Test_User1')).toBe(true);
    });
  });
});

// Note: To run these tests, you'll need to install Jest:
// npm install --save-dev jest
// And add to package.json: "scripts": { "test": "jest" }
// Then run: npm test
