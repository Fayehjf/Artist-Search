import os
import requests
from dotenv import load_dotenv
from flask import Flask, jsonify, request, render_template
from datetime import datetime, timezone
from dateutil import parser as dateparser

load_dotenv()
app = Flask(__name__)

CLIENT_ID = os.getenv("ARTSY_CLIENT_ID")
CLIENT_SECRET = os.getenv("ARTSY_CLIENT_SECRET")
AUTH_URL = "https://api.artsy.net/api/tokens/xapp_token"

# Test
# print("CLIENT_ID:", CLIENT_ID)
# print("CLIENT_SECRET:", CLIENT_SECRET)

current_token = None
current_token_expiry = None

def get_auth_token():
    global current_token, current_token_expiry
    now = datetime.now(timezone.utc)
    if current_token and current_token_expiry and now < current_token_expiry:
            return current_token
    try:
        response = requests.post(
            AUTH_URL,
            data={
                "client_id": CLIENT_ID,
                "client_secret": CLIENT_SECRET
            }
        )
        # Test
        # print(auth_response.status_code)
        # print(auth_response.text)
        response.raise_for_status()
        data = response.json()
        token = data.get("token")
        expires_at = data.get("expires_at")
        if not token or not expires_at:
            raise Exception("Invalid token data received")
        current_token = token
        current_token_expiry = dateparser.parse(expires_at)
        return current_token
    except requests.RequestException as e:
        app.logger.error("Error fetching Artsy token: %s", e)
        return None

def artsy_get(url, params=None):
    token = get_auth_token()
    if not token:
        raise Exception("Authentication failed")
    headers = {"X-Xapp-Token": token}
    response = requests.get(url, headers=headers, params=params)
    response.raise_for_status()
    return response.json()

@app.route("/")
def home():
    return render_template("index.html")
    # return app.send_static_file("index.html")

@app.route("/api/status", methods=["GET"])
def api_status():
    return jsonify({
        "status": "active",
        "service": "Artist Search API",
        "version": "1.0.0",
        "timestamp": datetime.now(timezone.utc).isoformat()
    })

@app.route("/search", methods=['GET'])
def search_artists():
    query = request.args.get("term")
    if not query:
        return jsonify({"status": "error", "message": "Please enter search terms"}), 400
    try:
        url = "https://api.artsy.net/api/search"
        params = {"q": query, "size": 10, "type": "artist"}
        data = artsy_get(url, params)
        results = data.get("_embedded", {}).get("results", [])
        artist_list = []

        for item in results:
            if item.get("type") != "artist":
                continue

            link = item.get("_links", {}).get("self", {}).get("href", "")
            artist_id = link.split("/")[-1] if "/" in link else ""
            image_url = item.get("_links", {}).get("thumbnail", {}).get("href", "")

            if not image_url or "missing_image" in image_url:
                image_url = None

            artist_list.append({
                "id": artist_id,
                "name": item.get("title"),
                "image": image_url
            })
        return jsonify({"data": artist_list})

    except Exception as e:
        app.logger.error("Error during search: %s", e)
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route("/artist/<string:artist_id>", methods=["GET"])
def get_artist_info(artist_id):
    if not artist_id:
        return jsonify({"status": "error", "message": "Missing artist ID"}), 400
    try:
        url = f"https://api.artsy.net/api/artists/{artist_id}"
        data = artsy_get(url)
        return jsonify({
            "name": data.get("name"),
            "birthday": data.get("birthday"),
            "deathday": data.get("deathday"),
            "nationality": data.get("nationality"),  # Modified: use "nationality" per rubric.
            "biography": data.get("biography") or ""
        })

    except requests.exceptions.HTTPError:
        return jsonify({"status": "error", "message": "Artist not found"}), 404

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)