
import { SafetyPin, WeatherData, MessItem, CampusPath } from './types';

export const CAMPUS_PINS: SafetyPin[] = [
  {
    id: '1',
    name: 'Highway Intersection',
    description: 'High-speed traffic area with frequent heavy vehicles. Use designated overpass.',
    coordinates: { x: 92.0347, y: 26.4361 },
    severity: 'Danger',
    riskType: 'Traffic Risk',
    measures: ['Use Overpass', 'Avoid Night Crossings'],
    contact: '911-EXT-SAFETY'
  },
  {
    id: '2',
    name: 'North Hostel Pathway',
    description: 'Dimly lit area reported by students. Security patrols increased.',
    coordinates: { x: 92.0360, y: 26.4380 },
    severity: 'Warning',
    riskType: 'Perimeter Risk',
    measures: ['Travel in pairs', 'Stick to lit paths'],
    contact: '911-EXT-PATROL'
  },
  {
    id: '3',
    name: 'Cafeteria Zone',
    description: 'Secure area with 24/7 lighting and surveillance.',
    coordinates: { x: 92.0330, y: 26.4350 },
    severity: 'Safe',
    riskType: 'Public Zone',
    measures: ['Emergency button available'],
    contact: '911-EXT-MAIN'
  },
  {
    id: '4',
    name: 'Main Entrance Gate',
    description: '24/7 Security checkpoint and official visitor entry.',
    coordinates: { x: 92.0310, y: 26.4305 },
    severity: 'Safe',
    riskType: 'Security Post',
    measures: ['ID check required', 'Late entry logging'],
    contact: '911-EXT-GATE'
  },
  {
    id: '5',
    name: 'Science Block A',
    description: 'Primary academic building. Contains the central First Aid station.',
    coordinates: { x: 92.0345, y: 26.4355 },
    severity: 'Info',
    riskType: 'First Aid Hub',
    measures: ['Emergency kit in Room 102', 'CCTV monitored'],
    contact: '911-EXT-MED'
  },
  {
    id: '6',
    name: 'Backyard Forest Path',
    description: 'Restricted area after 6:00 PM due to low visibility and wildlife activity.',
    coordinates: { x: 92.0385, y: 26.4375 },
    severity: 'Danger',
    riskType: 'Environmental Risk',
    measures: ['Strict curfew applied', 'Authorized personnel only'],
    contact: '911-EXT-PERIMETER'
  },
  {
    id: '7',
    name: 'Sports Arena',
    description: 'Open recreational ground. High energy zone.',
    coordinates: { x: 92.0335, y: 26.4325 },
    severity: 'Info',
    riskType: 'Recreation',
    measures: ['Floodlights active until 10 PM'],
    contact: '911-EXT-SPORTS'
  },
  {
    id: '8',
    name: 'Tech Park Intersection',
    description: 'Heavy construction activity nearby. Mind the uneven surfaces.',
    coordinates: { x: 92.0360, y: 26.4345 },
    severity: 'Warning',
    riskType: 'Construction Zone',
    measures: ['Wear protective footwear', 'Avoid shortcuts'],
    contact: '911-EXT-CONSTRUCTION'
  }
];

export const CAMPUS_PATHS: CampusPath[] = [
  {
    id: 'p1',
    name: 'Main Entrance Spine',
    type: 'Pedestrian',
    status: 'Well-lit',
    riskLevel: 'Low',
    points: [
      [26.4305, 92.0310], // Gate
      [26.4325, 92.0335], // Sports
      [26.4350, 92.0330]  // Cafeteria
    ]
  },
  {
    id: 'p2',
    name: 'Academic Connector',
    type: 'Pedestrian',
    status: 'Busy',
    riskLevel: 'Low',
    points: [
      [26.4350, 92.0330], // Cafeteria
      [26.4355, 92.0345]  // Science
    ]
  },
  {
    id: 'p3',
    name: 'Lab Corridor',
    type: 'Pedestrian',
    status: 'Well-lit',
    riskLevel: 'Low',
    points: [
      [26.4355, 92.0345], // Science
      [26.4345, 92.0360], // Tech
      [26.4361, 92.0347]  // Highway
    ]
  },
  {
    id: 'p4',
    name: 'Hostel Main Road',
    type: 'Vehicle',
    status: 'Busy',
    riskLevel: 'Moderate',
    points: [
      [26.4345, 92.0360], // Tech
      [26.4380, 92.0360]  // Hostel
    ]
  },
  {
    id: 'p5',
    name: 'Forest Shortcut',
    type: 'Pedestrian',
    status: 'Dimly-lit',
    riskLevel: 'High',
    points: [
      [26.4380, 92.0360], // Hostel
      [26.4375, 92.0385]  // Forest Path
    ]
  },
  {
    id: 'p6',
    name: 'Tech Cycle Path',
    type: 'Cycle',
    status: 'Well-lit',
    riskLevel: 'Low',
    points: [
      [26.4325, 92.0335], // Sports
      [26.4345, 92.0360]  // Tech
    ]
  }
];

export const CURRENT_WEATHER: WeatherData = {
  condition: 'Cloudy',
  temp: 24,
  humidity: 65,
  windSpeed: 12,
  isNight: false,
  lastUpdated: Date.now()
};

export const HOSTEL_MESS_MENU: MessItem[] = [
  { id: 'm1', name: 'Oatmeal & Bananas', calories: 320, protein: 12, junkScore: 0 },
  { id: 'm2', name: 'Grilled Chicken & Rice', calories: 550, protein: 35, junkScore: 2 },
  { id: 'm3', name: 'Vegetable Stir-fry', calories: 280, protein: 8, junkScore: 1 },
  { id: 'm4', name: 'Samosa Platter', calories: 450, protein: 5, junkScore: 8 },
];

export const DAILY_TASKS = [
  { id: 't1', title: 'Morning Campus Walk', time: '07:30 AM', energy: 'Medium', completed: true },
  { id: 't2', title: 'Skill Lab Session', time: '10:00 AM', energy: 'High', completed: false },
  { id: 't3', title: 'Nutrition Check-in', time: '01:30 PM', energy: 'Low', completed: false },
  { id: 't4', title: 'Evening Reflection', time: '08:00 PM', energy: 'Low', completed: false },
];

export const CONTACTS = {
  security: '100',
  medical: '102',
};
