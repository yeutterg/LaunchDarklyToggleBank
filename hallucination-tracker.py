#!/usr/bin/env python3
import os
import json
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "healthy", "service": "hallucination-tracker"})

@app.route("/chat", methods=["POST"])
def chat():
    try:
        data = request.get_json()
        user_message = data.get("message", "")
        context = data.get("context", {})
        config_key = data.get("configKey", "")
        
        # Mock response with hallucination tracking data
        response = {
            "response": f"Advanced AI response to: {user_message}",
            "hallucination_score": 0.15,
            "confidence_score": 0.85,
            "fact_check_passed": True,
            "sources": ["LaunchDarkly documentation", "AWS Bedrock docs"],
            "warnings": []
        }
        
        return jsonify(response)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8501, debug=False) 