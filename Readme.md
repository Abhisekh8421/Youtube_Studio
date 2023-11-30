# YouTube Studio with MERN Stack 🚀

Welcome to the YouTube Studio project, a robust web application built using the MERN stack (MongoDB, Express.js, React.js, Node.js) along with advanced concepts to enhance your video streaming and content creation experience! 🎥🔥

## Features 🌟

- **User Schema**: Store user details including watch history, avatar, cover image, and more.
- **Video Schema**: Manage video metadata such as thumbnail, title, duration, video file, and more.
- **User Authentication**: Secure user authentication using JWT tokens for a seamless and protected user experience.
- **Password Encryption**: Implement industry-standard encryption and decryption techniques to safeguard user passwords.
- **MongoDB Aggregations Pipelining**: Utilize the power of MongoDB aggregations pipelining to efficiently store and retrieve data.
- **Multer and Cloudinary Integration**: Seamlessly handle file uploads with Multer and store images and videos on Cloudinary for scalable storage.

## Technologies Used 💻

- **MongoDB**: A NoSQL database for efficient and flexible data storage.
- **Express.js**: A fast and minimalist web framework for Node.js to handle backend operations.
- **React.js**: A powerful JavaScript library for building user interfaces to create a dynamic and responsive front end.
- **Node.js**: A runtime environment for executing JavaScript code on the server side.
- **JWT Authentication**: Secure user authentication with JSON Web Tokens.
- **Multer**: Middleware for handling multipart/form-data, used for file uploads.
- **Cloudinary**: Cloud-based media management platform for storing images and videos.

## Getting Started 🚀

1. Clone the repository.

   ```bash
   git clone https://github.com/Abhisekh8421/Youtube_Studio.git
   ```

2. Install dependencies for both the client and server.

   ```bash
   cd youtube-studio
   npm install

   ```

3. Set up your environment variables. Create a `.env` file in the server directory and add your MongoDB connection string, Cloudinary credentials, and JWT secret.
   ```env
   MONGO_URI=your_mongodb_connection_string
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   JWT_SECRET=your_jwt_secret
   ACCESS_TOKEN_SECRET=your_access_token
   ACCESS_TOKEN_EXPIRY=your_access_expiry
   REFRESH_TOKEN_SECRET=your_refresh_token
   REFRESH_TOKEN_EXPIRY=your_refresh_expiry
   ```

````

4. Run the development server.
```bash
npm run dev


5. Open your browser and navigate to `http://localhost:3000` to explore the YouTube Studio!

## Contributions 🤝

Contributions are welcome! Feel free to open issues or pull requests to improve the project.

## License 📝

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

Enjoy creating and sharing amazing content with YouTube Studio! 🚀🎬
````
