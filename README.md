# Phrase Hangman

A browser-based phrase guessing game built with HTML, CSS, and JavaScript. Choose an everyday or Sunday school phrase, or enter your own for friends, family, or a class to guess.

[Play on GitHub Pages](https://narrowpath20.github.io/Hangman/) · [GitHub repository](https://github.com/NarrowPath20/Hangman)

## How to play

1. Choose a hangman color and a preset phrase, or select **Write a custom phrase** and enter your own.
2. Pick a face style: classic, smile, wink, surprised, sunglasses, tongue out, or a custom image.
3. Click **Start game**. Setup controls disappear to keep the phrase hidden.
4. Click an alphabet button or type a letter on your keyboard. Every matching letter is revealed; each incorrect guess adds a part to the hangman.
5. Complete the phrase before six incorrect guesses. Click **New game** to return to setup.

Spaces, numbers, and punctuation are shown automatically. Custom phrases support English A–Z letters and standard punctuation, must contain at least one letter, and can be up to 100 characters long. Repeated guesses do not count again.

## Appearance

- **Light and dark modes:** Use the top-right moon or sun button to switch themes. The icon indicates the mode you can switch to.
- **Hangman color:** Select a color during setup.
- **Face styles:** The selected face appears when the head is drawn after the first incorrect guess.
- **Custom face image:** Select **Custom face image**, choose a JPG, PNG, WebP, or GIF up to 5 MB, and wait for the preview. A centered face works best with the circular crop. You can remove or replace the image during setup.
- **Responsive layout:** Play on a desktop, tablet, or phone.

Theme, color, and built-in face preferences are saved in browser storage when available. The initial theme follows your system preference unless you have saved a choice.

Custom images stay in the current browser tab and are not uploaded by the app. They remain available for new games in that tab, but must be selected again after refreshing. Custom phrases are not saved to browser storage.

## Run locally

Download or clone this repository, then open `index.html` in a modern browser. No installation, build step, backend, or API key is required.

Google Fonts supplies the optional DM Sans and Outfit fonts when online. The game uses fallback fonts if those fonts are unavailable.

## Project files

| File | Purpose |
| --- | --- |
| `index.html` | Setup form, game layout, alphabet area, and SVG hangman |
| `styles.css` | Layout, responsive styling, themes, and image preview |
| `script.js` | Guessing logic, game state, appearance controls, and local image loading |

## GitHub Pages

This is a static site with `index.html`, `styles.css`, and `script.js` in the repository root. No generated build output is needed.

The play link above uses the default GitHub Pages address for `NarrowPath20/Hangman`. If you configure a custom domain, update the link here to match it. Publish site changes through the branch or workflow configured for this repository's GitHub Pages deployment.

## Customize the game

- Edit the options inside `#phrase-select` in `index.html` to add or change preset phrases.
- Edit `styles.css` to adjust colors, spacing, or typography.
- Built-in faces use SVG paths in the `faces` object in `script.js`, with matching choices in `#face-select` in `index.html`.
- The game uses six incorrect guesses, matching the six SVG elements marked `data-part`. Keep these in sync if changing the difficulty or drawing.
