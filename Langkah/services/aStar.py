import psycopg2
import heapq
import networkx as nx  # Import NetworkX library for graph operations

# Database connection parameters
DB_PARAMS = {
    'dbname': 'mapData',
    'user': 'postgres',
    'password': '1234',
    'host': 'localhost',
    'port': '5432'
}

def manhattan_distance(node1, node2):
    x1, y1 = node1
    x2, y2 = node2
    return abs(x1 - x2) + abs(y1 - y2)

def fetch_station_coordinates(cursor):
    cursor.execute("SELECT id, latitude, longitude FROM merged_mrt_lrt;")
    return {row[0]: (row[1], row[2]) for row in cursor.fetchall()}

def fetch_edges(cursor):
    cursor.execute("SELECT source_station_id, destination_station_id, distance FROM edges_lrt_mrt;")
    edges = nx.Graph()  # Initialize a NetworkX graph
    for row in cursor.fetchall():
        edges.add_edge(row[0], row[1], weight=row[2])  # Add edge with weight to the graph
    return edges

def clear_output_stations(cursor):
    cursor.execute("DELETE FROM output_stations;")
    cursor.execute("ALTER SEQUENCE output_stations_output_id_seq RESTART WITH 1;")
    cursor.execute("UPDATE input_stations SET status = 'error' WHERE status = 'success';")

def fetch_input_station(cursor):
    cursor.execute("SELECT input_id, origin_station_id, destination_station_id FROM input_stations WHERE status = 'pending';")
    return cursor.fetchone()

def store_output_path(cursor, input_id, path):
    for step_order, (station_id, distance) in enumerate(path):
        cursor.execute(
            """
            INSERT INTO output_stations (input_id, station_id, distance, step_order)
            VALUES (%s, %s, %s, %s);
            """,
            (input_id, station_id, distance, step_order)
        )

def a_star_algorithm(start, goal, G, coords):
    open_set = []
    heapq.heappush(open_set, (0, start))
    came_from = {}
    g_score = {start: 0}
    f_score = {start: manhattan_distance(coords[start], coords[goal])}
    
    while open_set:
        _, current = heapq.heappop(open_set)
        if current == goal:
            path = []
            while current in came_from:
                path.append((current, g_score[current]))
                current = came_from[current]
            path.append((start, 0))
            path.reverse()
            return path
        
        for neighbor in G.neighbors(current):
            distance = G[current][neighbor]['weight']
            tentative_g_score = g_score[current] + distance
            if tentative_g_score < g_score.get(neighbor, float('inf')):
                came_from[neighbor] = current
                g_score[neighbor] = tentative_g_score
                f_score[neighbor] = tentative_g_score + manhattan_distance(coords[neighbor], coords[goal])
                heapq.heappush(open_set, (f_score[neighbor], neighbor))
                
    return []

def main():
    conn = psycopg2.connect(**DB_PARAMS)
    cursor = conn.cursor()

    try:
        # Fetch station coordinates and edges
        coords = fetch_station_coordinates(cursor)
        G = fetch_edges(cursor)  # Fetch graph from the database

        # Fetch input station
        input_data = fetch_input_station(cursor)
        if not input_data:
            print("No input data with status 'pending' found.")
            return

        input_id, origin_station_id, destination_station_id = input_data
        
        # Execute A* algorithm
        path = a_star_algorithm(origin_station_id, destination_station_id, G, coords)

        if path:
            # Store output path
            store_output_path(cursor, input_id, path)
            cursor.execute(
                "UPDATE input_stations SET status = 'success' WHERE input_id = %s;",
                (input_id,)
            )
            # Output the path in the desired format
            print([station_id for station_id, _ in path])
        else:
            cursor.execute(
                "UPDATE input_stations SET status = 'error' WHERE input_id = %s;",
                (input_id,)
            )
            print("No path found from origin to destination.")
        
        conn.commit()

    except Exception as e:
        conn.rollback()
        print(f"An error occurred: {e}")
    
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    main()
