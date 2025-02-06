from sqlalchemy import String, Integer, BigInteger, ForeignKey, DateTime, func, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.ext.declarative import declarative_base
from typing import List
import time
Base = declarative_base()

class User(Base):
    __tablename__ = "user"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(30))
    created_date: Mapped[int] = mapped_column(BigInteger, default=lambda: int(time.time()))

    threads: Mapped[List["Thread"]] = relationship("Thread", back_populates="owner")
    messages: Mapped[List["Message"]] = relationship("Message", back_populates="author")


class Thread(Base):
    __tablename__ = "thread"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(30))
    created_date: Mapped[int] = mapped_column(BigInteger, default=lambda: int(time.time()))

    # Foreign key referencing User.id
    owner_id: Mapped[int] = mapped_column(ForeignKey("user.id"))
    owner = relationship("User", back_populates="threads")

    # Relationship for messages in this thread
    messages: Mapped[List["Message"]] = relationship("Message", back_populates="thread")


class Message(Base):
    __tablename__ = "message"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    content: Mapped[str] = mapped_column(Text)
    role: Mapped[str] = mapped_column(Text)
    created_date: Mapped[int] = mapped_column(BigInteger, default=lambda: int(time.time()))

    # Foreign key referencing User.id (the author of the message)
    author_id: Mapped[int] = mapped_column(ForeignKey("user.id"), nullable=True)
    author = relationship("User", back_populates="messages")

    # Foreign key referencing Thread.id (the thread this message belongs to)
    thread_id: Mapped[int] = mapped_column(ForeignKey("thread.id"))
    thread = relationship("Thread", back_populates="messages")
