import { QuestionItem } from '../lib/types';

export const INITIAL_QUESTIONS: QuestionItem[] = [
  {
    id: 'q1',
    type: 'reflection',
    prompt: 'What is one tiny memory of us that always makes you smile when you think of it?',
    subtitle: 'It can be as silly or as quiet as you want...',
    placeholder: 'Write your heart out here, Vijeta...',
  },
  {
    id: 'q2',
    type: 'choice',
    prompt: 'If we could teleport right now for our next dream date, where are we going?',
    subtitle: 'Choose the mood for our next escape...',
    options: [
      'A cozy mountain cabin with hot chocolate and rain on the window',
      'A quiet beach at twilight watching the waves glow',
      'A bustling European cobblestone alley tasting fresh pastries',
      'Staying right where we are, wrapped up in blankets watching our favorite show',
    ],
  },
  {
    id: 'q3',
    type: 'text',
    prompt: 'What song immediately reminds you of us?',
    subtitle: 'The one that plays in your mind when you look at me...',
    placeholder: 'E.g., our special melody, an acoustic tune, or an old classic...',
  },
  {
    id: 'q4',
    type: 'reflection',
    prompt: 'What is your biggest wish for this year as you turn a year more beautiful?',
    subtitle: 'Promise to keep it safe and work towards it together...',
    placeholder: 'A dream you want to chase, a feeling you want more of...',
  },
];
