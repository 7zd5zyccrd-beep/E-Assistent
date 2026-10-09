# BDS E-Assistent – Hinweise für Claude

Die App steckt in **einer Datei**: `index.html` (HTML, CSS und JavaScript, kein
Build). Daneben liegen `sam.html` und `sam-geraete.html` (Erkennung für SAM, siehe
unten). Sie läuft auf iPhone und iPad als App vom Home-Bildschirm und wird über
GitHub Pages aus `main` ausgeliefert. Nutzer ist Jean, Elektriker, kein Entwickler.

## Arbeitsweise (vom Nutzer so gewünscht)

- **Erst lesen und vorschlagen, dann auf Freigabe warten.** Bei neuen Wünschen
  den betroffenen Code lesen, einen konkreten Vorschlag machen (was sich ändert,
  wie es aussieht, offene Entscheidungen als kurze nummerierte Fragen mit eigener
  Empfehlung) und erst nach Zustimmung umsetzen. Kleine, eindeutige Korrekturen
  (ein Wert, ein offensichtlicher Fehler) direkt erledigen.
- **Bei Rückmeldungen vom Gerät nicht raten, sondern fragen**, wenn die Ursache
  nicht aus Code und Bild hervorgeht. Mehrere Versionen auf Verdacht kosten mehr
  Zeit als eine Rückfrage.
- **Wenn Jean auf die Nachweise-App verweist** („haben wir dort schon gelöst“):
  im Repository `HT` die *ganze* Lösung nachsehen, nicht nur den Endstand –
  `CLAUDE.md` dort und die Geschichte (`git fetch --deepen=200 origin main`,
  die Sitzung klont oft nur 50 Fassungen). Danach Stelle für Stelle abgleichen,
  auch scheinbar überflüssige Eigenschaften (siehe Kopfleiste unten).
- **Auf Deutsch antworten**, knapp und ohne Fachjargon.
- **Direkt nach `main` übertragen**, keine Pull Requests, solange Jean nichts
  anderes sagt. Vor dem Push `git fetch origin main` und prüfen, dass es ein
  Vorspulen ist. Gibt die Sitzung einen Arbeitszweig `claude/…` vor, denselben
  Stand auch dorthin übertragen und Jean sagen, dass er ihn löschen kann
  (löschen kann die Sitzung ihn nicht).
- **Jede Änderung ist eine neue Version:** `const VERSION = 'v1.xxx'` hochzählen,
  `BUILD` trägt das Datum, und oben im Kopfkommentar unter `ÄNDERUNGEN` einen
  Eintrag im Stil der bisherigen schreiben (Datum, was und warum, aus Sicht der
  Bedienung; dort ohne Umlaute: ae, oe, ue).
- **Vor jedem Push testen** (siehe unten). Wo es etwas zu sehen gibt, Bilder mit
  `SendUserFile` schicken. Ehrlich sagen, was sich hier nicht prüfen lässt
  (echtes iOS-Verhalten, Tastatur, Kamera, Fingergefühl).

## Code-Konventionen

- Bezeichner, Kommentare und Texte auf Deutsch, im Stil des bestehenden Codes;
  Kommentare erklären das Warum, mit Versionsvermerk in Klammern wie `(v1.127)`
  und, wo es von Jean kam, seinem Anlass.
- Text in HTML immer über `esc()` einsetzen.
- Gespeichert wird lokal (`Store.get/set`: `cfg`, `project`, `projects`,
  `archive`, `lagerAus`, `samTraining`; Fotos in IndexedDB über `Bilder`) und
  abgeglichen mit Firebase (`FB`, `fbProjHoch`). `CFG.sam` und Prüfer sind
  persönlich und gehen nicht hinauf.
- `.gitignore` hält Bilder, PDFs und JSON mit echten Daten aus dem öffentlichen
  Repository heraus. Nie echte Daten committen.

## Wichtige Eigenheiten (hart erarbeitet)

- **App-Gerüst (v1.128, wie Nachweise-App v1.94):** Die Seite scrollt nicht
  (`html,body{height:100%;overflow:hidden}`). Kopfleiste oben, dazwischen
  scrollt `<main>`. Bildlauf immer über `bild()`, `bildY()`, `bildNach(y)`,
  `imBild(el)` – nie `window.scrollTo`/`window.scrollY`.
- **Höhe (v1.130):** `.app` ist `height:100%`; nur bei offener Tastatur
  (sichtbarer Bereich deutlich kleiner als das Fenster) setzt `hoeheBinden`
  `--app-h` auf die Höhe von `visualViewport`.
