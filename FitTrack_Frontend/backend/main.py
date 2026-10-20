import os
from datetime import datetime, timedelta, timezone

import bcrypt
import jwt
from bson import ObjectId
from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel, EmailStr, Field
from pymongo import ASCENDING, MongoClient
from pymongo.errors import DuplicateKeyError, PyMongoError

load_dotenv()
MONGO_URL = os.getenv('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.getenv('DB_NAME', 'fittrack')
JWT_SECRET = os.getenv('JWT_SECRET', 'development-only-change-me')

client = MongoClient(MONGO_URL, serverSelectionTimeoutMS=3000)
db = client[DB_NAME]
users = db.users
records = db.health_records
security = HTTPBearer()
app = FastAPI(title='Wellnest API', version='1.0.0')
app.add_middleware(CORSMiddleware, allow_origins=[os.getenv('FRONTEND_ORIGIN', 'http://localhost:5173')], allow_credentials=True, allow_methods=['*'], allow_headers=['*'])

class RegisterRequest(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    email: EmailStr
    password: str = Field(min_length=8, max_length=72)

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class RecordRequest(BaseModel):
    category: str = Field(pattern='^(symptom|habit|appointment|note)$')
    title: str = Field(min_length=1, max_length=120)
    detail: str = Field(default='', max_length=1000)
    value: float | None = None

def public_user(user: dict) -> dict:
    return {'id': str(user['_id']), 'name': user['name'], 'email': user['email'], 'role': user.get('role', 'member'), 'is_active': user.get('is_active', True)}

def token_for(user: dict) -> str:
    now = datetime.now(timezone.utc)
    return jwt.encode({'sub': str(user['_id']), 'iat': now, 'exp': now + timedelta(hours=24)}, JWT_SECRET, algorithm='HS256')

def current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=['HS256'])
        user = users.find_one({'_id': ObjectId(payload['sub'])})
    except (jwt.PyJWTError, KeyError, ValueError):
        raise HTTPException(401, 'Invalid or expired token')
    if not user or not user.get('is_active', True):
        raise HTTPException(401, 'User is unavailable')
    return user

@app.on_event('startup')
def startup() -> None:
    try:
        client.admin.command('ping')
        users.create_index([('email', ASCENDING)], unique=True)
    except PyMongoError as exc:
        raise RuntimeError('MongoDB is unavailable. Check MONGO_URL and start MongoDB.') from exc

@app.get('/')
def home(): return {'message': 'Wellnest API is running'}

@app.get('/api/health')
def health(): return {'status': 'ok'}

@app.post('/api/auth/register', status_code=201)
def register(data: RegisterRequest):
    document = {'name': data.name.strip(), 'email': data.email.lower(), 'password_hash': bcrypt.hashpw(data.password.encode(), bcrypt.gensalt()), 'role': 'member', 'is_active': True, 'created_at': datetime.now(timezone.utc)}
    try:
        document['_id'] = users.insert_one(document).inserted_id
    except DuplicateKeyError:
        raise HTTPException(409, 'Email already registered')
    return {'message': 'Registration successful', 'user': public_user(document)}

@app.post('/api/auth/login')
def login(data: LoginRequest):
    user = users.find_one({'email': data.email.lower()})
    if not user or not bcrypt.checkpw(data.password.encode(), user['password_hash']):
        raise HTTPException(401, 'Invalid email or password')
    if not user.get('is_active', True): raise HTTPException(403, 'Account is inactive')
    return {'access_token': token_for(user), 'token_type': 'bearer', 'user': public_user(user)}

@app.get('/api/auth/me')
def me(user: dict = Depends(current_user)): return public_user(user)

def public_record(item: dict) -> dict:
    return {'id': str(item['_id']), 'category': item['category'], 'title': item['title'], 'detail': item.get('detail', ''), 'value': item.get('value'), 'created_at': item['created_at']}

@app.get('/api/records')
def list_records(category: str | None = None, user: dict = Depends(current_user)):
    query = {'user_id': user['_id']}
    if category: query['category'] = category
    return [public_record(item) for item in records.find(query).sort('created_at', -1).limit(100)]

@app.post('/api/records', status_code=201)
def create_record(data: RecordRequest, user: dict = Depends(current_user)):
    item = {'user_id': user['_id'], **data.model_dump(), 'created_at': datetime.now(timezone.utc)}
    item['_id'] = records.insert_one(item).inserted_id
    return public_record(item)

@app.delete('/api/records/{record_id}', status_code=204)
def delete_record(record_id: str, user: dict = Depends(current_user)):
    try: oid = ObjectId(record_id)
    except ValueError: raise HTTPException(400, 'Invalid record id')
    if records.delete_one({'_id': oid, 'user_id': user['_id']}).deleted_count == 0:
        raise HTTPException(404, 'Record not found')

@app.patch('/api/profile')
def update_profile(data: dict, user: dict = Depends(current_user)):
    name = str(data.get('name', '')).strip()
    if len(name) < 2 or len(name) > 80: raise HTTPException(422, 'Name must contain 2–80 characters')
    users.update_one({'_id': user['_id']}, {'$set': {'name': name}})
    user['name'] = name
    return public_user(user)
