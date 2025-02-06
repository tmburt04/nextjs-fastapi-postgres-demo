from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from typing import List
from sqlalchemy import select
from seed import seed_user_if_needed
from sqlalchemy.ext.asyncio import AsyncSession
from db_engine import engine
from models import User, Thread, Message
from typing import List, Optional
from openai import OpenAI
import os
from dotenv import load_dotenv
from sqlalchemy.inspection import inspect

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=OPENAI_API_KEY)

seed_user_if_needed()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class UserRead(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True

class MessageRead(BaseModel):
    id: int
    content: str
    role: str
    author_id: Optional[int]
    author: Optional[UserRead]
    created_date: int

    class Config:
        from_attributes = True

class ThreadRead(BaseModel):
    id: int
    name: str
    created_date: int
    owner: Optional[UserRead]
    owner_id: int
    messages: List[MessageRead] = []

    class Config:
        from_attributes = True

class ThreadRequest(BaseModel):
    name: str
    owner_id: int


def object_as_dict(obj):
    return {c.key: getattr(obj, c.key) for c in inspect(obj).mapper.column_attrs}

# Endpoint to fetch profile (ideally auth would be inferred from a jwt of some sort)
@app.get("/users/me")
async def get_my_user():
    async with AsyncSession(engine) as session:
        async with session.begin():
            result = await session.execute(select(User))
            user = result.scalars().first()
            if user is None:
                raise HTTPException(status_code=404, detail="User not found")
            return object_as_dict(user) # @todo revisit this and fix casting

# Lists the threads a user owns (when authentication is present we wont have to provide the id explicitly)
@app.get("/threads/{owner_id}")
async def get_threads_by_user(owner_id: int):
    async with AsyncSession(engine) as session:
        async with session.begin():
            result = await session.execute(select(Thread).where(Thread.owner_id == owner_id))
            threads = result.scalars().all()
            return [object_as_dict(thrd) for thrd in threads] # @todo revisit this and fix casting

# Creates a thread for a user
@app.post("/thread")
async def create_thread(thread_request: ThreadRequest):
    async with AsyncSession(engine) as session:
        async with session.begin():
            new_thread = Thread(
                name=thread_request.name,
                owner_id=thread_request.owner_id,
            )
            session.add(new_thread)
            await session.commit()

# Lists the messages for a given thread 
@app.get("/thread-messages/{thread_id}")
async def get_messages_by_thread_id(thread_id: int):
    async with AsyncSession(engine) as session:
        async with session.begin():
            result = await session.execute(select(Message).where(Message.thread_id == thread_id))
            messages = result.scalars().all()
            return [object_as_dict(msg) for msg in messages] # @todo revisit this and fix casting

class ChatRequest(BaseModel):
    author_id: int
    thread_id: int
    message: str

@app.post("/chat")
async def chat_endpoint(chat_request: ChatRequest, background_tasks: BackgroundTasks):
    # Save the new user message.
    async with AsyncSession(engine) as session:
        async with session.begin():
            new_msg = Message(
                content=chat_request.message,
                role='user',
                author_id=chat_request.author_id,
                thread_id=chat_request.thread_id
            )
            session.add(new_msg)
            await session.commit()

        # Retrieve all messages in the thread for chat context
        result = await session.execute(
            select(Message)
            .where(Message.thread_id == chat_request.thread_id)
            .order_by(Message.created_date.asc())
        )
        all_messages = result.scalars().all()

    # Build the conversation context from messages directly from the db. (if available)
    conversation_context = []
    for msg in all_messages:
        conversation_context.append({
            "role": msg.role,      # Expected roles: "user" and "assistant"
            "content": msg.content
        })

    buffer_response = ""  # Will accumulate the streamed bot response.

    def generate():
        nonlocal buffer_response
        try:
            # Request a streaming chat completion using the full conversation context.
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=conversation_context,
                stream=True,
            )
            for chunk in response:
                choices = chunk.choices
                if choices and len(choices) > 0:
                    delta = choices[0].delta
                    content = delta.content
                    if content:
                        buffer_response += content
                        yield content
        except Exception as e:
            yield f"\n[Error streaming response: {str(e)}]"

        # Once streaming is complete, add the full bot message as a background task.
        background_tasks.add_task(
            save_bot_message,
            chat_request.thread_id,
            buffer_response
        )

    return StreamingResponse(generate(), media_type="text/plain")

# Save message from bot to db
async def save_bot_message(thread_id: int, content: str):
    async with AsyncSession(engine) as session:
        async with session.begin():
            bot_msg = Message(
                content=content,
                role='assistant',
                thread_id=thread_id
            )
            session.add(bot_msg)
            await session.commit()