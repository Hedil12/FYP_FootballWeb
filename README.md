# 🏗️ Fullstack Cloud Integrated Application (FYP)

This repository contains my Final Year Project, a fullstack application built using the **DRF (Django Rest Framework)** and **React.js**. This project was a self-directed deep dive into modern web architecture, as JavaScript and Fullstack frameworks were outside the scope of my formal academic curriculum.

---

## 🛠️ Tech Stack & Architecture

### **Backend (The Core)**
*   **Framework:** Django / Django Rest Framework (DRF)
*   **Primary Database:** PostgreSQL (Cloud-hosted: Avien [free tier]) — Managed relational data and user profiles.
*   **Storage Provider:** [Cloudinary] — Dedicated cloud storage for media and image assets.
*   **Security:** 
    *   **PBKDF2** password hashing for user security.
    *   **JWT (JSON Web Tokens)** for stateless authentication.
    *   **RBAC (Role-Based Access Control)** to manage permissions between different user tiers.

### **Frontend (The Interface)**
*   **Library:** React.js
*   **Routing:** React Router for dynamic SPA (Single Page Application) navigation.
---

## 🚀 Key Technical Implementation

### **1. Hybrid Cloud Database Strategy**
To optimize performance and cost, I implemented a split-database architecture:
*   **PostgreSQL** handles structured data and relational queries.
*   **[Cloud Storage]** handles binary large objects (Images), ensuring the main database remains lightweight and fast.

### **2. Security & Authentication Pipeline**
I implemented a robust security layer involving:
*   **JWT Tokens:** Handling login persistence and secure communication between the React frontend and Django backend.
*   **RBAC Framework:** Custom middleware to ensure users can only access endpoints relevant to their assigned roles.
*   **Encryption:** Passwords are never stored in plain text; I utilized industry-standard salting and hashing.
---

## 🧠 Learning Journey & Challenges

This project represents a significant personal milestone. Key challenges included:
*   **The JavaScript Leap:** Learning JS and the React lifecycle (hooks, state, and props) from scratch while simultaneously building the backend.
*   **Cross-Origin Communication:** Configuring CORS and ensuring seamless API requests between two different ports/domains.
*   **Infrastructure Management:** Coordinating two different cloud providers and ensuring data consistency across them.

---

## ⚙️ Setup & Installation

1. **Backend:**
   ```bash
   cd backend
   pip install -r requirements.txt
   python manage.py migrate
   python manage.py runserver
