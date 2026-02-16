# Blig Blogs Backend Overview

## Stack

- Frameworks: Flask 3, Flask-JWT-Extended, Flask-SQLAlchemy, Flask-Migrate, flask-cors
- Database: PostgreSQL (psycopg2-binary) via SQLAlchemy ORM; Alembic for migrations
- Media: Cloudinary for image/video uploads
- Security: JWT access/refresh tokens with token blocklist; bcrypt password hashing
- Server: Gunicorn entrypoint via wsgi.py

## Application Setup

- App factory: app/__init__.py
  - Configures CORS for http://localhost:3000 and https://blig-frontend.onrender.com
  - Reads DATABASE_URL (converts postgres:// → postgresql://)
  - Sets SQLALCHEMY_DATABASE_URI, disables track modifications
  - JWT config:
    - JWT_SECRET_KEY
    - Access token: 15 minutes
    - Refresh token: 7 days
  - Cloudinary config: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
  - Registers blueprints: auth, blog, follow, comment
  - Health check: GET / → { status, message, version }
  - Token revocation check using TokenBlocklist

## Data Model

- User
  - Fields: id, username (unique), email (unique), password_hash, bio, profile_image_url, profile_image_public_id, created_at
  - Relations: blogs, media_uploads, likes, comments, followers, following

- Blog
  - Fields: id, author_id, title, body_text, is_published, created_at, updated_at
  - Relations: author (User), media_items (Media ordered by position), likes, comments (ordered by created_at asc)
  - Method: to_dict() → standardized JSON shape for API responses

- Media
  - Fields: id, blog_id, uploader_id, media_type (image|video), media_url, thumbnail_url, position, created_at
  - Relations: blog, uploader (User)

- Like
  - Fields: id, user_id, blog_id, created_at
  - Unique: (user_id, blog_id)
  - Relations: user, blog

- Comment
  - Fields: id, blog_id, author_id, content, created_at, updated_at
  - Relations: blog, author

- Follow
  - Fields: id, follower_id, following_id, created_at
  - Unique: (follower_id, following_id)

- TokenBlocklist
  - Fields: id, jti (indexed), created_at

Schema initialization is in migrations/versions/9da6aab2761e_initial_postgres_setup.py.

## API Reference

Notes:
- All endpoints mount at root (no url_prefix set).
- Protected routes require Authorization: Bearer <token>.

### Auth

- POST /register
  - Body: { username, email, password }
  - Creates user with bcrypt-hashed password.
  - 201 on success; 400 if user exists or missing fields.

- POST /login
  - Body: { email, password }
  - Returns: { message, access_token, refresh_token }
  - 401 on invalid credentials.

- GET /me
  - Auth: access token
  - Returns current user profile: { id, username, email, profile_image_url }

- POST /profile/image
  - Auth: access token
  - FormData: file
  - Uploads to Cloudinary (resource_type=image). Updates user profile image.
  - Returns: { message, profile_image_url }

- POST /refresh
  - Auth: refresh token
  - Returns: { access_token }

- POST /logout
  - Auth: access token
  - Revokes current access token by recording its JTI.

- POST /logout/refresh
  - Auth: refresh token
  - Revokes current refresh token by recording its JTI.

### Blogs

- POST /blogs
  - Auth: access token
  - Body: { title, body_text }
  - Creates a blog post (is_published=True).
  - Returns: { message, blog_id }

- GET /blogs
  - Query: page=1, per_page=5
  - Returns paginated list:
    - { page, per_page, total, blogs: [ { id, title, body_text, likes_count, author: { id, username }, media: [ { id, url, type } ], created_at, updated_at } ] }

- GET /blogs/:id
  - Returns a single blog by id with same fields as above.

- PUT /blogs/:id
  - Auth: access token
  - Only author may update.
  - Body: { title?, body_text? }
  - Returns: { message, blog_id }

- DELETE /blogs/:id
  - Auth: access token
  - Only author may delete.
  - Returns: { message }

- POST /blogs/:id/like
  - Auth: access token
  - Likes blog; unique per user/blog.
  - Returns: { message }

- DELETE /blogs/:id/like
  - Auth: access token
  - Removes like.
  - Returns: { message }

- POST /blogs/:id/media
  - Auth: access token (author only)
  - FormData: file
  - Uploads to Cloudinary (resource_type=auto) and stores media item with sequential position.
  - Returns: { message, media_id, media_url, media_type }

- GET /feed
  - Auth: access token
  - Lists blogs from users the current user follows, ordered by created_at desc.
  - Uses Blog.to_dict() shape.

### Follows

- POST /users/:user_id/follow
  - Auth: access token
  - Follows a user; cannot follow self; unique per pair.
  - Returns: { message }

- DELETE /users/:user_id/follow
  - Auth: access token
  - Unfollows a user.
  - Returns: { message }

- GET /users/:user_id/followers
  - Returns: [ { id, username } ]

- GET /users/:user_id/following
  - Returns: [ { id, username } ]

### Comments

- POST /blogs/:blog_id/comments
  - Auth: access token
  - Body: { content }
  - Returns: { message, comment_id }

- GET /blogs/:blog_id/comments
  - Returns: [ { id, content, author: { id, username }, created_at } ]

- DELETE /comments/:comment_id
  - Auth: access token (author only)
  - Returns: { message }

## Configuration

Required environment variables:
- DATABASE_URL (postgresql://...)
- JWT_SECRET_KEY
- CLOUDINARY_CLOUD_NAME
- CLOUDINARY_API_KEY
- CLOUDINARY_API_SECRET

## Running and Deployment

- Local entrypoint: wsgi.py (create_app factory)
- Gunicorn Procfile: `web: gunicorn wsgi:app`
- DB migrations:
  - Generate: `alembic revision --autogenerate -m "message"` (via Flask-Migrate CLI in your environment)
  - Upgrade: `alembic upgrade head`

## Notes and Recommendations

- Blog.to_dict() added for consistent serialization and used by /feed.
- User.followers/following relationship definitions are configured to avoid initialization errors.
- Consider adding url_prefix for blueprints (e.g., /api) for namespacing.
- Consider stricter input validation and rate limiting for production.

