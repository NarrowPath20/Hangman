const form = document.querySelector('#setup-form');
const select = document.querySelector('#phrase-select');
const custom = document.querySelector('#custom-phrase');
const setup = document.querySelector('.setup');
const game = document.querySelector('#game');
const phraseDisplay = document.querySelector('#phrase');
const keyboard = document.querySelector('#keyboard');
const status = document.querySelector('#status');
const maxMistakes = 6;
let phrase = '';
let guesses = new Set();
let mistakes = 0;
let playing = false;

const themeToggle = document.querySelector('#theme-toggle');
const colorPicker = document.querySelector('#hangman-color');
const faceSelect = document.querySelector('#face-select');
const faceFile = document.querySelector('#face-file');
const imageStatus = document.querySelector('#face-image-status');
const facePreview = document.querySelector('#face-preview');
let faceImageUrl = '';
let imageLoadVersion = 0;
const faces = {
  none: '',
  smile: '<path d="M147 60 v2 M163 60 v2 M145 70 Q155 82 165 70"/>',
  wink: '<path d="M144 61 l6 2 M162 60 v2 M146 71 Q156 80 165 69"/>',
  surprised: '<circle cx="147" cy="61" r="2"/><circle cx="163" cy="61" r="2"/><ellipse cx="155" cy="74" rx="4" ry="5"/>',
  cool: '<path d="M137 59 H173 M141 59 v7 h10 v-7 M159 59 v7 h10 v-7 M151 62 h8 M148 74 Q155 79 163 72"/>',
  tongue: '<path d="M146 59 v3 M164 59 v3 M144 69 Q155 76 167 69 M154 73 v5 Q159 84 163 78 v-6 M159 75 v3"/>'
};
const faceDrawing = document.createElementNS('http://www.w3.org/2000/svg', 'g');
faceDrawing.classList.add('face');
document.querySelector('.person').append(faceDrawing);
let preferences = {};
try { preferences = JSON.parse(localStorage.getItem('hangman-appearance')) || {}; } catch { /* Storage may be unavailable for local files. */ }
if (!preferences || typeof preferences !== 'object') preferences = {};
let darkMode = typeof preferences.dark === 'boolean' ? preferences.dark : window.matchMedia('(prefers-color-scheme: dark)').matches;
if (/^#[0-9a-f]{6}$/i.test(preferences.color)) colorPicker.value = preferences.color;
if (Object.hasOwn(faces, preferences.face)) faceSelect.value = preferences.face;

function updateFace() {
  faceDrawing.innerHTML = faces[faceSelect.value] || '';
  if (faceSelect.value === 'image' && faceImageUrl) {
    const clip = document.createElementNS('http://www.w3.org/2000/svg', 'clipPath');
    clip.setAttribute('id', 'face-image-clip');
    clip.setAttribute('clipPathUnits', 'userSpaceOnUse');
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', '155');
    circle.setAttribute('cy', '66');
    circle.setAttribute('r', '18');
    clip.append(circle);
    faceDrawing.append(clip);
    const image = document.createElementNS('http://www.w3.org/2000/svg', 'image');
    image.setAttribute('href', faceImageUrl);
    image.setAttribute('x', '137');
    image.setAttribute('y', '48');
    image.setAttribute('width', '36');
    image.setAttribute('height', '36');
    image.setAttribute('preserveAspectRatio', 'xMidYMid slice');
    image.setAttribute('clip-path', 'url(#face-image-clip)');
    faceDrawing.append(image);
  }
  faceDrawing.toggleAttribute('hidden', mistakes === 0 || faceSelect.value === 'none');
}

function applyAppearance() {
  document.documentElement.dataset.theme = darkMode ? 'dark' : 'light';
  document.documentElement.style.setProperty('--hangman-color', colorPicker.value);
  const themeAction = darkMode ? 'Switch to light mode' : 'Switch to dark mode';
  themeToggle.setAttribute('aria-label', themeAction);
  themeToggle.title = themeAction;
  document.querySelector('#sun-icon').toggleAttribute('hidden', !darkMode);
  document.querySelector('#moon-icon').toggleAttribute('hidden', darkMode);
  updateFace();
}

function saveAppearance() {
  applyAppearance();
  try { localStorage.setItem('hangman-appearance', JSON.stringify({ dark: darkMode, color: colorPicker.value, face: faceSelect.value })); } catch { /* Keep controls working without storage. */ }
}

themeToggle.addEventListener('click', () => { darkMode = !darkMode; saveAppearance(); });
colorPicker.addEventListener('input', saveAppearance);
faceSelect.addEventListener('change', () => {
  document.querySelector('#face-upload').hidden = faceSelect.value !== 'image';
  document.querySelector('#form-error').textContent = '';
  saveAppearance();
});

function clearFaceImage() {
  if (faceImageUrl) URL.revokeObjectURL(faceImageUrl);
  faceImageUrl = '';
  facePreview.removeAttribute('src');
  document.querySelector('#face-preview-row').hidden = true;
  updateFace();
}

faceFile.addEventListener('change', async () => {
  const version = ++imageLoadVersion;
  const file = faceFile.files[0];
  clearFaceImage();
  imageStatus.textContent = '';
  if (!file) return;
  if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type) || file.size > 5 * 1024 * 1024) {
    imageStatus.textContent = 'Choose a JPG, PNG, WebP, or GIF image no larger than 5 MB.';
    faceFile.value = '';
    return;
  }
  const url = URL.createObjectURL(file);
  imageStatus.textContent = 'Loading your face image...';
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    if (version !== imageLoadVersion) { URL.revokeObjectURL(url); return; }
    faceImageUrl = url;
    facePreview.src = url;
    document.querySelector('#face-preview-row').hidden = false;
    imageStatus.textContent = 'Your face image is ready!';
    document.querySelector('#form-error').textContent = '';
    updateFace();
  } catch {
    URL.revokeObjectURL(url);
    if (version !== imageLoadVersion) return;
    imageStatus.textContent = 'This image could not be opened. Please choose another image.';
    faceFile.value = '';
  }
});

