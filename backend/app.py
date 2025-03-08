from flask import Flask
from flask_sqlalchemy import SQLAlchemy
import os

db = SQLAlchemy()

def create_app():
    app = Flask(__name__)

    # Load configuration from your config.py
    app.config.from_pyfile(os.path.join(os.path.dirname(__file__), '..', 'config.py'))

    db.init_app(app)

    with app.app_context():
        # Import and register Blueprints here
        from .routes import changelog_bp
        app.register_blueprint(changelog_bp)

        db.create_all()

    return app
