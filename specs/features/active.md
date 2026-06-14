# Active Feature: SEO and Google Visibility

## Status

Active

## Goal

Improve the Google visibility of the live Tic-Tac-Toe game at:

https://ttt.abuhurarrah.com/

The page should be crawlable, indexable, human-written, and clearly connected to the creator domain:

https://abuhurarrah.com/

## SEO Positioning

### Primary Keyword

tic tac toe online

### Secondary Keywords

- play tic tac toe online
- free tic tac toe game
- tic tac toe against computer
- 3x3 4x4 5x5 tic tac toe
- browser tic tac toe game
- no sign up tic tac toe

## Keyword Strategy Notes

Use practical long-tail keywords instead of over-optimizing for only `tic tac toe`.

The broad keyword `tic tac toe` is likely high-volume but highly competitive because Google itself shows an interactive game in search results.

The page should target more specific searches where the game has clearer value:

- multiple board sizes
- browser-based play
- CPU opponent
- no download
- no sign-up
- personal project attribution

## Requirements

### 1. Page Metadata

Add or update the document metadata.

Use this title:

```txt
Tic-Tac-Toe Online | Play Free 3x3, 4x4 & 5x5 Games

Use this meta description:

Play Tic-Tac-Toe online for free. Choose 3x3, 4x4, or 5x5 boards, play against the computer or another player, and start without downloads or sign-up.

Add canonical URL:

<link rel="canonical" href="https://ttt.abuhurarrah.com/" />
2. Open Graph Metadata

Add Open Graph metadata for social sharing.

<meta property="og:title" content="Tic-Tac-Toe Online" />
<meta property="og:description" content="Play free Tic-Tac-Toe online with 3x3, 4x4, and 5x5 boards." />
<meta property="og:url" content="https://ttt.abuhurarrah.com/" />
<meta property="og:type" content="website" />
<meta property="og:site_name" content="Tic-Tac-Toe Online" />

Add Twitter card metadata.

<meta name="twitter:card" content="summary" />
<meta name="twitter:title" content="Tic-Tac-Toe Online" />
<meta name="twitter:description" content="Play Tic-Tac-Toe online for free with multiple board sizes and CPU mode." />
3. Human-Written Page Content

Add useful visible page content without making the UI heavy.

The page must have one clear H1:

Tic-Tac-Toe Online

Add a short intro near the game area:

Play Tic-Tac-Toe online in your browser. Choose a 3x3, 4x4, or 5x5 board, play against another player or the computer, and start a quick match without downloads or sign-up.

Add a small creator attribution section or footer:

Created by Abu Hurarrah.
Explore more projects at abuhurarrah.com.

The domain must be clickable:

https://abuhurarrah.com/
4. Structured Data

Add JSON-LD structured data using WebApplication.

{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Tic-Tac-Toe Online",
  "url": "https://ttt.abuhurarrah.com/",
  "applicationCategory": "GameApplication",
  "operatingSystem": "Web browser",
  "description": "Play Tic-Tac-Toe online for free with 3x3, 4x4, and 5x5 boards, CPU mode, and local match history.",
  "author": {
    "@type": "Person",
    "name": "Abu Hurarrah",
    "url": "https://abuhurarrah.com/"
  }
}
5. Crawl and Index Files

Create or update:

public/robots.txt

Content:

User-agent: *
Allow: /

Sitemap: https://ttt.abuhurarrah.com/sitemap.xml

Create or update:

public/sitemap.xml

Content:

<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="https://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://ttt.abuhurarrah.com/</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>
6. JavaScript SEO Safety

Make sure the important SEO content is available in the initial HTML where possible.

Important content includes:

title
meta description
canonical URL
H1
intro paragraph
creator attribution
structured data

Do not hide all meaningful content behind late JavaScript-only rendering if avoidable.

7. UX Constraints

Do not disturb the current game flow.

Do not redesign the full UI.

Do not add bloated SEO text.

Do not use generic AI-style marketing copy.

Do not mention Maneuvrez on this game page for now.

Keep the visible SEO content short, useful, and natural.

Acceptance Criteria
Page has a clear SEO title.
Page has a useful meta description.
Page has canonical URL.
Page has Open Graph and Twitter metadata.
Page has one clear H1.
Page has a short human-written intro.
Page links to https://abuhurarrah.com/.
Page includes valid WebApplication JSON-LD.
robots.txt allows indexing.
sitemap.xml includes the live game URL.
Existing game features continue to work.
No unrelated UI or logic changes are introduced.