document.querySelector('#remove-face').addEventListener('click', () => {
  imageLoadVersion++;
  clearFaceImage();
  faceFile.value = '';
  imageStatus.textContent = 'Image removed. Choose another image or a different face style.';
});
applyAppearance();

select.addEventListener('change', () => {
  document.querySelector('#custom-field').hidden = select.value !== 'custom';
  document.querySelector('#form-error').textContent = '';
  if (select.value === 'custom') custom.focus();
});

form.addEventListener('submit', (event) => {
  event.preventDefault();
  if (faceSelect.value === 'image' && !faceImageUrl) {
    document.querySelector('#form-error').textContent = 'Choose a face image and wait for its preview, or select a different face style.';
    faceFile.focus();
    return;
  }
  const value = (select.value === 'custom' ? custom.value : select.value).trim();
  if (!/[a-z]/i.test(value) || /[^\x20-\x7E\s]/.test(value) || value.length > 100) {
    document.querySelector('#form-error').textContent = 'Please enter a phrase with at least one A–Z letter. Use English letters, spaces, numbers, and standard punctuation (up to 100 characters).';
    return;
  }
  phrase = value.toUpperCase().replace(/\s+/g, ' ');
  guesses = new Set();
  mistakes = 0;
  playing = true;
  custom.value = '';
  setup.hidden = true;
  game.hidden = false;
  keyboard.replaceChildren();
  for (const letter of 'ABCDEFGHIJKLMNOPQRSTUVWXYZ') {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'key';
    button.textContent = letter;
    button.addEventListener('click', () => guess(letter));
    keyboard.append(button);
  }
  status.className = '';
  status.textContent = 'Choose a letter to get started.';
  render();
  keyboard.querySelector('button').focus();
});

function render() {
  phraseDisplay.replaceChildren();
  const accessibleWords = [];
  for (const word of phrase.split(' ')) {
    const group = document.createElement('span');
    group.className = 'word';
    const accessibleLetters = [];
    for (const character of word) {
      const isLetter = /^[A-Z]$/.test(character);
      const visible = !isLetter || guesses.has(character) || !playing;
      const tile = document.createElement('span');
      tile.className = 'letter' + (!isLetter ? ' punctuation' : '') + (!playing && isLetter && !guesses.has(character) ? ' revealed' : '');
      tile.textContent = visible ? character : '';
      tile.setAttribute('aria-hidden', 'true');
      accessibleLetters.push(visible ? character : 'blank');
      group.append(tile);
    }
    accessibleWords.push(accessibleLetters.join(' '));
    phraseDisplay.append(group);
  }
  phraseDisplay.setAttribute('aria-label', accessibleWords.join(', next word, '));
  document.querySelector('#remaining').textContent = maxMistakes - mistakes;
  updateFace();
  document.querySelector('#drawing-title').textContent = `Hangman: ${mistakes} of ${maxMistakes} incorrect guesses`;
  document.querySelectorAll('[data-part]').forEach((part, index) => { part.hidden = index >= mistakes; part.toggleAttribute('hidden', index >= mistakes); });
  const dots = document.querySelector('#chance-dots');
  dots.replaceChildren();
  for (let i = 0; i < maxMistakes; i++) {
    const dot = document.createElement('span');
    if (i >= maxMistakes - mistakes) dot.className = 'spent';
    dots.append(dot);
  }
  for (const button of keyboard.children) {
    const letter = button.textContent;
    button.disabled = guesses.has(letter) || !playing;
    button.className = 'key' + (guesses.has(letter) ? phrase.includes(letter) ? ' correct' : ' wrong' : '');
    button.setAttribute('aria-label', letter + (guesses.has(letter) ? phrase.includes(letter) ? ', in the phrase' : ', not in the phrase' : ''));
  }
}

function guess(letter) {
  if (!playing || guesses.has(letter)) return;
  guesses.add(letter);
  const correct = phrase.includes(letter);
  if (!correct) mistakes++;
  const won = [...phrase].every(character => !/[A-Z]/.test(character) || guesses.has(character));
  playing = !won && mistakes < maxMistakes;
  status.className = won ? 'win' : !playing ? 'loss' : '';
  status.textContent = won ? 'You got it! The phrase is complete. Play again with a new phrase.' : !playing ? `Out of guesses! The phrase was “${phrase}”. Try a new game!` : correct ? `Good guess! ${letter} is in the phrase.` : `${letter} is not in the phrase. ${maxMistakes - mistakes} incorrect guesses left.`;
  render();
}

document.querySelector('#new-game').addEventListener('click', () => {
  playing = false;
  phrase = '';
  guesses.clear();
  game.hidden = true;
  setup.hidden = false;
  document.querySelector('#form-error').textContent = '';
  select.focus();
});

document.addEventListener('keydown', (event) => {
  if (!playing || event.ctrlKey || event.altKey || event.metaKey || event.repeat || /^(INPUT|SELECT|TEXTAREA)$/.test(event.target.tagName)) return;
  if (/^[a-z]$/i.test(event.key)) {
    event.preventDefault();
    guess(event.key.toUpperCase());
  }
});
