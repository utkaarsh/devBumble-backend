# DevBumble 🚀

DevBumble is a **developer-focused social connection platform** inspired by **Bumble**, allowing developers to **connect**, **chat**, and **grow their network** with **real-time features**.

---

## 🛠️ Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **Real-time Communication:** Socket.io (WebSocket)
- **Authentication:** JWT (JSON Web Tokens)
- **Deployment:** AWS EC2 (Ubuntu), NGINX, PM2

---

## ✅ Core Features

### 🧑‍💻 User Management

- User authentication (Signup / Login / Logout)
- Profile management
- Secure password handling with **bcrypt**
- JWT-based token authentication

### 🔗 Connection System

- Send connection requests
- Show interest in other users
- Ignore user profiles
- Update existing request status
- Prevent duplicate requests

### 📰 User Feed

- Excludes:
  - Logged-in user
  - Already connected users
  - Users who have been ignored
  - Users who have already received a request
- Pagination support
- MongoDB compound indexing for fast queries

---

## 📡 Real-time Chat (Socket.io Integration)

DevBumble offers **real-time one-to-one private chat** using **Socket.io** and **WebSockets**.

### 🔌 Socket.io Features:

- **Dynamic Room Management:**  
  Each chat is handled in a unique room (e.g., `sorted userId1_userId2`)

- **Real-time Messaging Flow:**

  - User connects → Joins a room
  - User sends a message → Server broadcasts to other user in the room
  - User disconnects → Server cleans up socket references

- **Events Handled:**

  - `connection`
  - `join-room`
  - `send-message`
  - `disconnect`

- **Future Ready:**  
  Easily extendable for typing indicators, message delivery receipts, or presence updates.

---

## 🖥️ Deployment - AWS EC2 + NGINX + PM2

Production deployment is managed on an **AWS EC2 Ubuntu instance** with **NGINX** and **PM2** for process and traffic management.

### 🔨 Deployment Pipeline:

1. **EC2 Setup:**

   - Ubuntu instance
   - SSH key management
   - Security groups: Open ports `80`, `443`, `3000`

2. **App Deployment:**

   - Codebase transfer via Git/SCP
   - Environment config with `.env`
   - Process management using **PM2** (`pm2 start`, `pm2 restart`, `pm2 logs`)

3. **NGINX Reverse Proxy:**

   - Routes traffic from **port 80/443 → port 3000**
   - Serves as load balancer and SSL termination point

4. **SSL with Let's Encrypt:**

   - Auto-renewable SSL certificates via **Certbot**

5. **Custom Domain:**
   - Managed via **AWS Route53** or external DNS provider

---

## 📚 API Endpoints

### 🔑 Authentication

| Method | Endpoint  | Description         |
| ------ | --------- | ------------------- |
| POST   | `/signup` | Register new user   |
| POST   | `/login`  | Login existing user |
| POST   | `/logout` | Logout user         |

### 🔗 Connection Requests

| Method | Endpoint                          | Description                    |
| ------ | --------------------------------- | ------------------------------ |
| POST   | `/request/send/:status/:toUserId` | Send/Update connection request |

- **Status Options:**
  - `interested`
  - `ignored`

### 📰 User Feed

| Method | Endpoint | Description               |
| ------ | -------- | ------------------------- |
| GET    | `/feed`  | Fetch paginated user feed |

- **Feed Query Params:**
  - `page` (default: 1)
  - `limit` (default: 10, max: 30)

### 📥 Received Connection Requests

| Method | Endpoint             | Description                     |
| ------ | -------------------- | ------------------------------- |
| GET    | `/requests/received` | Fetch pending incoming requests |

### 🤝 User Connections

| Method | Endpoint            | Description              |
| ------ | ------------------- | ------------------------ |
| GET    | `/user/connections` | Get accepted connections |

---

## 🔐 Security Features

- JWT-based authentication for API protection
- Password encryption using **bcrypt**
- MongoDB ObjectId validation
- Duplicate connection request prevention
- Centralised error handling middleware
- Input validation for routes and payloads

---

## 🚦 Status Codes

| Code | Meaning      |
| ---- | ------------ |
| 200  | Success      |
| 400  | Bad Request  |
| 401  | Unauthorized |
| 404  | Not Found    |
| 500  | Server Error |

---

## 📈 Performance Optimizations

- MongoDB **compound indexes** on key fields for fast querying (feed, connection requests, user search)
- Pagination across endpoints to handle large data loads
- Optimized WebSocket event emission with room-level targeting

---

## 🎯 Project Highlights

✅ Node.js + Express setup from scratch  
✅ Modular and scalable REST API architecture  
✅ Real-time chat built with **Socket.io**  
✅ Production deployment on **AWS EC2**  
✅ Reverse proxying and SSL with **NGINX + Let's Encrypt**  
✅ Fast queries with **MongoDB Indexing**  
✅ JWT-authenticated, secure user flows

---

## 🚀 Future Roadmap (Ideas)

- Push Notifications using **AWS SNS** or **Firebase Cloud Messaging**
- User presence indicators (Online/Offline status)
- Message history persistence
- Advanced feed personalization (recommendation engine)
- WebRTC-based voice or video calls

---

## 📌 Summary

**DevBumble** is a scalable, production-ready social networking backend for developers with **real-time messaging**, **secure auth flows**, and **AWS-hosted deployment**, designed for growth.

---
