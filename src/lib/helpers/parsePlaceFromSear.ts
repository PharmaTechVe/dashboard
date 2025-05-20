// utils/parsePlaceFromSearchBox.ts

import { Dispatch, SetStateAction } from 'react';

interface ParsePlaceParams {
  ref: google.maps.places.SearchBox | null;
  setLatitude: Dispatch<SetStateAction<number>>;
  setLongitude: Dispatch<SetStateAction<number>>;
  setAddress: Dispatch<SetStateAction<string>>;
}

export const parsePlaceFromSearchBox = ({
  ref,
  setLatitude,
  setLongitude,
  setAddress,
}: ParsePlaceParams) => {
  if (!ref) {
    console.warn('Referencia de SearchBox no disponible');
    return;
  }

  const places = ref.getPlaces();

  if (!places || places.length === 0) {
    console.warn('No se encontraron lugares');
    return;
  }

  const place = places[0];

  if (place.geometry?.location) {
    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();

    setLatitude(lat);
    setLongitude(lng);
    setAddress(place.formatted_address || '');
  } else {
    console.warn('Lugar sin coordenadas válidas');
  }
};
