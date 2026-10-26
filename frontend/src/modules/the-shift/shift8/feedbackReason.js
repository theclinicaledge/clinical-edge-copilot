import { CHOICES } from './data.js';

export function reasoning(moment, answer) {
  if (moment === 'analysis') return CHOICES.analysis[0].feedback;
  if (moment === 'restartCPR') return CHOICES.restartCPR[0].feedback;
  if (moment === 'leader') return answer.id === 'leave' ? 'Dr. Okafor needs your knowledge of Harold while the team takes assigned roles.' : 'One leader, said out loud. Your next role is assigned explicitly rather than leaving two people directing the response.';
  if (moment === 'marcus') return 'The request assigns Marcus a specific task and prepares the next compressor; Beth handles family in this scenario.';
  if (moment === 'priya' && answer.id === 'stay') return "You're the free pair of hands, and the cart is what's missing.";
  if (moment === 'page' && answer.id === 'nothing') return 'The request still has no owner. A request is not an acknowledgment or a completed page.';
  if (moment === 'clearance') return CHOICES.clearance[0].feedback;
  if (moment === 'mask') return CHOICES.mask[0].feedback;
  if (moment === 'safety') return 'A warning has to be heard. The team must resolve the contact before Priya delivers the shock.';
  if (moment === 'clear') return 'Clearance must be checked before the scripted shock. A prompted check is not credit for your original unchecked choice.';
  if (moment === 'rhythm') return 'The rhythm check pauses compressions briefly; Marcus compresses during charging and clears before the shock.';
  if (moment === 'duplicate') return 'Helping with an already assigned task would leave your defibrillator role uncovered in this variation.';
  if (moment === 'relief') return 'Naming the next compressor before the switch keeps the team coordinated.';
  return answer.feedback || answer.text;
}
