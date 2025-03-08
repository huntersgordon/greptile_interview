from datetime import datetime
from app import db

class Commit(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    commit_hash = db.Column(db.String(64), unique=True, nullable=False)
    message = db.Column(db.Text, nullable=False)
    author = db.Column(db.String(128), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    diff = db.Column(db.Text, nullable=True)
    type = db.Column(db.String(32), nullable=True)

    def __repr__(self):
        return f"<Commit {self.commit_hash[:7]} - {self.type or 'misc'}: {self.message[:50]}>"

class Changelog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    repo_name = db.Column(db.String(255), nullable=True)
    title = db.Column(db.String(255), nullable=True)
    content = db.Column(db.Text, nullable=True)
    hash = db.Column(db.String(64), nullable=True)
    commit_group = db.Column(db.Text, nullable=True)
    date = db.Column(db.Date, nullable=False)
    created_at = db.Column(db.DateTime, default=db.func.now())

    def __repr__(self):
        return f"<Changelog {self.title[:50]} on {self.date}>"

class Repository(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(255), unique=True, nullable=False)
    last_updated = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<Repository {self.full_name}>"
