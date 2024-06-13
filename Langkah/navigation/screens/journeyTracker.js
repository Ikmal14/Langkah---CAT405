// journeyTracker.js
import Geolocation from 'react-native-geolocation-service';
import PushNotification from 'react-native-push-notification';
import { useEffect } from 'react';

PushNotification.createChannel(
  {
    channelId: "langkah-channel", // (required)
    channelName: "Langkah Notifications", // (required)
    channelDescription: "A channel to categorise your notifications", // (optional) default: undefined.
    playSound: false, // (optional) default: true
    soundName: "default", // (optional) See `soundName` parameter of `localNotification` function
    importance: 4, // (optional) default: 4. Int value of the Android notification importance
    vibrate: true, // (optional) default: true. Creates the default vibration pattern if true.
  },
  (created) => console.log(`createChannel returned '${created}'`) // (optional) callback returns whether the channel was created, false means it already existed.
);

const getSecondLastStation = (intervals) => {
  return intervals[intervals.length - 1];
};

const trackUserLocation = (secondLastStation, onProximity, onStationUpdate, intervals, stations, notificationSent) => {
  let currentIntervalIndex = 0;

  Geolocation.watchPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      const distanceToSecondLast = getDistanceFromLatLonInKm(latitude, longitude, secondLastStation.latitude, secondLastStation.longitude);

      if (currentIntervalIndex < intervals.length - 1) {
        const currentStation = stations.find(station => station.id === intervals[currentIntervalIndex]);
        const nextStation = stations.find(station => station.id === intervals[currentIntervalIndex + 1]);

        onStationUpdate(currentStation?.station_name, nextStation?.station_name);

        const nextStationDistance = getDistanceFromLatLonInKm(latitude, longitude, nextStation.latitude, nextStation.longitude);
        if (nextStationDistance < 0.4) {
          currentIntervalIndex++;
        }
      }

      if (!notificationSent && distanceToSecondLast < 0.2) {
        onProximity();
      }
    },
    (error) => {
      console.error(error);
    },
    {
      enableHighAccuracy: true,
      distanceFilter: 10,
      interval: 500,
    }
  );
};

const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon1 - lon2);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

const deg2rad = (deg) => {
  return deg * (Math.PI / 180);
};

export const showNotification = (title, message) => {
  console.log(`Notification Triggered: ${title} - ${message}`); // Log when notification is triggered
  PushNotification.localNotification({
    channelId: "langkah-channel",
    title: title,
    message: message,
  });
};

export const startJourneyTracking = (intervals, stations, onStationUpdate, onComplete) => {
  const secondLastStationId = getSecondLastStation(intervals);
  const secondLastStation = stations.find(station => station.id === secondLastStationId);

  if (!secondLastStation) {
    console.error("Second last station not found.");
    return;
  } else {
    console.log("Second last station found.");
    console.log(secondLastStation.station_name);
  }

  let notificationSent = false;

  trackUserLocation(
    secondLastStation,
    () => {
      if (!notificationSent) {
        showNotification("Langkah App", "You are approaching one station before your destination");
        notificationSent = true;
        onComplete();
      }
    },
    onStationUpdate,
    intervals,
    stations,
    notificationSent
  );
};
