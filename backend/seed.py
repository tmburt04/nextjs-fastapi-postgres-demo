from sqlalchemy import select
from sqlalchemy.orm import Session
from db_engine import sync_engine
from models import User, Thread


def seed_user_if_needed():
    with Session(sync_engine) as session:
        with session.begin():
            if session.execute(select(User)).scalar_one_or_none() is not None:
                print("User already exists, skipping seeding")
                return
            print("Seeding user")
            session.add(User(name="Tim"))
            session.add(Thread(name="Test Thread", owner_id="1"))
            session.commit()
