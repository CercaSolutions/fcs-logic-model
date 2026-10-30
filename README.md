# FCS Logic Model

An interactive version of the Focused Community Strategies logic model, built from the nine-slide pathway deck (`FCS_Logic_Model.pptx`, second draft).

It follows the layout of the Purpose Built digital logic models: an area filter bar and six columns read left to right, partners, programs, measures, what needs to be true, community indicators, and the desired result. Click a partner group to see who is in it, a partner to see the programs they support, or a program to narrow the page to its measures.

It is a static web page: plain HTML, CSS and JavaScript, with no build step and no framework. It can be hosted free on GitHub Pages.

## What's here

| Path | What it is |
|---|---|
| `index.html` | The page |
| `data/logic-model.js` | All of the content: results, community indicators, measures, programs, partners, and the dependency table |
| `assets/app.js` | Draws the page from the data file |
| `assets/styles.css` | Look and layout, from the FCS Brand Guide |
| `assets/fcs-logo-white.png`, `assets/fcs-logo-color.png` | FCS logos |

## Changing the content

Edit `data/logic-model.js`. Nothing on the page is typed in by hand, so a change there shows up everywhere.

- A new measure takes the next number in its area (EC5 after EC4) and a `status` of `now`, `later` or `held`.
- A program lists the measure IDs it `moves` today and the ones it is `proposed` for.
- A program lists its `partners` by id from the partners list. Leave it empty until FCS names one, and it shows under "Partner not named yet."
- Partner type groups are working labels and can be renamed in `partnerTypes`.
- Measure status comes from the Measures tab of `FCS Dashboard and Measures.xlsx`. Keep the two in step.

To preview locally, open `index.html` in a browser.

## Publishing

The repository is private, and the page is not published yet. A GitHub Pages site is public to anyone with the link, even from a private repository, so turn it on only once FCS has approved the content.

When it's time: Settings, Pages, deploy from the `main` branch, root folder. The page carries a `noindex` tag so search engines don't list it.
