# Placement Pro

Placement Pro is a full-stack placement management web application built using **Next.js** for the frontend and **Django REST Framework** for the backend.

The application provides user authentication and a structured platform for managing placement-related activities.

## Tech Stack

### Frontend
- Next.js
- React
- TypeScript
- CSS

### Backend
- Python
- Django
- Django REST Framework
- JWT Authentication
- Django CORS Headers

## Features

- User registration
- User login
- JWT-based authentication
- REST API backend
- Frontend and backend integration
- Responsive web interface

## Project Structure

```text
placement-pro/
├── backend/                 # Django REST API
│   ├── applications/
│   ├── backend/
│   ├── manage.py
│   └── requirements.txt
│
├── frontend/                # Next.js application
│   ├── app/
│   ├── public/
│   ├── package.json
│   └── next.config.ts
│
├── .gitignore
└── README.md
```

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/LakshmiprabaP/placement-pro.git
cd placement-pro
```

### 2. Backend Setup

```bash
cd backend
python -m venv venv
```

Activate the virtual environment on Windows:

```bash
venv\Scripts\activate
```

Install the dependencies:

```bash
pip install -r requirements.txt
```

Run the Django development server:

```bash
python manage.py runserver
```

The backend will run at:

```text
http://127.0.0.1:8000/
```

### 3. Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend will normally run at:

```text
http://localhost:3000/
```

## Security

Sensitive information such as secret keys, environment variables, and credentials should not be committed to the repository.

## Author

**Lakshmi Praba P**

GitHub: `LakshmiprabaP`