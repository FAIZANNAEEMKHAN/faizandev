import os
import logging
from flask import Flask, send_from_directory, request, jsonify
from flask_cors import CORS
import json

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class PortfolioApp:
    def __init__(self):
        self.app = Flask(__name__, static_folder='.')
        CORS(self.app)
        self._setup_routes()

    def _setup_routes(self):
        # Static serving
        self.app.add_url_rule('/', 'index', self.serve_index)
        self.app.add_url_rule('/<path:path>', 'static_proxy', self.serve_static)

        # API Endpoints
        self.app.add_url_rule('/api/contact', 'contact', self.handle_contact, methods=['POST'])
        self.app.add_url_rule('/api/ai', 'ai', self.handle_ai, methods=['POST'])
        self.app.add_url_rule('/api/projects', 'projects', self.handle_projects, methods=['GET'])
        self.app.add_url_rule('/api/login', 'login', self.handle_login, methods=['POST'])
        
        # Admin Endpoints
        self.app.add_url_rule('/api/admin/login', 'admin_login', self.admin_login, methods=['POST'])
        self.app.add_url_rule('/api/admin/content', 'admin_content_get', self.admin_content_get, methods=['GET'])
        self.app.add_url_rule('/api/admin/content/update', 'admin_content_update', self.admin_content_update, methods=['POST'])

    # --- Route Handlers ---

    def serve_index(self):
        return send_from_directory('.', 'index.html')

    def serve_static(self, path):
        return send_from_directory('.', path)

    def handle_contact(self):
        try:
            data = request.get_json() or {}
            logger.info(f"New Contact Message received: {data}")
            return jsonify({"status": "success", "message": "Message received!"}), 200
        except Exception as e:
            logger.error(f"Error handling contact: {e}")
            return jsonify({"status": "error", "message": str(e)}), 400

    def handle_ai(self):
        try:
            data = request.get_json() or {}
            user_msg = str(data.get('message', '')).lower()
            
            # Refactored Persona AI Logic
            if 'tech' in user_msg or 'stack' in user_msg:
                response = "I primarily work with Next.js, TypeScript, and Three.js for immersive 3D web experiences."
            elif 'availability' in user_msg or 'hiring' in user_msg:
                response = "I am currently open to freelance opportunities and full-time roles starting next month."
            else:
                response = f"That's interesting! As a Web Developer, I focus on high-performance interfaces. You mentioned: '{user_msg}'."
                
            return jsonify({"response": response}), 200
        except Exception as e:
            logger.error(f"Error handling AI message: {e}")
            return jsonify({"response": "An error occurred on the server.", "error": str(e)}), 500

    def handle_projects(self):
        try:
            with open('content.json', 'r', encoding='utf-8') as f:
                data = json.load(f)
                projects = data.get('projects', [])
                return jsonify(projects), 200
        except Exception as e:
            logger.error(f"Error fetching dynamic projects: {e}")
            return jsonify([]), 200

    def handle_login(self):
        try:
            data = request.get_json() or {}
            identifier = data.get('identifier', '')
            password = data.get('password', '')
            
            # Log safely without exposing the password
            logger.info(f"Login Attempt Details: identifier={identifier}, pwd_length={len(password)}")
            
            # Mock successful login auth token / session
            return jsonify({
                "status": "success", 
                "message": "Login successful!",
                "user": {"name": "Guest User", "email": identifier}
            }), 200
        except Exception as e:
            logger.error(f"Login processing error: {e}")
            return jsonify({"status": "error", "message": "Failed to authenticate"}), 400

    def admin_login(self):
        data = request.json or {}
        if data.get('password') == 'faizan':
            return jsonify({"status": "success", "token": "admin-secure-token-faizan"})
        return jsonify({"status": "error", "message": "Unauthorized"}), 401

    def admin_content_get(self):
        try:
            with open('content.json', 'r', encoding='utf-8') as f:
                return jsonify(json.load(f))
        except FileNotFoundError:
            return jsonify({})

    def admin_content_update(self):
        auth_header = request.headers.get('Authorization')
        if not auth_header or auth_header != "Bearer admin-secure-token-faizan":
            return jsonify({"status": "error", "message": "Unauthorized access"}), 401
        
        data = request.json
        if not data:
            return jsonify({"status": "error", "message": "Invalid JSON"}), 400
            
        with open('content.json', 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=4)
            
        return jsonify({"status": "success"})

    def run(self, port=3000, debug=True):
        logger.info(f"Starting server on port {port} with debug={debug}")
        self.app.run(port=port, debug=debug)

# Instantiate the app for WSGI/Serverless runners (like Vercel)
portfolio_instance = PortfolioApp()
app = portfolio_instance.app

# Entry point for local development
if __name__ == '__main__':
    portfolio_instance.run(port=3000, debug=True)
