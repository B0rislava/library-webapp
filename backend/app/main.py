from fastapi import FastAPI
from .auth import router as auth_router
from fastapi.middleware.cors import CORSMiddleware
from .init_db import init_db
from .routes.books import router as books_router
from .routes.users import router as user_router
from .init_db import seed_books

app = FastAPI()

app.include_router(auth_router)
app.include_router(books_router, prefix="/books")
app.include_router(user_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

init_db()
seed_books()


@app.get("/")
def read_root():
    return {"message": "Welcome to the Library API!"}
