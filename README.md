# Kütüphane Yönetim Sistemi (Library Management System)

A comprehensive library management system built with TypeScript, Express.js, MongoDB, and modern web technologies.

## 🚀 Features

### User Management
- User registration and authentication with **Zod validation**
- JWT-based authorization
- User profile management
- User CRUD operations
- Soft delete functionality

### Library Management
- Multiple library support
- Library CRUD operations with **input validation**
- Library statistics and analytics
- Soft delete functionality

### Book Management
- Book CRUD operations in libraries
- Book search and filtering with **validated queries**
- Book categorization
- ISBN validation with **regex patterns**
- Copy management (total vs available)

### Borrowing System
- Book borrowing and returning
- Due date management
- Fine calculation
- Borrowing history tracking
- Maximum book limit per user

### Review System
- Book rating and review system
- **Validated review inputs** (rating 1-5, required comments)
- Review CRUD operations
- Book statistics based on reviews

### Advanced Features
- **🔒 Zod Input Validation**: All API endpoints protected with comprehensive validation
- **ULID** for unique identifiers
- **MongoDB** with Mongoose ODM
- **Comprehensive error handling** with standardized response format
- **Type-safe validation** with detailed error messages
- Pagination support
- Search functionality
- API documentation ready

## 🛠️ Technology Stack

- **Backend**: Node.js, Express.js, TypeScript
- **Database**: MongoDB with Mongoose
- **Validation**: **Zod** for type-safe input validation
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: Helmet, CORS, bcrypt
- **Testing**: Mocha, Sinon.js, Chai
- **Code Quality**: ESLint, Prettier
- **ID Generation**: ULID

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- Node.js (v16 or higher)
- MongoDB (v5.0 or higher)
- npm or yarn package manager

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd kutuphane-yonetim-sistemi
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   
   Copy the `.env` file and configure your environment variables:
   ```bash
   cp .env .env.local
   ```

   Update the following variables in `.env`:
   ```
   NODE_ENV=development
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/kutuphane_yonetim
   JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
   JWT_EXPIRES_IN=7d
   MAX_BOOKS_PER_USER=5
   ```

4. **Start MongoDB**
   
   Make sure MongoDB is running on your system:
   ```bash
   # Windows
   net start MongoDB
   
   # macOS/Linux
   sudo systemctl start mongod
   ```

## 🚀 Usage

### Development Mode
```bash
npm run dev
```
This starts the server with hot-reload using ts-node.

### Production Build
```bash
npm run build
npm start
```

### Running Tests
```bash
npm test
```

### Code Formatting and Linting
```bash
npm run lint
npm run format
```

## 📚 API Endpoints

### Authentication
- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Login user

### User Management
- `GET /api/users/profile` - Get current user profile
- `GET /api/users` - Get all users (paginated)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (soft delete)

### Library Management
- `POST /api/libraries` - Create a new library
- `GET /api/libraries` - Get all libraries (paginated)
- `GET /api/libraries/:id` - Get library by ID
- `PUT /api/libraries/:id` - Update library
- `DELETE /api/libraries/:id` - Delete library (soft delete)
- `GET /api/libraries/:id/stats` - Get library statistics

### Book Management
- `POST /api/books` - Add a new book to library
- `GET /api/books` - Get all books (paginated, filterable)
- `GET /api/books/search` - Search books
- `GET /api/books/:id` - Get book by ID
- `PUT /api/books/:id` - Update book
- `DELETE /api/books/:id` - Delete book (soft delete)
- `POST /api/books/:id/borrow` - Borrow a book
- `POST /api/books/:id/return` - Return a book

### Health Check
- `GET /health` - API health status
- `GET /` - API information

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. After logging in, include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## ✅ Input Validation

This system uses **Zod** for comprehensive input validation on all API endpoints.

### Validation Features
- **Type-safe validation** with TypeScript integration
- **Detailed error messages** in Turkish
- **Field-level validation** with specific rules
- **Consistent error format** across all endpoints

