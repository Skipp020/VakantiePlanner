# Huisstijl — Global Media

Samenvatting van het Global Media brandbook, zoals aangeleverd door de klant
(kleurenpalet + typografie). Basis voor de Tailwind-tokens en globale
stijlen van deze app.

## Kleurenpalet

Alleen deze vijf kleuren worden gebruikt, in alle externe communicatie:

| Naam               | Hex       | RGB              | CMYK              |
|--------------------|-----------|------------------|-------------------|
| Global Main Blue   | `#195AA6` | R25 G90 B166     | C92 M64 Y1 K0     |
| Global Mid Blue    | `#0B78BE` | R11 G120 B190    | C84 M45 Y0 K0     |
| Global Dark Blue   | `#1B4B89` | R27 G75 B137     | C97 M73 Y16 K3    |
| Global Bright Blue | `#5BC4E8` | R91 G196 B232    | C68 M0 Y6 K0      |
| Global Grey        | `#575756` | R87 G87 B86      | C59 M49 Y49 K42   |

> Bron-typo: het brandbook noteert Main Blue als `#195AA6Z` — de `Z` is
> overduidelijk een tikfout, de RGB/CMYK-waarden kloppen met `#195AA6`.

Toepassing in de planner:
- **Main Blue** — primaire actie-kleur (knoppen, actieve staat, focus).
- **Dark Blue** — koppen, tekst met nadruk, "bevestigd"-status in het grid.
- **Mid Blue** — secundaire accenten, links, "optie"-status in het grid.
- **Bright Blue** — lichte accenten/hover-states, nooit als tekstkleur (te
  weinig contrast op wit).
- **Grey** — lichaamstekst, randen, neutrale UI-elementen.

## Typografie

- **Century Gothic** is het voorgeschreven lettertype.
  - **Bold** → koppen.
  - **Regular** → lopende tekst.
- Century Gothic is een propriëtair PC/Office-lettertype (Monotype); er is
  geen vrije weblicentie en het zit niet in Google Fonts. Deze app gebruikt
  daarom een CSS font-stack die Century Gothic gebruikt **als die al op het
  systeem van de bezoeker staat** (standaard aanwezig op Windows/met
  MS Office), met **Poppins** (geometrische sans-serif, qua vorm dicht bij
  Century Gothic) als self-hosted webfallback via `next/font/google`:

  ```css
  font-family: "Century Gothic", var(--font-poppins), "Segoe UI", sans-serif;
  ```

  Heeft Global Media een licentie voor een zelf te hosten Century
  Gothic-webfont, dan kan die als `@font-face` toegevoegd worden ter
  vervanging van Poppins — dan is deze fallback niet meer nodig.

## Logo

Het Global Media-logo (afgerond blauw vierkant met een "g"-icoon, met
daaronder het woordmerk "global") is aangeleverd als `Global Media.png`
en staat in de app op twee plekken:

- `public/logo.png` — het volledige, originele logo (icoon + woordmerk).
- `public/logo-mark.png` en `app/icon.png` — een uitgesneden, vierkante
  versie van alleen het "g"-icoon (zonder woordmerk). Op klein formaat
  (header, favicon) wordt het woordmerk "global" anders onleesbaar en
  vervormt het geheel; het icoon alleen blijft daar wel herkenbaar.
  `app/icon.png` wordt door Next.js automatisch als favicon gebruikt;
  `logo-mark.png` staat naast de app-titel in de header.

Er zijn geen expliciete logo-gebruiksregels (minimale marge,
minimumgrootte, verboden bewerkingen) aangeleverd in het
brandbook-fragment. Zodra die beschikbaar zijn, vul ik deze sectie aan.

## Stijlprincipes

Uit het aangeleverde fragment volgen twee harde regels:
1. Gebruik uitsluitend de vijf paletkleuren hierboven in externe
   communicatie — geen andere kleuren toevoegen.
2. Century Gothic Bold voor koppen, Century Gothic Regular voor body-tekst;
   geen ander lettertype mengen.
