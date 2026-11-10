# Community Bingo

A simple, browser-based bingo caller and pattern card for community games.

**Play the app:** [Netlify](https://bingo-balls-app.netlify.app/) · [Vercel](https://community-bingo.vercel.app/)

## Features

- Track calls across the standard 75-ball B-I-N-G-O ranges.
- Enter a ball by number (for example, `52`) or with its letter (for example, `G-52`).
- See the current call, called-number history, and the number of balls drawn.
- Mark cells on a 5×5 pattern card; its center free space is pre-marked.
- Keep the selected pattern across page reloads. Starting a new game resets the calls without clearing the pattern.

## Run locally

The app is a static website with no build step or dependencies. Open `index.html` in a browser, or serve the project directory locally:

```sh
python3 -m http.server 8000
```

Then visit [http://localhost:8000](http://localhost:8000).

## Project files

- `index.html` — page structure and controls
- `style.css` — layout and visual styles
- `script.js` — ball tracking and pattern-card behavior
