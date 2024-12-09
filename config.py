from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'your_secret_key')
    SQLALCHEMY_DATABASE_URI = os.getenv(
        'DATABASE_URL', 'postgresql+psycopg2://postgres:Henrerig#1@localhost:5432/BookBargain'
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False