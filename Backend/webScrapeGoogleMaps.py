from ssl import Options
import time
import pandas as pd
import concurrent.futures
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from urllib.parse import urlparse
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.options import Options as ChromeOptions


# Function to scrape popular times from Google Maps URL using Selenium
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from bs4 import BeautifulSoup
import psycopg2

def connect_to_postgres():
    """
    Connects to a PostgreSQL database.

    Args:
        None

    Returns:
        psycopg2.connection: The connection object.

    Raises:
        None
    """
    conn = psycopg2.connect(
        host="localhost",
        database="mapData",
        user="postgres",
        password="1234"
    )
    return conn


def scrape_data(data_tuple):
    """
    Scrapes the popular times status and station name from a given URL using Selenium.

    Args:
        url (str): The URL of the webpage to scrape.

    Returns:
        tuple: A tuple containing the station name and the current status of the popular times.

    Raises:
        None
    """
    options = webdriver.ChromeOptions()
    options.add_argument('--headless')  # Run in headless mode (no browser window)
    service = Service('C:/webdrivers/chromedriver.exe')  # Specify the path to your chromedriver executable
    driver = webdriver.Chrome(service=service, options=options)

    station_id, url = data_tuple  # Unpack the tuple into station_id and url

    driver.get(url)
    time.sleep(5)  # Wait for page to load (adjust as needed)

    soup = BeautifulSoup(driver.page_source, 'html.parser')
    # Find the element containing the current status
    current_status_element = soup.find('div', class_='UgBNB')
    station_name_element = soup.find('h1', class_='DUwDvf lfPIob')

    if current_status_element and station_name_element:
        current_status = current_status_element.text.strip()
        station_name = station_name_element.text.strip()
        print(f'Station Name: {station_name}')
        print(f'Current status: {current_status}')
        driver.quit()
        return station_id, station_name, current_status
    else:
        print('Data not available')
        driver.quit()
        return station_id, None, None


# Function to fetched data from the database into lists for references for other functions
def fetch_data_from_postgres():
    """
    Fetches the data from a PostgreSQL database.

    Args:
        None

    Returns:
        list: A list of tuples containing the ID data from the merged_mrt_lrt table.
        list: A list of tuples containing the ID and station_url data from the stations_link table.

    Raises:
        None
    """
    conn = connect_to_postgres()
    cursor = conn.cursor()

    # Initialize the rows_id and rows_url variables
    rows_id = []
    rows_url = []


    # Fetch id data from the merged_mrt_lrt table and store into a list
    cursor.execute("SELECT id FROM merged_mrt_lrt")
    merged_id = cursor.fetchall()
    merged_id.sort()

    # Fetch id and station_url data from the stations_link table and store into an array
    cursor.execute("SELECT id, station_url FROM stations_link")
    rows = cursor.fetchall()
    rows_id = [row[0] for row in rows]
    rows_url = [row[1] for row in rows]

     # Remove """" from the urls list
    rows_url = [row.replace('"', '') for row in rows_url]

    # Store the fetched data into a list of tuples
    fetched_data = list(zip(rows_id, rows_url))

    cursor.close()
    conn.close()

    return merged_id, fetched_data

def is_valid_url(url):
    try:
        result = urlparse(url)
        return all([result.scheme, result.netloc])
    except ValueError:
        return False



    # Function to save scraped data into an existing table in PostgreSQL
def save_data_to_postgres(data):
    """
    Saves the scraped data into an existing table in PostgreSQL.

    Args:
    data (list): The list of tuples containing the scraped data.

    Returns:
        None

    Raises:
        None
    """
    # get a connection to the PostgreSQL database from the function
    conn = connect_to_postgres()
    cursor = conn.cursor()

    # Get station IDs and URLs from data
    data_tuples = [(row[0], row[2]) for row in data]

    # Insert the scraped data into the table
    for row in data_tuples:
        station_id = row[0]
        current_status = row[1]
        if current_status is None:
            current_status = 'Not Available'  # Replace 'default_value' with your actual default value
        cursor.execute("UPDATE merged_mrt_lrt SET crowd_status = %s WHERE id = %s", (current_status, station_id))

    conn.commit()
    cursor.close()
    conn.close()

    return None






# Main function to process URLs and write results to a file
import concurrent.futures
import pandas as pd

def main():
    """
    Main function to scrape data from URLs, save results to a CSV file, and PostgreSQL.
    """

    start_time = time.time()  # Add this line to initialize the start_time variable

    output_file = 'output.csv'  # Change this to your output file path

    # Get urls from fetch_data_from_postgres function
    _, data = fetch_data_from_postgres()

    # Get station IDs and URLs from data
    data_tuples = [(row[0], row[1]) for row in data]


   # Scrape data from URLs using concurrent threads
    with concurrent.futures.ThreadPoolExecutor() as executor:
        results = executor.map(scrape_data, data_tuples)
        results = list(results)

    # Convert results to a DataFrame and save to a CSV file
    df = pd.DataFrame(results, columns=['Station ID', 'Station Name', 'Status'])
    df.to_csv(output_file, index=False)

    # Save the scraped data to PostgreSQL
    save_data_to_postgres(results)

    # Time to complete the scraping process
    end_time = time.time()
    execution_time = end_time - start_time
    print(f"Scraping process completed in {execution_time} seconds.")

    print(f"Scraping completed. Results saved to '{output_file}' and PostgreSQL.")


if __name__ == "__main__":
    main()
