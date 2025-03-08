# Greptile Interview

👋 Hi there! First and foremost, a big thank you Daksh for your time. 🙏

## Project Structure

This project is divided into two main repositories:

1. **Frontend**: Built with React and TypeScript. ⚛️ The frontend provides a developer portal accessible at the `/developer` route, which is used to generate changelogs. It outputs links to the resulting changelogs.
2. **Backend**: Uses Flask and Python to generate and retrieve changelogs via `/generate-changelog` (POST) and `/changes/<repo_hash>` (GET) endpoints, with SQLAlchemy for database operations. 🐍

## Getting Started

Follow these instructions to set up the project on your local machine. 🛠️

### Prerequisites

- Node.js and npm (for the frontend)
- Python 3.x (for the backend)
- pip (Python package manager)

### Frontend Setup

1. **Navigate to the frontend directory**:
   Open a terminal and run:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm start
   ```

### Backend Setup

1. **Navigate to the backend directory**:
   Open a separate terminal and run:
   ```bash
   cd backend
   ```

2. **Create a virtual environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**:
   Create a `.env` file in the backend directory and add your API keys:
   ```
   GH_TOKEN=your_github_token_here
   OPENAI_API_KEY=your_openai_api_key_here
   ```

5. **Initialize the database**:
   ```bash
   flask db init
   flask db migrate
   flask db upgrade
   ```

6. **Run the Flask server**:
   ```bash
   flask run
   ```

And that's it! You should now have both the frontend and backend running locally in separate terminals. 🎉

If you encounter any issues, feel free to reach out. Happy coding! 💻
