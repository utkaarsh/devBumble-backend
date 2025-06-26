const configCors = {
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"], // Make sure PATCH is included
  allowedHeaders: ["Content-Type", "Authorization"],

  credentials: true,
};

module.exports = configCors;