- **Fußleiste:** `.actionbar` je Ansicht. Einspaltig `position:absolute` unten
  in `.app`, die Ansicht hält per `leistenPlatz()` ihre Höhe frei; im
  Zweispalten-Layout (`.app.split`, iPad quer) klebt sie (`sticky`) in ihrer
  Spalte, beide Spalten scrollen zusammen. Unten nur
  `max(12px, env(safe-area-inset-bottom))` (v1.133). Beim Tippen wird sie aus
  dem Bild geschoben (`leisteVerstecken`), danach `leisteFreiHalten`.
  Vorgeschichte v1.107–v1.124: die klebende Leiste wanderte mehrfach mit nach
  oben – nicht wieder an der Seite selbst scrollen lassen.
- **Statusleiste (v1.130–v1.132):** `apple-mobile-web-app-status-bar-style`
  `black`, **kein** `theme-color`, und die Kopfleiste muss
  `position:sticky;top:0` tragen, obwohl im Gerüst nichts mehr klebt: Safari
  färbt den Streifen hinter der Uhrzeit nach dem Element, das oben klebt. Ohne
  das kam der graue Schleier (v1.128 hatte `sticky` als überflüssig entfernt).
  Neu anlegen des Symbols auf dem Home-Bildschirm war dafür nicht nötig.
- **Zoom:** Safaris Kneifen ist überall aus (gesture-Ereignisse,
  `touch-action:manipulation` gegen den Doppeltipp). Die Blattvorschau zoomt
  selbst (`sheetZoomBinden`, v1.129): beim Öffnen eingepasst, zwei Finger bis
  `BLATT_MAX`, waagrecht rollt `#sheets`, senkrecht `<main>`; Knopf
  „Einpassen“. Der Bildbetrachter der Fotos hat seinen eigenen Zoom.
- **Kein Scroll-Anker** (`*{overflow-anchor:none}`): iOS 27 ließ in der
  Nachweise-App die Seite beim Tippen ans Ende springen.
- **Ausgegebene Blätter** (`blattDatei`) übernehmen alle Stilregeln der App.
  Neue Regeln für `html`/`body` müssen dort wieder aufgehoben werden (wie
  `html,body{height:auto;overflow:visible}`), sonst schneidet die Umwandlung
  das Protokoll auf einen Bildschirm zu. Kein `@page` in die App.
- **Kabelart (v1.127):** `cableOptions()` – Kreise bis `KREIS_MAX_QS` (4 mm²),
  kein Alu; Aderzahl aus dem Gerät (`kreisAdern`: LS 1 TE / FI/LS 2-polig
  dreiadrig, LS 3 TE oder 3-polig / FI/LS 4-polig fünfadrig, 2 TE offen).
  Zuleitung ab `FEED_MIN_QS` (6 mm²). Alles Übrige über „Andere …“; ein dort
  gewählter oder gespeicherter Wert bleibt in der Auswahl stehen.

## Bedienkonzept (v1.159–v1.165)

Umgesetzt nach dem Bedienkonzept vom 08.10.2026 (Artifact „E-Assistent Bedienkonzept“).
- **Startseite:** offene Projekte direkt als Karten (`renderHome`, `projektKarte`,
  `projektStand`); Zahnrad rechts (`#btnZahnrad`), links das Logo; Wolke `#btnWolke`
  zeigt den Abgleich. Die Ansichten „Auswahl“ und „Fortsetzen“ gibt es nicht mehr.
- **Bereichsleiste** `#bereiche` im Projekt: Erfassen · Messen · Prüfpunkte ·
  Abschluss (`bereichVon`, `bereichWechseln`, `bereicheZeigen`). Erfassen/Messen
  ist weiter `PROJ.modus` ('edit'/'mess'); der alte Schalter `#btnModus` bleibt
  versteckt. „…“ oben rechts (`#btnMehr`): Projektdaten, SAM, Vorab ausgeben,
  Projekt löschen. Titel im Projekt = Adresse (`projektTitel`).
- **Zurück fragt** bei Ungespeichertem: `SCHUTZ` je Ansicht, `schutzMerken` am
  Ende von `go`, `vorVerlassen(weiter)` vor jedem Verlassen (auch Bereichsleiste,
  Liste im Zweispalten-Layout). Rückfragen mit mehreren Wegen: `waehlDialog`.
  Auf dem iPhone erscheint `#modal` als Blatt von unten.
