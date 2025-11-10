export const environment = {
  production: false,
  apiUrl: 'http://localhost:3010', // URL base para desarrollo
  cloudinary: {
    cloudName: 'cura-medical-hn', // Deberás crear esta cuenta en cloudinary.com
    uploadPreset: 'cura_uploads'   // Preset sin firma para simplificar MVP
  },
  googleMaps: {
    apiKey: 'AIzaSyAZqlB-Nu9RA7T-cnwgKhEPJ2nES5NEp2I', // Reemplazar con tu API Key de Google Maps
    defaultCenter: {
      lat: 14.0723, // Tegucigalpa, Honduras
      lng: -87.1921
    },
    defaultZoom: 13
  }
};

