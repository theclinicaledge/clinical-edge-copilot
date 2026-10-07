const full = require('./ask-snapshot-rich-full.json');
const unseen = {
  id: 'rich-pressure-flow-discordance',
  question: 'CI is 1.8 while MAP is 79 on norepinephrine. Does the pressure mean flow is adequate?',
  snapshot: {
    contexts: ['Post-op'], values: {
      ciEarlier: '2.4', ciNow: '1.8', coEarlier: '4.8', coNow: '3.6', mapEarlier: '69', mapNow: '79',
      hrEarlier: '84', hrNow: '126', rhythm: 'New irregular rhythm (not confirmed)',
      cvpEarlier: '12', cvpNow: '14', svrEarlier: '1000', svrNow: '1600',
      lactateEarlier: '3.0', lactateNow: '2.4', skinTemperature: 'Warm',
      urineAmount: '60', urineIntervalValue: '2', urineIntervalUnit: 'hour',
    },
    optional: { drips: { items: [{ medication: 'norepinephrine', currentDose: '0.04', unit: 'mcg/kg/min' }] } },
  },
};
module.exports = { full, unseen };
