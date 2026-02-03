# Development Setup Guide

## 1. Backend Server (Python/FastAPI)

The backend runs on port `8000`.

1.  Open a terminal in the project root.
2.  Activate the virtual environment:
    ```powershell
    .\env\Scripts\activate
    ```
    *(You should see `(env)` appear in your prompt)*

3.  Navigate to the backend directory and start the server:
    ```powershell
    cd backend
    uvicorn app.main:app --reload --port 8000
    ```

## 2. Frontend Server (React/Vite)

The frontend usually runs on port `5173`.

1.  Open a **new** terminal in the project root.
2.  Install dependencies (only if you haven't already):
    ```powershell
    npm install
    ```
3.  Start the development server:
    ```powershell
    npm run dev
    ```

## 3. Stopping and Restarting

### How to Stop
To stop either server, click inside its terminal window and press **`Ctrl + C`**. You may need to press it twice or type `y` to confirm (depending on the terminal).

### How to Restart
After stopping:
- **Backend:** Press `Up Arrow` to recall the `uvicorn` command and press `Enter`.
- **Frontend:** Press `Up Arrow` to recall the `npm run dev` command and press `Enter`.

## Accessing the App

- **Frontend:** [http://localhost:5173](http://localhost:5173)
- **Backend API Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)
