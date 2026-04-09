export const PATIENT_POSITIONS = [
  {
    id: 'supine',
    labelKey: 'supine',
    image: require('../../assets/positions/supine.png'),
  },
  {
    id: 'lateral_right',
    labelKey: 'lateral_right',
    image: require('../../assets/positions/lateral_right.png'),
  },
  {
    id: 'lateral_left',
    labelKey: 'lateral_left',
    image: require('../../assets/positions/lateral_left.png'),
  },
  {
    id: 'sims',
    labelKey: 'sims',
    image: require('../../assets/positions/sims.png'),
  },
  {
    id: 'prone',
    labelKey: 'prone',
    image: require('../../assets/positions/prone.png'),
  },
  {
    id: 'semi_fowler',
    labelKey: 'semi_fowler',
    image: require('../../assets/positions/semi_fowler.png'),
  },
  {
    id: 'fowler',
    labelKey: 'fowler',
    image: require('../../assets/positions/fowler.png'),
  },
];

export const getPositionByLabel = (label) => {
  return PATIENT_POSITIONS.find(p => p.id === label) || null;
};
