export const PATIENT_POSITIONS = [
  {
    id: 'supine',
    labelKey: 'supine',
    image: require('../../assets/positions/supine.png'),
    emoji: '🛌',
    color: '#E3F2FD', // Light Blue
  },
  {
    id: 'lateral_right',
    labelKey: 'lateral_right',
    image: require('../../assets/positions/lateral_right.png'),
    emoji: '➡️',
    color: '#F1F8E9', // Light Green
  },
  {
    id: 'lateral_left',
    labelKey: 'lateral_left',
    image: require('../../assets/positions/lateral_left.png'),
    emoji: '⬅️',
    color: '#FFF3E0', // Light Orange
  },
  {
    id: 'sims',
    labelKey: 'sims',
    image: require('../../assets/positions/sims.png'),
    emoji: '🌀',
    color: '#F3E5F5', // Light Purple
  },
  {
    id: 'prone',
    labelKey: 'prone',
    image: require('../../assets/positions/prone.png'),
    emoji: '🔽',
    color: '#E8EAF6', // Light Indigo
  },
  {
    id: 'semi_fowler',
    labelKey: 'semi_fowler',
    image: require('../../assets/positions/semi_fowler.png'),
    emoji: '📐',
    color: '#E0F2F1', // Light Teal
  },
  {
    id: 'fowler',
    labelKey: 'fowler',
    image: require('../../assets/positions/fowler.png'),
    emoji: '🪑',
    color: '#FFFDE7', // Light Yellow
  },
];

export const getPositionByLabel = (label) => {
  return PATIENT_POSITIONS.find(p => p.id === label) || null;
};
