from base64 import b64decode
import json
import openai
import concurrent.futures
from flask import Blueprint, request, jsonify
from app import db
from app.models import Changelog
from pydantic import BaseModel
from typing import List, Optional
import requests
from datetime import datetime, timedelta
from collections import defaultdict
import os
from dotenv import load_dotenv

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
GH_TOKEN = os.getenv("GH_TOKEN")

changelog_bp = Blueprint('changelog_bp', __name__)

client = openai.OpenAI(api_key=OPENAI_API_KEY)

class CommitEntry(BaseModel):
    commit_hash: str
    message: str
    author: str
    timestamp: str
    diff: Optional[str]
    type: str

class ChangelogSection(BaseModel):
    heading: str
    items: List[str]

class ChangelogEntry(BaseModel):
    date: str
    title: str
    description: str
    sections: List[ChangelogSection]

def fetch_commits(repo_name: str, days: int = 3) -> List[CommitEntry]:
    since_date = (datetime.now() - timedelta(days=days)).isoformat()
    url = f"https://api.github.com/repos/{repo_name}/commits"
    headers = {
        "Accept": "application/vnd.github.v3+json",
        "Authorization": f"Bearer {GH_TOKEN}"
    }
    params = {"since": since_date}
    response = requests.get(url, headers=headers, params=params)
    response.raise_for_status()
    commits_data = response.json()

    return [
        CommitEntry(
            commit_hash=cd['sha'],
            message=cd['commit']['message'],
            author=cd['commit']['author']['name'],
            timestamp=cd['commit']['author']['date'],
            diff=None,
            type="misc"
        ) for cd in commits_data
    ]

import openai
from datetime import datetime
from typing import List
from pydantic import BaseModel, Field

class ChangeEntry(BaseModel):
    description: str

class ChangelogSection(BaseModel):
    section_title: str
    changes: List[ChangeEntry]

class DailyChangelog(BaseModel):
    date: str
    sections: List[ChangelogSection]


def call_openai_api(commits_batch: List[CommitEntry]) -> ChangelogEntry:
    prompt = (
        "Summarize the following commits into a human-readable changelog entry, "
        "grouped clearly into sections with descriptive titles. No mention of the commit message please:\n\n"
        + json.dumps([c.dict() for c in commits_batch], indent=2)
    )

    response = client.beta.chat.completions.parse(
        model="gpt-4o-2024-08-06",
        messages=[{"role": "user", "content": prompt}],
        response_format=ChangelogEntry,
        max_tokens=400,
    )

    return response.choices[0].message.parsed


@changelog_bp.route('/generate-changelog', methods=['POST'])
def generate_changelog():
    data = request.get_json()
    repo_name, name_hash, days = data.get("repo"), data.get("hash"), int(data.get("days", 3))

    if not repo_name:
        return jsonify({"error": "Repository name required"}), 400

    Changelog.query.filter_by(hash=name_hash).delete()
    db.session.commit()

    commits = fetch_commits(repo_name, days)
    commits_by_day = defaultdict(list)
    for commit in commits:
        commit_day = datetime.fromisoformat(commit.timestamp).date().isoformat()
        commits_by_day[commit_day].append(commit)

    changelog_entries = []
    with concurrent.futures.ThreadPoolExecutor() as executor:
        futures = {
            executor.submit(call_openai_api, commits): date
            for date, commits in commits_by_day.items()
        }
        for future in concurrent.futures.as_completed(futures):
            entry = future.result()
            changelog_entries.append(entry)

    for entry in changelog_entries:
        content_lines = [f"## {sec.heading}\n" + "\n".join(f"- {item}" for item in sec.items)
                         for sec in entry.sections]
        new_changelog = Changelog(
            repo_name=repo_name,
            title=entry.title,
            hash=name_hash,
            content="\n".join(content_lines),
            commit_group=json.dumps([c.commit_hash for c in commits_by_day[entry.date]]),
            date=datetime.fromisoformat(entry.date)
        )
        db.session.add(new_changelog)

    db.session.commit()

    return jsonify({"repository": repo_name, "status": "completed"}), 201

@changelog_bp.route('/changes/<string:repo_hash>', methods=['GET'])
def get_changelog(repo_hash):
    repo_name = b64decode(repo_hash.encode()).decode()
    changelogs = Changelog.query.filter_by(hash=repo_hash).order_by(Changelog.date.desc()).all()

    if not changelogs:
        return jsonify({"error": "Changelog not found"}), 404

    return jsonify({
        "repository": repo_name,
        "changelog": [
            {
                "date": log.date.strftime("%Y-%m-%d"),
                "title": log.title,
                "content": log.content
            } for log in changelogs
        ]
    }), 200
