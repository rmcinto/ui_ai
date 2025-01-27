import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routes.datasets import router as datasets_router
from .routes.frames import router as frames_router

app = FastAPI()

# Allow all origins, methods, and headers for now (development only!)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or specify list of domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the routers in the main FastAPI app
app.include_router(datasets_router, prefix="/datasets")
app.include_router(frames_router, prefix="/frames")

@app.get("/")
def read_root():
    return {"message": "Hello from your ML annotation backend!"}

if __name__ == "__main__":
    # Run with:  uvicorn main:app --reload
    uvicorn.run(app, host="0.0.0.0", port=8000)
