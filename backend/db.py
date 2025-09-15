import os
from pymongo import MongoClient

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
MONGO_DB  = os.getenv("MONGO_DB", "contracts_db")

client = MongoClient(MONGO_URI)
db = client[MONGO_DB]
