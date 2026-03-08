
# Microblogging Platform

A **full-stack Microblogging Web Application** built using the **MERN stack (MongoDB, Express.js, React.js, Node.js)**.
The platform allows users to create and view short text posts through a responsive web interface.

This project demonstrates **full-stack development concepts such as REST API integration, database operations, and frontend–backend communication**.

---

## Live Application

Live:https://micro-blogging-web.vercel.app/login
Demo:https://drive.google.com/file/d/1vn2wovx-wQsyWpXFR_ntZXCm62vyGSlg/view?usp=drivesdk


---

## Features

• Create short text posts
• View all posts dynamically
• Responsive user interface
• REST API for post management
• MongoDB database integration
• Full-stack deployment

---

## Tech Stack

### Frontend

* React.js
* Axios
* CSS

### Backend

* Node.js
* Express.js

### Database

* MongoDB Atlas

### Deployment

* Frontend: Vercel
* Backend: Node.js Server

---

## System Architecture

```
React Frontend
      │
      ▼
Express REST API
      │
      ▼
MongoDB Database
```

The React frontend communicates with the Express backend using REST APIs.
The backend processes requests and stores or retrieves data from MongoDB.

---

## Project Structure

```
FWD-capstone
│
├── frontend
│   ├── src
│   │   ├── components
│   │   ├── pages
│   │   └── styles
│   └── package.json
│
├── backend
│   ├── models
│   ├── routes
│   ├── controllers
│   └── server.js
│
└── README.md
```

---

## Installation and Setup

### Clone Repository

```
git clone https://github.com/Tharasri78/FWD-capstone.git
cd FWD-capstone
```

---

### Run Frontend

```
cd frontend
npm install
npm start
```

Frontend runs on:

```
http://localhost:3000
```

---

### Run Backend

```
cd backend
npm install
npm run dev
```

Backend runs on:

```
http://localhost:5000
```

---

## Learning Outcomes

* MERN stack application development
* REST API implementation using Express.js
* MongoDB database integration
* Frontend and backend communication using Axios
* Deploying full-stack applications

---

## Author

**Thara Sri**



---

## License

This project is developed for **educational and portfolio purposes**.

---

