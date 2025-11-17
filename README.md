# movie_review_system
A backend API built using NestJS, Prisma ORM, PostgreSQL, and TypeScript.
Users can register, log in, add movies to their watchlist, and submit reviews once they watch a movie.

**Features**

    Authentication & Authorization
    
    User registration & login
    
    JWT-based authentication
    
    Role-based access (Admin / User)
    
    Google OAuth (if included in your project)

**Movie Module**

    Add new movies (Admin only)
    
    Get all movies
    
    Filter movies by:
    
    Genre
    
    Region
    
    Availability
    
    Release year, etc.

**Review System**

    Users can add reviews only if:
    
    The movie is in their watchlist
    
    They have marked it as “watched”
    
    Admin can moderate reviews

**Watchlist**

    Add movie to watchlist
    
    Mark movie as watched
    
    Get full watchlist with review status
    
    Delete items from watchlist

**Database Layer**

    Prisma ORM
    
    PostgreSQL
    
    Auto-generated migrations
    
    Clear schema design

**File Uploads**
    
    Upload movie posters/images
    
    Local storage or cloud storage (based on your config)

**Installation**

    npm install

**Environment Variables**

Create a .env file in the root of your project:
    
    DATABASE_URL="mysql://username:password@localhost:5432/movie_db"
    JWT_SECRET="your_secret_key"
    GOOGLE_CLIENT_ID="your_google_client_id"
    GOOGLE_CLIENT_SECRET="your_google_client_secret"
**Prisma Commands**

Generate client:

    npx prisma generate


Run migrations:

    npx prisma migrate dev --name init


View DB in browser:

    npx prisma studio

**Running the Project**

Development mode

    npm run start:dev    

**API Endpoints Overview**
Auth

    Method	Endpoint	      Description
    POST	  /auth/admin   	Create user
    POST	  /auth/login	    Login user
    GET	    /auth/google	  Google OAuth
Movies

    Method	 Endpoint	    Description
    POST	  /movies	      Add movie (Admin)
    GET	    /movies	      Get all movies
    GET	    /movies/:id	  Get movie by ID
Watchlist

    Method	Endpoint	       Description
    POST	  /watchlist	     Add to watchlist
    PUT  	  /watchlist/:id/  Mark as watched
    GET	    /watchlist	     Get user's watchlist
Reviews

    Method	 Endpoint	          Description
    POST	   /reviews	          Add review
    GET	     /reviews/movie/:id	Get reviews for a movie    

