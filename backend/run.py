from app import create_app, db
from app.models import Commit, Changelog, Repository

app = create_app()

@app.shell_context_processor
def make_shell_context():
    return {'db': db, 'Commit': Commit, 'Changelog': Changelog, 'Repository': Repository}
