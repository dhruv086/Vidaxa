# Vidaxa

Vidaxa is a video-sharing platform backend built with Node.js, Express, and MongoDB. It provides APIs for user authentication, video management, subscriptions, playlists, likes, comments, and community posts.

## Features

- **User Authentication**: Register, login, logout, and manage user accounts.
- **Video Management**: Upload, update, delete, and fetch videos.
- **Subscriptions**: Subscribe to channels and manage subscriptions.
- **Playlists**: Create, update, delete, and manage playlists.
- **Likes**: Like/unlike videos, comments, and community posts.
- **Comments**: Add, update, delete, and fetch comments on videos.
- **Community Posts**: Create, update, delete, and fetch posts.
- **Dashboard**: Fetch channel statistics and videos.

## Data Flow & Models

- [View the Data Flow & Models Diagram](https://app.eraser.io/workspace/ezPmAq86wiJljVS4zBvS?origin=share)

## Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/dhruv086/vidaxa.git
   cd vidaxa
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Configure environment variables:
   ```sh
   cp .env.example .env
   nano .env
   ```
4. Run the application:
   ```sh
   npm run dev
   ```

## Contributing

Contributions are welcome!

## License

This project is licensed under the MIT License -

## Acknowledgments

- [Node.js](https://nodejs.org/)
- [Express](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [Mongoose](https://mongoosejs.com/)
- [JsonWebToken](https://github.com/auth0/node-jsonwebtoken)
- [Bcrypt](https://github.com/kelektiv/node.bcrypt.js)
- [Dotenv](https://github.com/motdotla/dotenv)
- [Nodemon](https://nodemon.io/)
