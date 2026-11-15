import { supabase, isSupabaseConfigured } from './supabase';
import { BirthdayLetter, OurMelody, OpenWhenLetter, FinalSurpriseContent, HeroContent } from './types';

// ==============================================================================
// 1. HERO / HOMEPAGE CONTENT
// ==============================================================================

export const DEFAULT_HERO_CONTENT: HeroContent = {
  badgeText: 'Exclusive Digital Sanctuary • MD',
  headingPrefix: 'Happy Birthday,',
  headingName: 'Vijeta',
  subtitle: 'A private, digital world created only for you — preserving our moments, quiet laughs, unspoken thoughts, and a diary where only your heart belongs.',
  whisperQuote: '"You are My Dream come true..."',
  ctaStoryText: 'Step Into Our Story',
  ctaLetterText: 'Read Your Birthday Letter',
};

export async function fetchHeroContent(): Promise<HeroContent> {
  try {
    const raw = localStorage.getItem('md_hero_content');
    if (raw) return JSON.parse(raw);
  } catch {}
  return DEFAULT_HERO_CONTENT;
}

export async function saveHeroContent(content: HeroContent): Promise<void> {
  localStorage.setItem('md_hero_content', JSON.stringify(content));
}

// ==============================================================================
// 2. BIRTHDAY LETTER
// ==============================================================================

export const DEFAULT_BIRTHDAY_LETTER: BirthdayLetter = {
  salutation: 'Dearest Vijeta,',
  subtitle: 'On Your Special Birthday',
  photoUrl: '/images/birthday-letter-vijeta.jpg',
  paragraphs: [
    'Today isn’t just another calendar date; it is the celebration of the day the world was blessed with your kindness, your gentle warmth, and the most radiant soul I have ever known.',
    'Every time life gets noisy, thoughts of you bring an immediate calm. You make the ordinary feel poetic, you make simple conversations turn into memories, and you make me want to be the best version of myself just to see you smile.',
    'I built this little digital realm—MD (MYDREAM)—so you always have a reminder of how deeply you are cherished, appreciated, and loved. Whenever you feel tired or overwhelmed, come back to these pages and remember who you are to me: my dream, my home, and my favorite reality.',
    'May this coming year bring you all the peace, laughter, triumphs, and cozy moments your beautiful heart deserves.',
  ],
  signOffTitle: 'Always & Forever,',
  signOffName: 'Yours, with all my heart ♡',
};

export async function fetchBirthdayLetter(): Promise<BirthdayLetter> {
  try {
    const raw = localStorage.getItem('md_birthday_letter');
    if (raw) return JSON.parse(raw);
  } catch {}
  return DEFAULT_BIRTHDAY_LETTER;
}

export async function saveBirthdayLetter(letter: BirthdayLetter): Promise<void> {
  localStorage.setItem('md_birthday_letter', JSON.stringify(letter));
}

// ==============================================================================
// 3. OUR MELODY (BACKGROUND AUDIO)
// ==============================================================================

export const DEFAULT_MELODY: OurMelody = {
  title: 'Our Ambient Melody',
  artist: 'Piano Sanctuary',
  audioUrl: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=romantic-piano-112199.mp3',
  volume: 0.35,
};

export async function fetchOurMelody(): Promise<OurMelody> {
  try {
    const raw = localStorage.getItem('md_our_melody');
    if (raw) return JSON.parse(raw);
  } catch {}
  return DEFAULT_MELODY;
}

export async function saveOurMelody(melody: OurMelody): Promise<void> {
  localStorage.setItem('md_our_melody', JSON.stringify(melody));
}

// ==============================================================================
// 4. OPEN WHEN LETTERS
// ==============================================================================

