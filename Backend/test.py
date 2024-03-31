import time
import pandas as pd
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.service import Service

# Function to scrape popular times from Google Maps URL using Selenium
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from bs4 import BeautifulSoup

def scrape_popular_times_selenium(url):
    """
    Scrapes the popular times status from a given URL using Selenium.

    Args:
        url (str): The URL of the webpage to scrape.

    Returns:
        str: The current status of the popular times.

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

    if current_status_element:
        current_status = current_status_element.text.strip()
        print(f'Current status: {current_status}')
        driver.quit()
        return current_status.strip()
    else:
        print('Popular times status not available')


# Read list of URLs from a text file
def read_urls_from_file(file_path):
    with open(file_path, 'r') as file:
        urls = file.readlines()
    return [url.strip() for url in urls]

# Main function to process URLs and write results to a file
def main():
    input_file = 'urls.txt'  # Change this to your input file path
    output_file = 'output.csv'  # Change this to your output file path

    urls = read_urls_from_file(input_file)
    results = []

    for url in urls:
        status = scrape_popular_times_selenium(url)
        results.append({'URL': url, 'Popular Times': status})

    df = pd.DataFrame(results)
    df.to_csv(output_file, index=False)
    print(f"Scraping completed. Results saved to '{output_file}'.")



if __name__ == "__main__":
    main()
