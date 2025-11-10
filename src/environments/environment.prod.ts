export const environment = {
  production: true,
  apiUrl: 'http://api.quraassist.com', // TODO: Reemplazar con la URL real del backend en producción
  cloudinary: {
    cloudName: 'cura-medical-hn',
    uploadPreset: 'cura_uploads_prod'
  },
  googleMaps: {
    apiKey: 'AIzaSyAZqlB-Nu9RA7T-cnwgKhEPJ2nES5NEp2I',
    defaultCenter: {
      lat: 14.0723,
      lng: -87.1921
    },
    defaultZoom: 13
  }
};

