import requests
import socket
import base64
import json
import time
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

# Step 1: Authenticate to Guacamole
# Replace with your Guacamole URL, username, and password
GUACAMOLE_URL = "http://34.55.20.1:8080/guacamole"
USERNAME = "guacadmin"
PASSWORD = "guacadmin"

# Configure retry strategy
retry_strategy = Retry(
    total=3,  # number of retries
    backoff_factor=1,  # wait 1, 2, 4 seconds between retries
    status_forcelist=[500, 502, 503, 504]  # HTTP status codes to retry on
)

# Create a session with retry strategy
session = requests.Session()
adapter = HTTPAdapter(max_retries=retry_strategy)
session.mount("http://", adapter)
session.mount("https://", adapter)

# Function to get the current IP address of the host
def get_current_ip():
    try:
        # Create a socket connection to a public DNS server to get the local IP address
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))  # Google's public DNS server
        ip_address = s.getsockname()[0]
        s.close()
        return "34.55.20.1"
    except Exception as e:
        print("Error getting IP address:", e)
        return None

# Step 2: Authenticate and get token
def authenticate():
    auth_data = {
        "username": USERNAME,
        "password": PASSWORD
    }
    
    try:
        print(f"Attempting to connect to {GUACAMOLE_URL}/api/tokens")
        # Use form data instead of JSON
        response = session.post(
            f"{GUACAMOLE_URL}/api/tokens",
            data=auth_data,
            headers={'Content-Type': 'application/x-www-form-urlencoded'},
            timeout=10  # 10 second timeout
        )
        print(f"Response status code: {response.status_code}")
        print(f"Response headers: {response.headers}")
        print(f"Response content: {response.text}")
        
        if response.status_code == 200:
            return response.json()['authToken']
        else:
            print(f"Authentication failed with status code {response.status_code}")
            print(f"Response text: {response.text}")
            return None
    except requests.exceptions.RequestException as e:
        print(f"Connection error: {e}")
        return None

# Function to verify if a connection exists
def verify_connection(token, connection_id):
    headers = {
        "Guacamole-Token": token,
        "Content-Type": "application/json"
    }
    
    try:
        response = session.get(
            f"{GUACAMOLE_URL}/api/session/data/mysql/connections/{connection_id}",
            headers=headers,
            timeout=10  # 10 second timeout
        )
        return response.status_code == 200
    except requests.exceptions.RequestException:
        return False

# Step 3: Create a new connection
def create_connection(token):
    current_ip = get_current_ip()

    if current_ip is None:
        print("Could not retrieve the current IP address.")
        return None

    connection_data = {
        "name": f"SSH_Connection_{int(time.time())}",
        "protocol": "ssh",
        "parameters": {
            "hostname": current_ip,
            "port": "22",
            "username": "ameya_dusane05",
            "password": "",
        },
        "attributes": {
            "max-connections": None,
            "max-connections-per-user": None,
        },
    }

    headers = {
        "Guacamole-Token": token,
        "Content-Type": "application/json"
    }

    try:
        print("Attempting to create connection...")
        response = session.post(
            f"{GUACAMOLE_URL}/api/session/data/mysql/connections",
            headers=headers,
            json=connection_data,
            timeout=30  # 30 second timeout for connection creation
        )
        
        print(f"Create connection response status: {response.status_code}")
        print(f"Create connection response: {response.text}")

        if response.status_code == 200:
            return response.json()
        else:
            print("Failed to create connection:", response.text)
            return None
    except requests.exceptions.Timeout:
        print("Connection creation timed out. The server is taking too long to respond.")
        return None
    except requests.exceptions.RequestException as e:
        print(f"Connection error while creating connection: {e}")
        return None

# Step 4: Get Dashboard URL
def get_dashboard_url():
    dashboard_url = f"{GUACAMOLE_URL}/#/"
    print("Access the dashboard at:", dashboard_url)
    return dashboard_url

# Function to list all connections
def list_connections(token):
    headers = {
        "Guacamole-Token": token,
        "Content-Type": "application/json"
    }
    
    try:
        response = session.get(
            f"{GUACAMOLE_URL}/api/session/data/mysql/connections",
            headers=headers,
            timeout=10
        )
        if response.status_code == 200:
            # The response is a dictionary with connection IDs as keys
            connections = response.json()
            # Convert to list of connection objects
            return [{"identifier": conn_id, **conn_data} for conn_id, conn_data in connections.items()]
        else:
            print(f"Failed to list connections: {response.text}")
            return None
    except requests.exceptions.RequestException as e:
        print(f"Error listing connections: {e}")
        return None

# Function to find a specific connection by name
def find_connection_by_name(token, connection_name):
    connections = list_connections(token)
    if connections:
        for conn in connections:
            if conn.get("name") == connection_name:
                return conn
    return None

# Function to generate connection URL
def generate_connection_url(connection_id):
    encoded_id = base64.b64encode(f"{connection_id}\0c\0mysql\0".encode()).decode()
    connection_url = f"{GUACAMOLE_URL}/#/client/{encoded_id}"
    return connection_url

# Function to test connection
def test_connection(token, connection_id):
    headers = {
        "Guacamole-Token": token,
        "Content-Type": "application/json"
    }
    
    try:
        print("Testing connection...")
        # First, get the connection details
        response = session.get(
            f"{GUACAMOLE_URL}/api/session/data/mysql/connections/{connection_id}",
            headers=headers,
            timeout=10
        )
        
        if response.status_code == 200:
            print("Connection details retrieved successfully")
            # Now try to create an active connection
            active_response = session.post(
                f"{GUACAMOLE_URL}/api/session/tunnels",
                headers=headers,
                json={
                    "connectionID": connection_id,
                    "protocol": "ssh",
                    "parameters": {
                        "hostname": "34.55.20.1",
                        "port": "22",
                        "username": "ameya_dusane05"
                    }
                },
                timeout=10
            )
            print(f"Test connection response status: {active_response.status_code}")
            print(f"Test connection response: {active_response.text}")
            return active_response.status_code == 200
        else:
            print(f"Failed to get connection details: {response.text}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"Error testing connection: {e}")
        return False




# Main Execution Flow
if __name__ == "__main__":
    print("Authenticating...")
    token = authenticate()
    
    if token:
        print("Authentication successful!")
        print(f"Token: {token}")

        print("Creating a new connection...")
        new_connection = create_connection(token)
        
        if new_connection:
            connection_id = new_connection["identifier"]
            connection_name = new_connection["name"]
            print(f"Connection created with ID: {connection_id}")
            
            # Wait for a few seconds to allow the connection to be fully registered
            print("Waiting for connection to be fully registered...")
            time.sleep(5)
            
            # Verify the connection exists
            if verify_connection(token, connection_id):
                print("Connection verified successfully!")
                
                # Find the connection in the list
                found_connection = find_connection_by_name(token, connection_name)
                if found_connection:
                    print(f"Found connection in the system: {found_connection['name']}")
                    
                    # Generate and print both URLs
                    connection_url = generate_connection_url(connection_id)
                    dashboard_url = f"{GUACAMOLE_URL}/#/"
                    
                    
                    print(connection_url)
                    
                else:
                    print("Connection not found in the system. Please try accessing the dashboard.")
                    print(f"Dashboard URL: {GUACAMOLE_URL}/#/")
            

    else:
        print("Authentication failed! Please check your credentials.")