async function fetchLocationData() {
    try {
        const response = await fetch('https://api.example.com/locations');
        if (!response.ok) {
            throw new Error('Failed to fetch location data');
        }
        const data = await response.json();
        // Process the fetched location data here
        console.log(data);
    } catch (error) {
        console.error(error);
    }
}

fetchLocationData();