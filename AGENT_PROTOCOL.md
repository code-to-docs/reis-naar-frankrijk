# AGENT_PROTOCOL.md

Dit document bevat de systeeminstructies voor elke AI-agent die aan deze codebase werkt. Lees dit ALTIJD als eerste.

## 1. De Handoff & Update Regel
Wanneer de gebruiker een sessie afrondt of van model wisselt, MOET je `SESSION_STATE.md` en `KNOWN_ISSUES.md` updaten. Geef de bestanden altijd in hun geheel terug in Markdown codeblokken.

## 2. Formatting & Kwaliteit (Geen Ballast)
Wees zo gedetailleerd als nodig is voor de context, maar hanteer een gortdroge schrijfstijl:
* **Geen proza:** Gebruik uitsluitend bulletpoints (`*`). Geen inleidende zinnen, geen meningen, geen "narratief". 
* **Focus op het 'Waarom':** Noteer architecturale beslissingen en afwijkingen. Vermijd triviale opsommingen ("knop blauw gemaakt").
* **Geen code in logs:** Plaats NOOIT code-snippets, JSON of CSS in `SESSION_STATE.md` of `ARCHITECTURE.md`.
* **Versies:** Gebruik altijd de exacte versie uit de Session State (bijv. `[v1.1.2]`).

## 3. Levenscyclus & Snoei-regels (Pruning)
Verwijder meedogenloos oude ballast, maar behoud belangrijke technische context. Hanteer deze snoeistrategie:

### Voor SESSION_STATE.md:
* **Huidige Status:** Wees compleet over de huidige staat van de app en actieve architectuur, maar haal functionaliteiten weg die al lang als 'standaard' worden beschouwd (vroege basisfeatures hoeven niet telkens genoemd te worden).
* **Changelog Compressie:** Bewaar een gedetailleerde log van de *huidige* en *direct voorgaande* sessie. Alles wat ouder is, MOET je comprimeren tot één enkele historische regel (bijv. *"Pre-v1.1: Setup, Firestore connectie en UI-tokens geïmplementeerd"*), óf volledig wissen als het geen architecturale waarde meer heeft.
* **To-Do:** Lijst alle openstaande acties op, ongeacht het aantal, zolang ze relevant zijn voor de komende sprint. Verwijder ze direct zodra ze af zijn.

### Voor KNOWN_ISSUES.md:
* **Toevoegen:** Wees gedetailleerd over het defect (welk bestand, wat gaat er mis, mogelijke oorzaak). Dit mag zo lang zijn als nodig is.
* **Verplaatsen:** Als we een issue oplossen, verplaats je deze naar de sectie `## ✅ Resolved`. 
* **Wissen door Compressie:** Zodra we in `SESSION_STATE.md` overgaan naar een nieuwe Major of Minor versie (bijv. van `v1.1.x` naar `v1.2.0`), **MOET** je de héle sectie `## ✅ Resolved` leegmaken. Vat de oude successen samen in één zin (bijv. *"v1.1: 15 UI/Token-issues en kalender-hydration opgelost"*) en gooi de details weg.

### Voor ARCHITECTURE.md:
* Dit bestand weerspiegelt de actuele codebase. Werk dit ALLEEN bij als we een fysiek bestand of een map aanmaken, verplaatsen of verwijderen.