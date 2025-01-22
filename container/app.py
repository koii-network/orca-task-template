from flask import Flask, request, jsonify, g
import sqlite3

app = Flask(__name__)

DATABASE = "results.db"


def get_db():
    if "db" not in g:
        g.db = sqlite3.connect(DATABASE)
        g.db.row_factory = sqlite3.Row
        # Initialize the database schema if it hasn't been initialized yet
        cursor = g.db.cursor()
        cursor.execute(
            "CREATE TABLE IF NOT EXISTS submissions (roundNumber INTEGER PRIMARY KEY, submission TEXT)"
        )
        g.db.commit()
    return g.db


def close_db():
    db = g.pop("db", None)

    if db is not None:
        db.close()


@app.get("/")
def home():
    return "Working"


@app.post("/healthz")
def health_check():
    return "OK"


@app.post("/task/<roundNumber>")
def start_task(roundNumber):
    print("Task started for round: " + roundNumber)
    db = get_db()
    cursor = db.cursor()
    cursor.execute(
        "INSERT OR IGNORE INTO submissions (roundNumber, submission) VALUES (?, ?)",
        (roundNumber, "Hello World!"),
    )
    db.commit()
    close_db()
    return jsonify({"roundNumber": roundNumber, "status": "Task started"})


@app.get("/submission/<roundNumber>")
def fetch_submission(roundNumber):
    print("Fetching submission for round: " + roundNumber)
    db = get_db()
    cursor = db.cursor()
    query = cursor.execute(
        "SELECT * FROM submissions WHERE roundNumber = ?", (roundNumber,)
    )
    result = query.fetchone()
    close_db()
    if result:
        return jsonify(result["submission"])
    else:
        return "Submission not found", 404


@app.post("/audit")
def audit_submission():
    print("Auditing submission")
    data = request.get_json()
    audit_result = data["submission"] == "Hello World!"
    # audit result must be a boolean
    return jsonify(audit_result)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080, threaded=False)
