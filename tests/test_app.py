import json
import pytest
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app import app as flask_app
from generator import generate_copies, TEMPLATES


# ── generator tests ──────────────────────────────────────────────────────────

def test_generate_returns_list():
    results = generate_copies("日常", "文艺", "咖啡", 3)
    assert isinstance(results, list)
    assert len(results) == 3


def test_generate_without_keyword():
    results = generate_copies("励志", "励志", count=5)
    assert len(results) == 5
    for r in results:
        assert isinstance(r, str)
        assert len(r) > 0


def test_generate_all_categories_all_moods():
    for cat in TEMPLATES:
        for mood in ["文艺", "搞笑", "温暖", "励志"]:
            results = generate_copies(cat, mood, "test", 2)
            assert len(results) >= 1


def test_generate_invalid_category_falls_back():
    results = generate_copies("不存在", "文艺", count=2)
    assert len(results) >= 1


def test_generate_invalid_mood_falls_back():
    results = generate_copies("日常", "不存在风格", count=2)
    assert len(results) >= 1


def test_count_cap():
    # Request more than available templates → returns all available
    results = generate_copies("日常", "励志", count=100)
    assert len(results) >= 1


# ── Flask route tests ────────────────────────────────────────────────────────

@pytest.fixture
def client():
    flask_app.config["TESTING"] = True
    with flask_app.test_client() as c:
        yield c


def test_homepage(client):
    r = client.get("/")
    assert r.status_code == 200
    body = r.data.decode("utf-8")
    assert "朋友圈文案生成器" in body
    for cat in TEMPLATES:
        assert cat in body


def test_generate_endpoint(client):
    payload = {"category": "美食", "mood": "搞笑", "keyword": "火锅", "count": 3}
    r = client.post(
        "/generate",
        data=json.dumps(payload),
        content_type="application/json",
    )
    assert r.status_code == 200
    data = json.loads(r.data)
    assert "copies" in data
    assert len(data["copies"]) == 3


def test_generate_endpoint_defaults(client):
    r = client.post(
        "/generate",
        data=json.dumps({}),
        content_type="application/json",
    )
    assert r.status_code == 200
    data = json.loads(r.data)
    assert len(data["copies"]) > 0


def test_generate_endpoint_count_capped(client):
    payload = {"category": "旅游", "mood": "文艺", "count": 99}
    r = client.post(
        "/generate",
        data=json.dumps(payload),
        content_type="application/json",
    )
    assert r.status_code == 200
    data = json.loads(r.data)
    assert len(data["copies"]) <= 10  # server cap is 10
