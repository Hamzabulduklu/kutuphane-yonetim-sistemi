# API Usage Examples

This file contains examples of how to use the Library Management System API.

## Authentication

### Register a New User
```bash
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "email": "john@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe",
    "maxBooks": 5
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "password": "password123"
  }'
```

Save the token from the response for subsequent API calls.

## Library Management

### Create a Library
```bash
curl -X POST http://localhost:3000/api/libraries \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Central Library",
    "description": "Main city library",
    "address": "123 Main Street, City, Country",
    "phone": "+1234567890",
    "email": "central@library.com"
  }'
```

### Get All Libraries
```bash
curl -X GET "http://localhost:3000/api/libraries?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Book Management

### Add a Book to Library
```bash
curl -X POST http://localhost:3000/api/books \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "The Great Gatsby",
    "author": "F. Scott Fitzgerald",
    "isbn": "9780743273565",
    "publisher": "Scribner",
    "publishedYear": 1925,
    "category": "Fiction",
    "description": "A classic American novel",
    "totalCopies": 5,
    "libraryId": "LIBRARY_ULID_HERE"
  }'
```

### Search Books
```bash
curl -X GET "http://localhost:3000/api/books/search?query=gatsby&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get Books with Filters
```bash
curl -X GET "http://localhost:3000/api/books?category=Fiction&available=true&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Borrowing Operations

### Borrow a Book
```bash
curl -X POST http://localhost:3000/api/books/BOOK_ULID_HERE/borrow \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "dueDate": "2024-01-15"
  }'
```

### Return a Book
```bash
curl -X POST http://localhost:3000/api/books/BOOK_ULID_HERE/return \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "notes": "Book returned in good condition",
    "manualFine": 5.0
  }'
```

## Fine Management

### Calculate Overdue Fines (Admin)
```bash
curl -X POST http://localhost:3000/api/fines/calculate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get My Fines
```bash
curl -X GET "http://localhost:3000/api/fines/my?status=pending&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Pay a Fine
```bash
curl -X POST http://localhost:3000/api/fines/FINE_ID_HERE/pay \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "paymentMethod": "card",
    "paymentReference": "TXN123456",
    "notes": "Paid via credit card"
  }'
```

### Get Fine Statistics (Admin)
```bash
curl -X GET "http://localhost:3000/api/fines/statistics?libraryId=LIB_ID&startDate=2024-01-01&endDate=2024-12-31" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Cancel a Fine (Admin)
```bash
curl -X POST http://localhost:3000/api/fines/FINE_ID_HERE/cancel \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "reason": "Administrative error - book was returned on time"
  }'
```

### Get Fine Settings
```bash
curl -X GET http://localhost:3000/api/fines/settings \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Book Reviews and Ratings

### Add a Book Review
```bash
curl -X POST http://localhost:3000/api/reviews/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "bookId": "BOOK_ULID_HERE",
    "rating": 5,
    "title": "Harika bir kitap!",
    "comment": "Bu kitabı okuduğum için çok memnunum. Herkese tavsiye ederim.",
    "pros": ["Akıcı anlatım", "İlginç konular", "Güzel örnekler"],
    "cons": ["Biraz uzun"],
    "recommendedAge": "18+",
    "tags": ["yazılım", "öğretici", "faydalı"],
    "spoilerWarning": false
  }'
```

### Get Book Reviews
```bash
curl -X GET "http://localhost:3000/api/reviews/book/BOOK_ULID_HERE?page=1&limit=10&sortBy=helpfulVotes&sortOrder=desc" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get My Reviews
```bash
curl -X GET "http://localhost:3000/api/reviews/my?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Update a Review
```bash
curl -X PUT http://localhost:3000/api/reviews/REVIEW_ID_HERE \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "rating": 4,
    "title": "Güncellendi: İyi bir kitap",
    "comment": "İkinci okuyuşumda daha çok beğendim.",
    "spoilerWarning": true
  }'
```

### Mark Review as Helpful
```bash
curl -X POST http://localhost:3000/api/reviews/REVIEW_ID_HERE/helpful \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Delete a Review
```bash
curl -X DELETE http://localhost:3000/api/reviews/REVIEW_ID_HERE \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get Top Rated Books
```bash
curl -X GET "http://localhost:3000/api/reviews/top-rated?limit=10&minReviews=3" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get Most Reviewed Books
```bash
curl -X GET "http://localhost:3000/api/reviews/most-reviewed?limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## User Management

### Get User Profile
```bash
curl -X GET http://localhost:3000/api/users/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get All Users (Admin)
```bash
curl -X GET "http://localhost:3000/api/users?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Update User
```bash
curl -X PUT http://localhost:3000/api/users/USER_ULID_HERE \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "firstName": "John Updated",
    "maxBooks": 10
  }'
```

## Library Statistics

### Get Library Statistics
```bash
curl -X GET http://localhost:3000/api/libraries/LIBRARY_ULID_HERE/stats \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Response Examples

### Successful Registration Response
```json
{
  "message": "User registered successfully",
  "user": {
    "_id": "01HN123ABC456789DEF012345",
    "username": "johndoe",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "maxBooks": 5,
    "borrowedBooks": [],
    "isActive": true,
    "createdAt": "2024-01-01T12:00:00.000Z",
    "updatedAt": "2024-01-01T12:00:00.000Z"
  }
}
```

### Login Response
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "01HN123ABC456789DEF012345",
    "username": "johndoe",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "maxBooks": 5,
    "borrowedBooks": [],
    "isActive": true
  }
}
```

### Library Statistics Response
```json
{
  "library": {
    "name": "Central Library",
    "id": "01HN456DEF789ABC012345678"
  },
  "statistics": {
    "totalBooks": 150,
    "availableBooks": 125,
    "borrowedBooks": 25,
    "categories": [
      { "_id": "Fiction", "count": 50 },
      { "_id": "Science", "count": 30 },
      { "_id": "History", "count": 25 }
    ]
  }
}
```

## Error Responses

### Validation Error
```json
{
  "errors": [
    {
      "msg": "Username is required",
      "param": "username",
      "location": "body"
    }
  ]
}
```

### Authentication Error
```json
{
  "message": "Access token required"
}
```

### Not Found Error
```json
{
  "message": "Book not found"
}
```