export const DEFAULT_OPEN_WHEN_LETTERS: OpenWhenLetter[] = [
  {
    id: 'ow-miss-me',
    envelopeLabel: 'Open when you miss me...',
    title: 'When The Distance Feels Too Loud',
    subtitle: 'Close your eyes and breathe...',
    content: `Whenever you miss me, remember that you carry a piece of my heart everywhere you go. 
Look at the moon or into the quiet sky—we are under the exact same stars, and my thoughts are always drifting right back to you. 
I love you more than any distance could ever measure.`,
    orderIndex: 1,
  },
  {
    id: 'ow-feel-sad',
    envelopeLabel: 'Open when you feel sad...',
    title: 'A Warm Blanket For Your Heart',
    subtitle: 'You are safe and deeply cherished...',
    content: `It is okay to have quiet, heavy days. You don't always have to be strong or smile for the world. 
Wrap yourself in your coziest blanket, let yourself breathe, and remember that tomorrow is an unwritten page. 
I am right here with you, always in your corner holding your hand through the rain.`,
    orderIndex: 2,
  },
  {
    id: 'ow-cannot-sleep',
    envelopeLabel: 'Open when you cannot sleep...',
    title: 'Midnight Whispers & Sweet Dreams',
    subtitle: 'Let your racing mind rest...',
    content: `If sleep feels far away tonight, turn off the bright lights and listen to the silence. 
Think about that afternoon we couldn't stop laughing at the sillies, or picture our next quiet getaway. 
Rest your eyes, Vijeta. Tomorrow brings new sunshine, and I'll be loving you just the same.`,
    orderIndex: 3,
  },
  {
    id: 'ow-need-motivation',
    envelopeLabel: 'Open when you need motivation...',
    title: 'To The Strongest Person I Know',
    subtitle: 'Look at how far you have already come...',
    content: `I have seen the passion and grace in you, and there is genuinely nothing you cannot overcome. 
Take it one gentle step at a time. I believe in you even when you doubt yourself. 
You are brilliant, capable, and born to do wonderful things. Now go show them!`,
    orderIndex: 4,
  },
  {
    id: 'ow-want-to-smile',
    envelopeLabel: 'Open when you want to smile...',
    title: 'A Little Reason To Laugh',
    subtitle: 'Your smile lights up my whole world...',
    content: `Did you know that your smile is officially my favorite phenomenon in the universe? 
Whenever you grin, it completely restarts my day in the best possible way. 
Here is a virtual hug, an endless supply of tickles, and a reminder that you are adorably cute!`,
    orderIndex: 5,
  },
  {
    id: 'ow-how-special',
    envelopeLabel: 'Open when you need to remember how special you are...',
    title: 'My Dream Come To Life',
    subtitle: 'Never forget who you are to me...',
    content: `Out of eight billion people on this planet, there is only one Vijeta. 
Your laughter, your kindness, your gentleness, and your soul are irreplaceable treasures. 
You are not just special—you are the center of my universe, MD (MYDREAM). Never doubt your magic.`,
    orderIndex: 6,
  },
];

export async function fetchOpenWhenLetters(): Promise<OpenWhenLetter[]> {
  try {
    const raw = localStorage.getItem('md_open_when_letters');
    if (raw) return JSON.parse(raw);
  } catch {}
  return DEFAULT_OPEN_WHEN_LETTERS;
}

export async function saveOpenWhenLetters(letters: OpenWhenLetter[]): Promise<void> {
  localStorage.setItem('md_open_when_letters', JSON.stringify(letters));
}

// ==============================================================================
// 5. FINAL SURPRISE CONTENT
// ==============================================================================

export const DEFAULT_FINAL_SURPRISE: FinalSurpriseContent = {
  title: 'My Birthday Wish For You, Vijeta',
  photoUrl: '/images/final-surprise-heart.jpg',
  message: `May you always walk through this world knowing how deeply you are adored. 
May your smiles be effortless, your worries small, and your life filled with adventures that make your eyes sparkle. 
No matter where life leads us, you will always have someone right beside you, cheering for you in every chapter.`,
  signOff: 'Happy Birthday, My Dream (MD). I love you. ♡',
};

export async function fetchFinalSurprise(): Promise<FinalSurpriseContent> {
  try {
    const raw = localStorage.getItem('md_final_surprise');
    if (raw) return JSON.parse(raw);
  } catch {}
  return DEFAULT_FINAL_SURPRISE;
}

export async function saveFinalSurprise(content: FinalSurpriseContent): Promise<void> {
  localStorage.setItem('md_final_surprise', JSON.stringify(content));
}
