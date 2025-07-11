export interface Location {
  coordinates: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}