const allowedOrigins = [
  "http://localhost:5173", // local web dev
  "http://localhost:3000", // local RN web
  "https://devbumble-backend-vor2.onrender.com", // your render backend
];

const configCors = {
  origin: (origin, callback) => {
    // ✅ Allow mobile apps (React Native) which send no origin
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked: ${origin}`));
    }
  },

  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"], // Make sure PATCH is included
  allowedHeaders: ["Content-Type", "Authorization"],

  credentials: true,
};

module.exports = configCors;
