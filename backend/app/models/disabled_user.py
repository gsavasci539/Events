from sqlalchemy import Column, Integer, ForeignKey
from ..db import Base


class DisabledUser(Base):
    __tablename__ = "disabled_users"
    __table_args__ = {"schema": "dbo"}

    user_id = Column(Integer, ForeignKey("dbo.users.id"), primary_key=True)
