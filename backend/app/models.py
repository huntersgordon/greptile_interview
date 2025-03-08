from datetime import datetime
from app import db

class Commit(db.Model):
    """Stores individual commits from the repository, along with diffs."""
    id = db.Column(db.Integer, primary_key=True)
    commit_hash = db.Column(db.String(64), unique=True, nullable=False)
    message = db.Column(db.Text, nullable=False)
    author = db.Column(db.String(128), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    diff = db.Column(db.Text, nullable=True)  # Stores a filtered subset of file changes
    type = db.Column(db.String(32), nullable=True)  # feat, fix, BREAKING CHANGE, etc.

    def __repr__(self):
        return f"<Commit {self.commit_hash[:7]} - {self.type or 'misc'}: {self.message[:50]}>"

class Changelog(db.Model):
    """Stores AI-generated changelogs from grouped commits."""
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    content = db.Column(db.Text, nullable=False)  # AI-generated summary
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    commit_group = db.Column(db.Text, nullable=True)  # JSON list of commit hashes used

    def __repr__(self):
        return f"<Changelog {self.title[:50]}>"

class Repository(db.Model):
    """Stores metadata about repositories for tracking purposes."""
    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(255), unique=True, nullable=False)  # "org/repo"
    last_updated = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<Repository {self.full_name}>"
