from app.database import SessionLocal
from app.models import User

email = input("Email to promote to admin: ").strip()

db = SessionLocal()
user = db.query(User).filter(User.email == email).first()
if not user:
    print(f"No user found with email {email}. Register them first via /auth/register.")
else:
    user.is_admin = True
    db.commit()
    print(f"{email} is now an admin.")
db.close()