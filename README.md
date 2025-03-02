# Artist Search

Server-side Scripting using Python, Flask, JSON, AJAX, and Artsy API

## Overview

This project implements a web application that allows users to search for artists using the Artsy API. The application features:

- A Flask-based backend that securely interacts with the Artsy API (handling authentication, search, and artist details).
- A front-end built with HTML, CSS, and JavaScript that dynamically displays search results and detailed artist information.
- Deployment on Google Cloud Platform (GCP) using App Engine.

## Features

- **Artist Search:** Users can enter an artist name and view a list of artist cards.
- **Artist Details:** Clicking on a card fetches and displays detailed information about the selected artist.
- **Responsive Design:** The front-end adjusts for various screen sizes, with horizontal scrolling for artist cards.
- **Token Caching:** The backend caches the Artsy API token to reduce redundant authentication calls.

## Project Structure

```bash
├── app.py
├── static/
│   ├── style.css
│   ├── script.js
│   └── images/
├── templates/
│   └── index.html
├── requirements.txt
└── app.yaml
```


## Setup and Deployment

### Local Setup

1. Clone the repository.
2. Create a virtual environment and install dependencies:
   ```bash
   python -m venv venv
   source venv/bin/activate   # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
  ```
3. Create a .env file in the project root with your Artsy credentials (for local development):
   ```bash
  ARTSY_CLIENT_ID=your_client_id_here
  ARTSY_CLIENT_SECRET=your_client_secret_here
   ```
4. Run the Flask app locally:
  ```bash
  python app.py
  ```
5. Visit http://127.0.0.1:5000/ in your browser.

### Deployment

The backend is deployed on Google Cloud Platform using App Engine. For deployment:

1. Make sure you have the Google Cloud SDK installed and configured.
  
2. In your project folder, deploy with:
  ```bash
  gcloud app deploy
  ```
3. After deployment, the app is accessible at https://<your-project-id>.appspot.com/.


