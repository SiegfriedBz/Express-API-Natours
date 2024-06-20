# API_TS_ZOD

This is a Node.js Express API written in TypeScript, designed to manage user authentication, tour bookings, and reviews. The API uses MongoDB for data persistence and various modern technologies to enhance security and efficiency.

## Table of Contents

- [Getting Started](#getting-started)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Seeding the Database](#seeding-the-database)
- [Running Tests](#running-tests)
- [Running the API](#running-the-api)
- [API Routes](#api-routes)
  - [Public Routes](#public-routes)
  - [Protected Routes](#protected-routes)
- [Technologies Used](#technologies-used)
- [License](#license)

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Ensure you have the following installed:

- Node.js

## Installation

Clone the repository and install the dependencies:

```bash
git clone https://github.com/your-repo/api_ts_zod.git
cd api_ts_zod
npm install
```

## Environment Variables

Create a .env file in the root directory and add the following environment variables:

# SERVER

PORT=1337
SERVER_DOMAIN_NAME=localhost

# CLIENT

CORS_ALLOWED_ORIGINS=http://localhost:3000

# MONGO

MONGO_DB_URL=your_mongo_db_url

# STRIPE

STRIPE_PRIVATE_KEY=your_stripe_private_key
STRIPE_PUBLIC_KEY=your_stripe_public_key
STRIPE_WEBHOOK_ENDPOINT_SECRET=your_stripe_webhook_endpoint_secret

# EMAIL

EMAIL_FROM=your_email@example.com

# EMAIL - DEV

MAILTRAP_EMAIL_HOST=your_mailtrap_host
MAILTRAP_EMAIL_PORT=your_mailtrap_port
MAILTRAP_EMAIL_USERNAME=your_mailtrap_username
MAILTRAP_EMAIL_PASSWORD=your_mailtrap_password

# EMAIL - PROD

BREVO_EMAIL_ADMIN=your_brevo_admin_email
BREVO_EMAIL_SMTP_KEY=your_brevo_smtp_key

# CLOUDINARY

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# PASSWORD_RESET TOKEN

PASSWORD_RESET_TOKEN_EXPIRES_IN=600000

# JWTs TOKENS

ACCESS_TOKEN_PRIVATE_KEY=your_access_token_private_key
ACCESS_TOKEN_PUBLIC_KEY=your_access_token_public_key
REFRESH_TOKEN_PRIVATE_KEY=your_refresh_token_private_key
REFRESH_TOKEN_PUBLIC_KEY=your_refresh_token_public_key

## Seeding the Database

To seed the database, use the following commands:

In development mode:

```bash
npm run seed:dev
```

In production mode:

```bash
npm run seed:production
```

## Running Tests

The tests written with Jest and Supertest can be run with:

```bash
npm run test
```

## Running the API

To start the development server, use the following command:

```bash
npm run dev
```

To build and start the production server, use the following commands:

```bash
npm run build
npm start
```

## API Routes

### Public Routes

#### Healthcheck Route

- **GET /api/v1/healthcheck**: Check the health of the API.

#### Tours Routes

- **GET /api/v1/tours**: Fetch all tours.
- **GET /api/v1/tours/top-5-cheap**: Fetch top 5 cheap tours.
- **GET /api/v1/tours/:tourId**: Fetch tour data based on tour ID.
- **GET /api/v1/tours/stats**: Fetch statistics about tours.
- **GET /api/v1/tours/within/:distance/center/:latlng/unit/:unit**: Fetch tours within a given distance from a point.
- **GET /api/v1/tours/distances-from/:latlng/unit/:unit**: Fetch distances to tours from a point.
- **GET /api/v1/tours/:id/reviews**: Get all reviews for a given tour.

#### Users Routes

- **POST /api/v1/users/signup**: Create a new user account.

#### Sessions Routes

- **POST /api/v1/sessions/login**: Login a user.
- **DELETE /api/v1/sessions/logout**: Logout a user.

#### Reviews Routes

- **GET /api/v1/reviews**: Get all reviews for all tours.
- **GET /api/v1/reviews/:reviewId**: Get a review by review ID.
- **GET /api/v1/tours/:id/reviews**: Get all reviews for a given tour.

### Protected Routes

#### User Routes

- **GET /api/v1/users/me**: Fetch the logged-in user's profile.
- **POST /api/v1/users/forgot-my-password**: Step 1 in the forgot/reset password process.
- **POST /api/v1/users/reset-my-password**: Step 2 in the forgot/reset password process.
- **PATCH /api/v1/users/update-me**: Update the logged-in user's profile (except password).
- **PATCH /api/v1/users/update-my-password**: Update the logged-in user's password.
- **PATCH /api/v1/users/delete-me**: Deactivate the logged-in user's account.
- **GET /api/v1/users/my-bookings**: Get the bookings belonging to the logged-in user.

#### Admin Routes

- **GET /api/v1/users**: Get all users data.
- **GET /api/v1/users/:userId**: Get user data based on the user ID.
- **PATCH /api/v1/users/:userId**: Update user data (name and/or role).
- **GET /api/v1/tours/:id/bookings**: Fetch all bookings for a tour.
- **GET /api/v1/bookings**: Fetch all bookings.
- **GET /api/v1/bookings/:bookingId**: Fetch a booking by ID.

#### Admin, Lead-Guide Routes

- **POST /api/v1/tours**: Create a tour.
- **PATCH /api/v1/tours/:tourId**: Update a tour.
- **DELETE /api/v1/tours/:tourId**: Delete a tour.

#### Admin, Lead-Guide, Guide Routes

- **GET /api/v1/tours/monthly-stats/:year**: Get monthly stats for tours.

#### Reviews Routes

- **POST /api/v1/tours/:id/reviews**: Create a review for a tour.
- **PATCH /api/v1/reviews/:reviewId**: Update a review for a tour.
- **DELETE /api/v1/reviews/:reviewId**: Delete a review.

#### Bookings Routes

- **GET /api/v1/bookings/checkout-session/:tourId**: Get the Stripe checkout session for a tour.

## Technologies Used

- **Node.js**
- **Express**
- **TypeScript**
- **MongoDB**
- **Mongoose**
- **Zod** (for request validation)
- **JWT** (for authentication)
- **Nodemailer** (for email notifications)
- **Pug** (for email templates)
- **Stripe** (for payment processing)
- **Cloudinary** (for image storage)
- **Day.js** (for date manipulation)
- **Pino** (for logging)
- **Husky** (for Git hooks)
- **ESLint** (for code linting)
- **Prettier** (for code formatting)
- **Jest** (for testing)
- **Supertest** (for testing HTTP APIs)

## License

This project is licensed under the ISC License - see the LICENSE file for details.
