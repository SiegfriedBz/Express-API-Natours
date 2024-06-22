# Natours API

The Natours API originated from a server-rendered web application tutorial in JavaScript, where Pug was used for server-side rendering across all routes.

I refactored and rebuilt the entire project in TypeScript, transforming it into a robust API featuring user authentication, tour bookings, and reviews, with MongoDB for data storage.  
Additionally, I introduced Zod for input validation and Cloudinary for efficient image storage.  
Pug continues to be utilized exclusively for email templates.  
I also added comprehensive testing with Jest and SuperTest to ensure the API's reliability.

The Natours API now serves as the backend for another project I developed— a [React Single Page Application (SPA)](https://github.com/SiegfriedBz/vite_react_ts-natours) tested with Cypress — providing a seamless web application experience.

To facilitate easy interaction with the API, I have included a comprehensive [Postman documentation](https://documenter.getpostman.com/view/27920009/2sA3QtcqG8).


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
- [Deployment](#deployment)
- [Postman Documentation](#postman-documentation)


## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Ensure you have the following installed & set up:

- Node.js `20.x`
- Mongo DB account
- Cloudinary account
- Mailtrap account (for email notifications in development mode)
- Brevo account (for email notifications in production mode)
- Stripe account

## Installation

Clone the repository and install the dependencies:

```bash
git clone https://github.com/your-repo/api_ts_zod.git
cd api_ts_zod
npm install
```

## Environment Variables  

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

    # Healthcheck Route
    
    - GET /api/v1/healthcheck**: Check the health of the API.
    
    # Tours Routes
    
    - GET /api/v1/tours : Fetch all tours.
    - GET /api/v1/tours/top-5-cheap : Fetch top 5 cheapest tours.
    - GET /api/v1/tours/:tourId : Fetch a tour by tour ID.
    - GET /api/v1/tours/stats : Fetch statistics about tours.
    - GET /api/v1/tours/within/:distance/center/:latlng/unit/:unit : Fetch tours within a given distance from a point.
    - GET /api/v1/tours/distances-from/:latlng/unit/:unit : Fetch distances to all tours from a point.
    - GET /api/v1/tours/:id/reviews : Get all reviews for a given tour.
    
    # Users Routes
    
    - POST /api/v1/users/signup : Create a new user account.
    
    # Sessions Routes
    
    - POST /api/v1/sessions/login : Login a user.
    - DELETE /api/v1/sessions/logout : Logout a user.
    
    # Reviews Routes
    
    - GET /api/v1/reviews : Get all reviews for all tours.
    - GET /api/v1/reviews/:reviewId : Get a review by review ID.
    - GET /api/v1/tours/:id/reviews : Get all reviews for a given tour.

### Protected Routes

    # Logged in as user routes

    - GET /api/v1/bookings/checkout-session/:tourId : Get the Stripe checkout session for a booking on a tour.
    - GET /api/v1/users/me : Fetch the logged-in user's profile.
    - POST /api/v1/users/forgot-my-password : Step 1 in the forgot/reset password process.
    - POST /api/v1/users/reset-my-password : Step 2 in the forgot/reset password process.
    - PATCH /api/v1/users/update-me : Update the logged-in user's profile.
    - PATCH /api/v1/users/update-my-password : Update the logged-in user's password.
    - PATCH /api/v1/users/delete-me : Deactivate the logged-in user's account.
    - GET /api/v1/users/my-bookings : Get the bookings belonging to the logged-in user.
    - POST /api/v1/tours/:id/reviews : Create a review for a tour.
    - PATCH /api/v1/reviews/:reviewId : Update a review.
    
    # Logged in as admin routes
    
    - GET /api/v1/users : Get all users data.
    - GET /api/v1/users/:userId : Get user by user ID.
    - PATCH /api/v1/users/:userId : Update user data (name and/or role).
    - GET /api/v1/tours/:id/bookings : Fetch all bookings for a tour.
    - GET /api/v1/bookings : Fetch all bookings.
    - GET /api/v1/bookings/:bookingId : Fetch a booking by ID.
    - DELETE /api/v1/reviews/:reviewId : Delete a review.

    # Logged in as admin or lead-guide routes
    
    - POST /api/v1/tours : Create a tour.
    - PATCH /api/v1/tours/:tourId : Update a tour.
    - DELETE /api/v1/tours/:tourId : Delete a tour.

    # Logged in as admin, lead-guide or guide routes
    
    - GET /api/v1/tours/monthly-stats/:year : Get monthly stats for tours.

    # Webhook Route
    
    - POST /stripe/webhook : Endpoint for Stripe webhook.
    - Allows Stripe to send events after user checkout.
    - Listens for `checkout.session.completed` events.
    - Creates a booking record in the database upon receiving `checkout.session.completed` event.
    

## Technologies Used

### Backend Technologies

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
- **Multer** (for handling file uploads)
- **Cloudinary** (for image storage)
- **Day.js** (for date manipulation)
- **Pino** (for logging)

### Development Tools

- **Husky** (for Git hooks)
- **ESLint** (for code linting)
- **Prettier** (for code formatting)

### Testing Tools

- **Jest** (for unit testing)
- **Supertest** (for testing HTTP APIs)

## Deployment
The Natours API is deployed on Render.com

## Postman Documentation
[Postman](https://documenter.getpostman.com/view/27920009/2sA3QtcqG8)