### Example Validation Error Response
```json
{
  "success": false,
  "message": "Doğrulama hatası",
  "errors": [
    {
      "field": "username",
      "message": "Kullanıcı adı en az 3 karakter olmalıdır",
      "code": "too_small"
    },
    {
      "field": "email",
      "message": "Geçerli bir email adresi giriniz",
      "code": "invalid_string"
    }
  ]
}
```

### Validation Rules

#### User Registration
- **username**: 3-30 characters, alphanumeric + underscore only
- **email**: Valid email format
- **password**: 6-100 characters
- **firstName/lastName**: 2-50 characters
- **maxBooks**: 1-50 integer (optional)

#### Book Creation
- **title**: 1-200 characters
- **author**: 1-100 characters
- **isbn**: Valid ISBN format (optional)
- **publisher**: 1-100 characters
- **publishedYear**: 1000 to current year
- **totalCopies**: 1-1000 integer

#### Review Creation
- **rating**: 1-5 integer
- **comment**: 1-1000 characters
- **bookId**: Required string

### Testing Validation
```bash
# Run validation tests
npx ts-node src/tests/validation.test.ts
```

## 📖 Database Schema

### User Model
- `_id`: ULID
- `username`: Unique username
- `email`: Unique email address
- `password`: Hashed password
- `firstName`: User's first name
- `lastName`: User's last name
- `maxBooks`: Maximum books user can borrow
- `borrowedBooks`: Array of borrowed book IDs
- `isActive`: Soft delete flag

### Library Model
- `_id`: ULID
- `name`: Library name
- `description`: Optional description
- `address`: Library address
- `phone`: Contact phone
- `email`: Contact email
- `books`: Array of book IDs
- `isActive`: Soft delete flag

### Book Model
- `_id`: ULID
- `title`: Book title
- `author`: Book author
- `isbn`: ISBN (optional, unique)
- `publisher`: Publisher name
- `publishedYear`: Publication year
- `category`: Book category
- `description`: Book description
- `totalCopies`: Total number of copies
- `availableCopies`: Available copies
- `libraryId`: Reference to library
- `borrowedBy`: Array of user IDs who borrowed
- `isActive`: Soft delete flag

### BorrowRecord Model
- `_id`: ULID
- `userId`: Reference to user
- `bookId`: Reference to book
- `libraryId`: Reference to library
- `borrowDate`: Date when borrowed
- `dueDate`: Due date for return
- `returnDate`: Actual return date
- `isReturned`: Return status
- `fine`: Fine amount (if any)
- `notes`: Additional notes

## 🧪 Testing

The project uses Mocha with Sinon.js for testing. Test files are located in the `src/tests` directory.

```bash
# Run all tests
npm test

# Run specific test file
npx mocha --require ts-node/register src/tests/UserController.test.ts
```

## 🔧 Development

### Project Structure
```
src/
├── config/         # Configuration files
├── controllers/    # Route controllers
├── middleware/     # Custom middleware
├── models/         # MongoDB models
├── routes/         # API routes
├── tests/          # Test files
└── index.ts        # Application entry point
```

### Code Quality
- ESLint for code linting
- Prettier for code formatting
- TypeScript for type safety
- Strict TypeScript configuration

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check connection string in `.env`
   - Verify network connectivity

2. **JWT Token Issues**
   - Check JWT_SECRET in environment variables
   - Verify token format in Authorization header
   - Check token expiration

3. **Port Already in Use**
   - Change PORT in `.env` file
   - Kill process using the port: `lsof -ti:3000 | xargs kill -9`

## 📞 Support

For support and questions, please create an issue in the repository or contact the development team.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 🚀 Deployment

### Production Checklist
- [ ] Set `NODE_ENV=production`
- [ ] Configure production MongoDB URI
- [ ] Set strong JWT secret
- [ ] Configure CORS for production domains
- [ ] Enable MongoDB authentication
- [ ] Set up monitoring and logging
- [ ] Configure reverse proxy (nginx)
- [ ] Set up SSL certificates
