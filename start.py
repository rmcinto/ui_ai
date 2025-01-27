#!/usr/bin/env python3
"""
start_application.py

Usage:
  python start_application.py

What it does:
  1) Activates the __env virtual environment in Windows.
  2) Starts the Uvicorn (FastAPI) backend on port 8000.
  3) Starts the Vite/React frontend dev server (npm run dev).

Stop with Ctrl + C.
"""

import os
import sys
import subprocess
import platform

def main():
    # 1. Paths to environment and commands
    venv_name = ".env"  # Change if your venv is named differently
    # Python and pip executables inside the virtual environment
    if platform.system().lower().startswith("win"):
        # Windows paths
        python_exe = os.path.join(venv_name, "Scripts", "python.exe")
    else:
        # On Linux/Mac
        python_exe = os.path.join(venv_name, "bin", "python")

    # 2. Ensure the python.exe (or python) for the environment exists
    if not os.path.isfile(python_exe):
        print(f"Error: Python not found in virtual environment: {python_exe}")
        print("Make sure .env exists and is a valid virtual environment.")
        sys.exit(1)

    # 3. Start backend (Uvicorn) using the environment python
    backend_command = [
        python_exe, 
        "-m", "uvicorn", 
        "backend.main:app", 
        "--reload", 
        "--host", "0.0.0.0", 
        "--port", "8000"
    ]

    # We'll run this from the 'backend' folder
    backend_cwd = os.getcwd()
    if not os.path.isdir(backend_cwd):
        print(f"Warning: 'backend' folder not found at {backend_cwd}.")
        print("Make sure you have a backend folder with main.py.")
    else:
        print("Starting Backend (FastAPI)...")

    backend_process = subprocess.Popen(
        backend_command,
        cwd=backend_cwd,
        shell=False
    )

    # 4. Start frontend (npm run dev) in the 'frontend' folder
    frontend_cwd = os.path.join(os.getcwd(), "frontend")
    if not os.path.isdir(frontend_cwd):
        print(f"Warning: 'frontend' folder not found at {frontend_cwd}.")
        print("Make sure you have initialized the Vite project in 'frontend'.")
    else:
        print("Starting Frontend (Vite + React)...")

    frontend_command = [
        "npm",
        "run",
        "dev"
    ]
    frontend_process = subprocess.Popen(
        frontend_command,
        cwd=frontend_cwd,
        shell=True
    )

    # 5. Wait for user to interrupt (Ctrl + C) or either process to exit
    print("Both backend and frontend started. Press Ctrl+C to stop.")
    try:
        # If either process ends, we exit
        backend_exit_code = backend_process.wait()
        frontend_exit_code = frontend_process.wait()
        print(f"Backend exited with code: {backend_exit_code}")
        print(f"Frontend exited with code: {frontend_exit_code}")
    except KeyboardInterrupt:
        print("Received Ctrl+C, terminating processes...")
        backend_process.terminate()
        frontend_process.terminate()

    print("Done. Both backend and frontend have stopped.")

if __name__ == "__main__":
    main()
