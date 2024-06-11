// journeyTracker.js
import Geolocation from 'react-native-geolocation-service';
import PushNotification from 'react-native-push-notification';

const getThirdLastStation = (intervals) => {
  return intervals[intervals.length - 3];
};

const trackUserLocation = (destinationStation, onProximity, onArrival, onStationUpdate, intervals, stations) => {
  let currentIntervalIndex = 0;

  Geolocation.watchPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      const distance = getDistanceFromLatLonInKm(latitude, longitude, destinationStation.latitude, destinationStation.longitude);

      if (currentIntervalIndex < intervals.length - 1) {
        const currentStation = stations.find(station => station.id === intervals[currentIntervalIndex]);
        const nextStation = stations.find(station => station.id === intervals[currentIntervalIndex + 1]);

        onStationUpdate(currentStation?.station_name, nextStation?.station_name);

        const nextStationDistance = getDistanceFromLatLonInKm(latitude, longitude, nextStation.latitude, nextStation.longitude);
        if (nextStationDistance < 0.1) {
          currentIntervalIndex++;
        }
      }

      if (distance < 0.5) {
        onProximity();
      }

      if (distance < 0.1) {
        onArrival();
      }
    },
    (error) => {
      console.error(error);
    },
    {
      enableHighAccuracy: true,
      distanceFilter: 10,
      interval: 10000,
    }
  );
};

const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

const deg2rad = (deg) => {
  return deg * (Math.PI / 180);
};

const showNotification = (title, message) => {
  PushNotification.localNotification({
    channelId: "langkah-channel",
    title: title,
    message: message,
  });
};

export const startJourneyTracking = (intervals, stations, onStationUpdate, onComplete) => {
  const thirdLastStationId = getThirdLastStation(intervals);
  const thirdLastStation = stations.find(station => station.id === thirdLastStationId);

  if (!thirdLastStation) {
    console.error("Third last station not found.");
    return;
  }

  trackUserLocation(
    thirdLastStation,
    () => showNotification("Langkah App", "You are approaching your destination"),
    () => {
      showNotification("Langkah App", "You have arrived at your destination");
      onComplete();
    },
    onStationUpdate,
    intervals,
    stations
  );
};