- **Zustände** mit Zeichen: Klassen `z-ok/z-bad/z-none/z-ask/z-open` (+ `z-plain`,
  `z-liefer`) und `<i class="zst">`; `zustand()` für Messen, `erfassZustand()` für
  Erfassen, `chkZustand()` für Prüfpunkte. Bernstein heißt nur „bitte ansehen“,
  „keine Messung“ ist grau (`--neutral`).
- **Stromkreis:** Geräteart LS/FI-LS/FI/Sonstiges in `#segDevice` („Sonstiges“ →
  `sonstigesWaehlen`), Breite als Stepper, Absicherung/Pole/Kabel als Kacheln
  (`kachelnMalen`) – die Auswahllisten bleiben unsichtbar die Quelle.
  Übersicherung: kein Dialog beim Speichern, Hinweiskarte `#ovZeile` und Liste
  im Abschluss (`offeneUebersicherungen`); Ausgabe erst nach Entscheidung.
- **Abschluss:** Ausgabe mit Bestätigungsblatt (`ausgebenJetzt`), erst nach
  bestätigten Prüfpunkten; Unterschrift im Vollbild `#sigView` (3:1 bleibt).
- **Einstellungen:** Seiten (`setSeite`, `seiteZeigen`, `settingsZurueck`), je
  Feld sofort gespeichert (`SET_FELD`), Listen über `renderListe`/`LISTEN`.
  SAM-Werkstatt nur bei freigegebenem SAM. Neues Projekt: „Mit/Ohne Fotos
  beginnen“ (`anlegen(mitFotos)`, `CFG.samLetzt`).

## Qualitätskontrolle (v1.166–v1.178)

Umgesetzt nach dem QK-Ergebnis vom 08.10.2026 mit Jeans Antworten (F1 c: der
Prüfer unterschreibt jedes Mal selbst; F2 a: t_A bei IΔn; F3–F6 a; F8 wie bisher;
F9–F11 a; F7 nach VDE-Nachtrag: R_PE je Kreis).
- **Unterschrift:** Vollbild „Unterschrift Prüfer“ mit Namen; `initPad` nimmt beim
  Drehen die Tinte mit, `sigHatTinte` – „Fertig“ ohne Strich sichert nichts.
- **Ausgabe-Sperre** `ausgabeSperre()`: Prüfpunkte + Prüfzeit (`checksDone` erst im
  Rückruf von `zeitPruefen`), Lücken (Zuleitung, `missingValues`, „Andere“ ohne
  Grund = `grundFehlt`), Prüfer, Adresse, Übersicherung, `chkOffen()`. Im Abschluss
  rote Karten mit Sprung (`zurStelle`); unveränderte Ablage-Stände sperren nie.
- **Bewertung:** `keineGesperrt()` – „keine Mängel“ gilt nicht bei n.i.O., Messmangel,
  Nullung, Übersicherung (`chkWert` liefert dann null). Vorschlag ohne Mangel.
  `bewusst:true` (Erprobungen, Bewertung) übernehmen den Vorschlag nie von selbst;
  Sammelknopf `[data-erprobt]`. Fußleiste der Prüfpunkte in `.actionbar`
  (Container `liste` sitzt auf `#checkWrap`, nicht auf der Ansicht – sonst zeichnete
  Chromium sie auf dem iPad leer).
- **Fachregeln:** t_A-Grenze nach `ta` und Bauart (300/40, selektiv 500/150),
  `CFG.taLetzt`; Zusatzschutz nur FI ≤ 30 mA (`rcdSchutz`), FI-Pflicht im Bestand
  `istRcdPflicht` (F3a); `rcdTyp` aus dem Namen; gG-Richtwerte `GG_ZS`;
  R_PE Pflicht bei Neuinstallation (`rpePflicht`); `KABEL_ALT` (2×1,5);
  `kabelJeArt`. Zuleitung ohne Vorwahl, Kacheln (`feedKachelnMalen`).
- **Ablage:** `archLesen` – „Ansehen“ nur lesen (saveProj fällt zurück), „Nachbessern“
  mit `nachbesserungen`/`nachtrag`; Kurzangaben mit `bewertung`, `art`,
  `geaendertAm`, `pruefer`, `ablegerUid`; Löschen unter „…“ (`ablageLoeschen`).
  Papierkorb lokal 30 Tage (`Store 'papierkorb'`, `korbAufraeumen`).
