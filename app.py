from flask import Flask, render_template, request, jsonify
import os
from generator import generate_copies, TEMPLATES

app = Flask(__name__)

CATEGORIES = list(TEMPLATES.keys())
MOODS = ["文艺", "搞笑", "温暖", "励志"]


@app.route("/")
def index():
    return render_template("index.html", categories=CATEGORIES, moods=MOODS)


@app.route("/generate", methods=["POST"])
def generate():
    data = request.get_json(silent=True) or {}
    category = data.get("category", "日常")
    mood = data.get("mood", "文艺")
    keyword = data.get("keyword", "")
    count = min(int(data.get("count", 5)), 10)

    if category not in CATEGORIES:
        category = "日常"
    if mood not in MOODS:
        mood = "文艺"

    copies = generate_copies(category, mood, keyword, count)
    return jsonify({"copies": copies})


if __name__ == "__main__":
    debug = os.environ.get("FLASK_DEBUG", "0") == "1"
    app.run(debug=debug)
