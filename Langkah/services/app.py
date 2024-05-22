from flask import Flask, request, jsonify
import subprocess

app = Flask(__name__)

@app.route('/calculate-path', methods=['POST'])
def calculate_path():
    data = request.json
    origin_station_id = data['origin']
    destination_station_id = data['destination']
    
    # Call the aStar.py script using subprocess
    result = subprocess.run(['python', 'aStar.py', str(origin_station_id), str(destination_station_id)], capture_output=True)
    
    if result.returncode == 0:
        return jsonify({"message": "Path calculated successfully"})
    else:
        return jsonify({"error": result.stderr.decode('utf-8')}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3000)