- **Einstellungen:** `CFG.meinGeraet` persönlich; `fbHoch(schlüssel)` schickt nur den
  einen Wert; `prueffrist`, `kalibrierung` („Gerät|MM/JJJJ“) für alle; Listen mit
  „Rückgängig“ (`toastAktion`), gerechnete Bauteile `matGerechnet` mit Schloss.
- **Schrift:** Barlow Condensed eingebettet (`<style id="schriftEingebettet">`,
  Familie `BarlowC`); Google lädt nur noch Inter und IBM Plex Mono.
- **Rückfrage** `SCHUTZ[...].titel/knopf/verwerfen`; auch Neues Projekt und Listen.

## SAM (Beta)

- Die Erkennung kommt aus dem privaten Repository `sam-werkstatt`
  (`paddle-test.html` → hier unverändert `sam.html`, Geräteerkennung →
  `sam-geraete.html`). Beide laufen unsichtbar im iframe und antworten über
  postMessage (`SAM_LESER`, `SAM_GER`, Antwort `{fertig, ok, reihen:[…]}`).
  Nicht hier bearbeiten, sondern in der Werkstatt und herüberkopieren.
- Laden: seit v1.160 beim Antippen von „+ Wiederholungsprüfung“ (`samVorladen`
  in `startProject`; die Ansicht „Auswahl“ aus v1.126 gibt es nicht mehr),
  beide Erkennungen gleich. Nach dem
  Lesen wird die Beschreibung freigegeben (Speicher auf dem iPhone, v1.118).
- Ablauf (v1.125): „Erfassung beginnen“ öffnet die Kamera für die
  Beschreibung. Danach Zwischenseite `#samNaechst` („Jetzt fotografieren –
  Verteiler“), ein Tipp öffnet die Kamera wieder. iOS öffnet die Kamera nur aus
  einer Berührung heraus und lässt nichts in die Kamera schreiben – eine eigene
  Kamera (getUserMedia) hat Jean abgelehnt.
- Trainingsordner und Probelauf: Einstellungen › SAM (Beta) › Werkstatt ›
  „Trainingsordner öffnen“, Foto antippen, „Durchspielen“ (v1.121).
- Verknüpfung mit dem Verteiler (v1.134–v1.155): `samAusrichten` ordnet die
  Einträge den Geräten zu (Aufdruck, Nummern vom Streifen der Abdeckung,
  −4 für eine Streifennummer, die einem anderen sicheren Eintrag gehört);
  `samStreifenAbgleich` ersetzt oder markiert fragliche Nummern (bernstein,
  „Nr. vom Verteiler (Blatt: …)“), gesichert ohne Bernstein, wenn die
  Nachbarn passen. Relais/Eltako → Stromstoßschalter, „16 A“ allein ist kein
  B16, Gerät nur mit Marke → „LS~“. Warnung `#samKlein` bei zu kleiner Schrift.
  Prüfstand und offene Punkte in `sam-werkstatt/docs/SAM-STAND.md`, Abschnitt 13.
- Kamera (v1.157): zwischen den Fotos das Video nur `visibility:hidden`, nie
  `hidden` – iOS behielt sonst die alte, kleine Größe für das zweite Foto.

## Testen

Chromium liegt unter `/opt/pw-browsers/chromium-1194/chrome-linux/chrome`,
Playwright ist global installiert (`npm root -g`). Bewährt:
- Syntax: `new Function(inhalt)` für jeden `<script>`-Block ohne `src`.
- `index.html` über einen kleinen lokalen HTTP-Server ausliefern; im
  Init-Skript `localStorage['bds.offen'] = '1'` (überspringt die Anmeldung) und
  `localStorage.cfg` mit den nötigen Einstellungen (z. B. `{sam:true}`).
- Projekt anlegen per `page.evaluate`: `startProject('wdh')`, Adresse setzen,
  `$('#btnCreate').click()`, Kreise in `PROJ.items` schieben, `go('board')`.
- iPhone-Größe 390 × 844 (`screen` gleich gesetzt) und iPad 1180 × 820
  (Zweispalten-Layout). Tastatur nachstellen: Feld fokussieren und das Fenster
  niedriger setzen. Zwei-Finger-Zoom über CDP `Input.dispatchTouchEvent`.
- Seitenfehler über `page.on('pageerror')` sammeln.
- Firebase, Schriften und die SAM-Modelle sind aus der Sitzung meist nicht
  erreichbar; „SAM Fehler“ in der Kopfleiste ist im Test deshalb normal.
