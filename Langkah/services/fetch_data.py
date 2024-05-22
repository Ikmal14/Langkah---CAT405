import psycopg2
import json

DB_PARAMS = {
    'dbname': 'mapData',
    'user': 'postgres',
    'password': '1234',
    'host': 'localhost',
    'port': '5432'
}

def fetch_station_coordinates(cursor):
    cursor.execute("SELECT id, latitude, longitude FROM merged_mrt_lrt;")
    coords = {row[0]: (row[1], row[2]) for row in cursor.fetchall()}
    print(f"Fetched {len(coords)} station coordinates.")
    return coords

def fetch_edges(cursor):
    cursor.execute("SELECT source_station_id, destination_station_id, distance FROM edges_lrt_mrt;")
    edges = {}
    for row in cursor.fetchall():
        if row[0] not in edges:
            edges[row[0]] = []
        edges[row[0]].append((row[1], row[2]))
    print(f"Fetched edges for {len(edges)} stations.")
    return edges

def main():
    conn = psycopg2.connect(**DB_PARAMS)
    cursor = conn.cursor()

    try:
        coords = fetch_station_coordinates(cursor)
        edges = fetch_edges(cursor)

        with open('coords.json', 'w') as f:
            json.dump(coords, f)
        with open('edges.json', 'w') as f:
            json.dump(edges, f)

        cursor.execute("DELETE FROM output_stations")
        conn.commit()
        print("Cleared output_stations table.")

    except Exception as e:
        conn.rollback()
        print(f"An error occurred: {e}")
        exit(1)
    
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    main()
