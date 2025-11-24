import bikeImg from '../assets/images/vehicles/two-wheeler.png';
import autoImg from '../assets/images/vehicles/three-wheeler.png';
import truckImg from '../assets/images/vehicles/truck.png';
import bularaImg from '../assets/images/vehicles/bulara.png';
import tata407Img from '../assets/images/vehicles/tata-407.png';
import containerImg from '../assets/images/vehicles/truck.png';

export const VEHICLE_TYPES = [
  { 
    type: 'TwoWheeler',
    nameKey: 'vehicle_bike',
    capacityKey: 'capacity_20kg',
    rateKey: 'rate_60_2km',
    img: bikeImg,
    rate: 10,
    rateFor2Km: 20,
    available: true,
    comingSoon: false 
  },

  { 
    type: 'ThreeWheeler',
    nameKey: 'vehicle_auto',
    capacityKey: 'capacity_200kg',
    rateKey: 'rate_80_2km',
    img: autoImg,
    rate: 20,
    rateFor2Km: 40,
    available: true,
    comingSoon: false 
  },

  { 
    type: 'Truck',
    nameKey: 'vehicle_truck',
    capacityKey: 'capacity_1200kg',
    rateKey: 'rate_120_2km',
    img: truckImg,
    rate: 40,
    rateFor2Km: 80,
    available: true,
    comingSoon: false 
  },

  { 
    type: 'Pickup9ft',
    nameKey: 'vehicle_bulara',
    capacityKey: 'capacity_1700kg',
    rateKey: 'rate_350_2km',
    img: bularaImg,
    rate: 175,
    rateFor2Km: 350,
    available: true,
    comingSoon: false 
  },

  { 
    type: 'Tata407',
    nameKey: 'vehicle_tata407',
    capacityKey: 'capacity_2500kg',
    rateKey: 'rate_600_2km',
    img: tata407Img,
    rate: 300,
    rateFor2Km: 600,
    available: true,
    comingSoon: false 
  },

  {
    type: 'ContainerTruck',
    nameKey: 'vehicle_container',
    capacityKey: 'capacity_5000kg',
    rateKey: 'rate_700_2km',
    img: containerImg,  
    rate: 80,
    rateFor2Km: 160,
    available: false,
    comingSoon: true
  },
];

export const getVehicleByType = (t) =>
  VEHICLE_TYPES.find(v => v.type === t) || VEHICLE_TYPES[0];
