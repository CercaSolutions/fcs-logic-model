# FCS Logic Model

An interactive version of the Focused Community Strategies logic model.

It follows the layout of the Purpose Built digital logic models: an area filter bar and six columns read left to right, partners, programs, measures, what needs to be true, community indicators, and the desired result. Click a partner group to see who is in it, a partner to see the programs they support, or a program to narrow the page to its measures.

It is a static web page: plain HTML, CSS and JavaScript, with no build step and no framework, hosted on GitHub Pages.

## Changing the content

The content lives in a Google Sheet, **FCS - Logic Model Data**. Edit the sheet and the page shows the change the next time it is opened, usually within a few minutes. The sheet's "How to edit" tab explains each tab and the rules that keep the page working.

The sheet must stay shared as "Anyone with the link can view." If the page can't read it, it falls back to the backup copy in `data/logic-model.js`, which is only as current as its last refresh.

## What's here

| Path | What it is |
|---|---|
| `index.html` | The page |
| `assets/sheet-loader.js` | Reads the Google Sheet. The sheet's id and tab ids are at the top |
| `assets/app.js` | Draws the page |
| `assets/styles.css` | Look and layout, from the FCS Brand Guide |
| `data/logic-model.js` | Backup copy of the content, and the page's fixed labels |
| `assets/fcs-logo-white.png`, `assets/fcs-logo-color.png` | FCS logos |

To preview locally, open `index.html` in a browser. Add `?source=local` to the address to use the backup copy instead of the sheet.

## Moving the sheet

If the sheet is copied to another Drive, put the new sheet's id in `assets/sheet-loader.js`, and the new tab ids (the number after `gid=` in each tab's address).
