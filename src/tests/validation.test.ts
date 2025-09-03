/**
 * Zod Validation Test Dosyası
 * Input doğrulama şemalarının test edilmesi için
 */

import { 
  UserRegisterSchema,
  UserLoginSchema,
  BookCreateSchema,
  ReviewCreateSchema 
} from '../schemas/validationSchemas';

// Test User Registration Data
console.log('=== USER REGISTRATION VALIDATION TESTS ===');

// Valid user registration data
const validUserData = {
  username: 'johndoe',
  email: 'john@example.com',
  password: 'password123',
  firstName: 'John',
  lastName: 'Doe',
  maxBooks: 5
};

try {
  const result = UserRegisterSchema.safeParse(validUserData);
  console.log('✅ Valid User Data:', result.success);
  if (!result.success) {
    console.log('❌ Errors:', result.error.issues);
  }
} catch (error) {
  console.log('❌ Error:', error);
}

// Invalid user registration data - short password
const invalidUserData = {
  username: 'jo',
  email: 'invalid-email',
  password: '123',
  firstName: '',
  lastName: 'Doe'
};

try {
  const result = UserRegisterSchema.safeParse(invalidUserData);
  console.log('❌ Invalid User Data Valid:', result.success);
  if (!result.success) {
    console.log('📝 Expected Errors:');
    result.error.issues.forEach(err => {
      console.log(`  - ${err.path.join('.')}: ${err.message}`);
    });
  }
} catch (error) {
  console.log('❌ Error:', error);
}

console.log('\n=== USER LOGIN VALIDATION TESTS ===');

// Valid login data
const validLoginData = {
  username: 'johndoe',
  password: 'password123'
};

try {
  const result = UserLoginSchema.safeParse(validLoginData);
  console.log('✅ Valid Login Data:', result.success);
} catch (error) {
  console.log('❌ Error:', error);
}

// Invalid login data
const invalidLoginData = {
  username: '',
  password: ''
};

try {
  const result = UserLoginSchema.safeParse(invalidLoginData);
  console.log('❌ Invalid Login Data Valid:', result.success);
  if (!result.success) {
    console.log('📝 Expected Errors:');
    result.error.issues.forEach(err => {
      console.log(`  - ${err.path.join('.')}: ${err.message}`);
    });
  }
} catch (error) {
  console.log('❌ Error:', error);
}

console.log('\n=== BOOK CREATE VALIDATION TESTS ===');

// Valid book data
const validBookData = {
  title: 'The Great Gatsby',
  author: 'F. Scott Fitzgerald',
  isbn: '978-0-7432-7356-5',
  publisher: 'Scribner',
  publishedYear: 1925,
  category: 'Fiction',
  description: 'A classic American novel',
  totalCopies: 5,
  libraryId: 'lib-123'
};

try {
  const result = BookCreateSchema.safeParse(validBookData);
  console.log('✅ Valid Book Data:', result.success);
} catch (error) {
  console.log('❌ Error:', error);
}

// Invalid book data
const invalidBookData = {
  title: '',
  author: '',
  publishedYear: 2030, // Future year
  totalCopies: 0, // Should be at least 1
  libraryId: ''
};

try {
  const result = BookCreateSchema.safeParse(invalidBookData);
  console.log('❌ Invalid Book Data Valid:', result.success);
  if (!result.success) {
    console.log('📝 Expected Errors:');
    result.error.issues.forEach(err => {
      console.log(`  - ${err.path.join('.')}: ${err.message}`);
    });
  }
} catch (error) {
  console.log('❌ Error:', error);
}

console.log('\n=== REVIEW CREATE VALIDATION TESTS ===');

// Valid review data
const validReviewData = {
  bookId: 'book-123',
  rating: 5,
  comment: 'Great book! Highly recommended.'
};

try {
  const result = ReviewCreateSchema.safeParse(validReviewData);
  console.log('✅ Valid Review Data:', result.success);
} catch (error) {
  console.log('❌ Error:', error);
}

// Invalid review data
const invalidReviewData = {
  bookId: '',
  rating: 6, // Should be max 5
  comment: ''
};

try {
  const result = ReviewCreateSchema.safeParse(invalidReviewData);
  console.log('❌ Invalid Review Data Valid:', result.success);
  if (!result.success) {
    console.log('📝 Expected Errors:');
    result.error.issues.forEach(err => {
      console.log(`  - ${err.path.join('.')}: ${err.message}`);
    });
  }
} catch (error) {
  console.log('❌ Error:', error);
}

console.log('\n🎉 Validation tests completed!');
