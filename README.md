# LaneLab

Browser prototype for LaneLab Bowling Tracker.

## GitHub Pages
This folder is ready to publish with GitHub Pages.

Upload:
- index.html
- .nojekyll

Then enable GitHub Pages from the repository's main branch and root folder.

Note: The native Google ML Kit scanner is not included in this browser-only build.

Mobile controls use `touch-action: manipulation` so rapid taps do not trigger
double-tap zoom anywhere in the app. Normal page scrolling and pinch-to-zoom
remain available.

## Browser data

The GitHub Pages build stores the bowler profile, game history, and arsenal in
the current browser's local storage. New saved games include their date, hand,
selected ball, score, and available game statistics. Existing score-only data
continues to load and is labeled with an unavailable date rather than an
invented one.

Personal Stats includes date filters, a personal high, and milestone medals at
100, 150, 200, 250, and 300. Arsenal ball details calculate only from saved
games where that ball was selected.
