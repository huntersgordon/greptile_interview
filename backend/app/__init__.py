from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_migrate import Migrate
import os

db = SQLAlchemy()
migrate = Migrate()

def create_app():
    app = Flask(__name__)
    app.config.from_pyfile('../config.py')

    CORS(app)
    db.init_app(app)
    migrate.init_app(app, db)

    with app.app_context():
        from .routes import changelog_bp
        app.register_blueprint(changelog_bp)

    return app
