from flask import Flask, request, jsonify
from flask_cors import CORS
from routes.auth import auth_bp
from routes.panel import panel_bp
from routes.usuarios import usuarios_bp

app = Flask(__name__)
CORS(app)
app.register_blueprint(auth_bp, url_prefix="/auth")
app.register_blueprint(panel_bp, url_prefix="/panel") 
app.register_blueprint(usuarios_bp, url_prefix="/usuarios")

if __name__ == "__main__":
    app.run(debug=True)

    

