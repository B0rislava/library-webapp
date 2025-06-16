# Use Cases for Library Management System

## 1. User Management

### 1.1 User Registration

**Actor:** New User
**Description:** A new user wants to create an account in the system
**Preconditions:** User is not registered in the system
**Main Flow:**

1. User navigates to registration page
2. User fills in required information:
   - Full Name
   - Email
   - Password (minimum 8 characters)
   - Role (User or Librarian)
3. System validates the input
4. System creates new user account
   **Postconditions:** New user account is created

### 1.2 User Login

**Actor:** Registered User
**Description:** User wants to access their account
**Preconditions:** User has a valid account
**Main Flow:**

1. User navigates to login page
2. User enters email and password
3. System validates credentials
4. System grants access with JWT tokens
   **Postconditions:** User is logged into the system

### 1.3 User Profile Management

**Actor:** Registered User
**Description:** User wants to update their profile information
**Preconditions:** User is logged in
**Main Flow:**

1. User navigates to profile page
2. User can view their current information
3. User can update:
   - Name
   - Email
   - Password
4. System validates and saves changes
   **Postconditions:** User profile is updated

## 2. Book Management

### 2.1 Book Search

**Actor:** Any User
**Description:** User wants to find a specific book
**Preconditions:** User is on the system
**Main Flow:**

1. User enters search criteria (title or author)
2. System searches the database
3. System displays matching results
   **Postconditions:** User can view search results

### 2.2 Book Management (Librarian)

**Actor:** Librarian
**Description:** Librarian wants to manage the book collection
**Preconditions:**

- Librarian is logged in
- Librarian has appropriate permissions
  **Main Flow:**

1. Librarian can add new books with:
   - Title
   - Author
   - Year
   - Description
   - Cover URL (optional)
   - PDF URL (optional)
2. Librarian can edit existing books
3. Librarian can delete books
   **Postconditions:** Book collection is updated

### 2.3 Personal Library Management

**Actor:** Registered User
**Description:** User wants to manage their personal book collection
**Preconditions:** User is logged in
**Main Flow:**

1. User can add books to their library
2. User can track reading progress:
   - Set total pages
   - Update current page
   - View reading status (Not started/Started/Finished)
   - View progress percentage
3. User can remove books from their library
   **Postconditions:** User's personal library is updated

## 3. User Roles and Permissions

### 3.1 Regular User

**Actor:** Regular User
**Description:** Regular user interactions with the system
**Capabilities:**

- Search books
- Add books to personal library
- Track reading progress
- Manage personal profile
- View personal book collection

### 3.2 Librarian

**Actor:** Librarian
**Description:** Librarian interactions with the system
**Capabilities:**

- All regular user capabilities
- Add new books
- Edit existing books
- Delete books
- View all users
- Manage book collection

## 4. System Features

### 4.1 Authentication and Security

- JWT-based authentication
- Password hashing
- Role-based access control
- Protected routes
- Session management

### 4.2 User Interface

- Responsive design
- Modern UI with Material-UI
- Intuitive navigation
- Search functionality
- Progress tracking visualization

### 4.3 Data Management

- SQLite database (development)
- Planned migration to PostgreSQL
- Data validation
- Error handling
- State management with React Context
