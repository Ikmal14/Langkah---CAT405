import time
import pandas as pd
import concurrent.futures
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.service import Service

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
        database="mrt_lrt",
        user="postgres",
        password="password"
    )
    return conn

def scrape_data(url):
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

    driver.get(url)
    # time.sleep(5)  # Wait for page to load (adjust as needed)

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
        return station_name, current_status
    else:
        print('Data not available')
        driver.quit()
        return None, None



# Read list of URLs from a text file
def read_urls_from_file(file_path):
    with open(file_path, 'r') as file:
        urls = file.readlines()
    return [url.strip() for url in urls]

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

    # Get the list of station ID's from the database
    cursor.execute("SELECT id FROM merged_mrt_lrt")
    rows = cursor.fetchall()

    # Update the crowd status based on the station ID
    update_query = "UPDATE merged_mrt_lrt SET crowd_status = %s WHERE id = %s"

    for item in data:
        station_name, crowd_status = item
        cursor.execute(update_query, (crowd_status, station_name))

    conn.commit()
    cursor.close()
    conn.close()





# Main function to process URLs and write results to a file
import concurrent.futures
import pandas as pd

def main():
    """
    Main function to scrape data from URLs, save results to a CSV file, and PostgreSQL.
    """
    input_file = 'urls.txt'  # Change this to your input file path
    output_file = 'output.csv'  # Change this to your output file path

    urls = read_urls_from_file(input_file)
    results = []

    # Scrape data from URLs using concurrent threads
    with concurrent.futures.ThreadPoolExecutor() as executor:
        results = executor.map(scrape_data, urls)
        results = list(results)

    # Convert results to a DataFrame and save to a CSV file
    df = pd.DataFrame(results)
    df.to_csv(output_file, index=False)

    # Save the scraped data to PostgreSQL
    save_data_to_postgres(results)

    print(f"Scraping completed. Results saved to '{output_file}' and PostgreSQL.")


if __name__ == "__main__":
    main()
