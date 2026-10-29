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
- **Nicht markierbar (v1.276, Jean):** `body{user-select:none;-webkit-touch-callout:none}`, Eingabefelder wieder
  `text`; `blattDatei` hebt es für die Blätter auf. Von Jean bestätigt (28.10.2026).
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
  `projektStand`); links das Logo; Wolke `#btnWolke` zeigt den Abgleich und
  steht seit v1.186 in jeder Ansicht ganz rechts, Zahnrad (`#btnZahnrad`) bzw. „…“
  links daneben. Stromkreis und Zuleitung tragen die Wohnung als zweite Zeile
  (`projektOrt`). Die Ansichten „Auswahl“ und „Fortsetzen“ gibt es nicht mehr.
- **Bereichsleiste** `#bereiche` im Projekt: Erfassen · Messen · Prüfpunkte ·
  Abschluss (`bereichVon`, `bereichWechseln`, `bereicheZeigen`). Erfassen/Messen
  ist weiter `PROJ.modus` ('edit'/'mess'); der alte Schalter `#btnModus` bleibt
  versteckt. Messen hat seit v1.184 kein eigenes Blau mehr (Jean: nicht nötig);
  `body[data-modus]` bleibt als Merkmal ohne Farben. „…“ oben rechts (`#btnMehr`): Projektdaten, SAM, Vorab ausgeben,
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
- **Verworfen (Jean, 09.10.2026):** alles zur Nachbarwohnung („Nächste Wohnung“,
  Adress-Kacheln, Verteiler übernehmen; v1.176 gebaut, v1.179 wieder entfernt) und
  der Rest aus Paket 6 (Hausübersicht, Rollen Monteur/Meister, RCD-Typ als Kachel,
  Mängelliste je Haus). Nicht wieder vorschlagen. Ebenso kein Feld für den
  Netzinnenwiderstand.

## QK Runde 2 (v1.180–v1.183)

- **Tastatur (v1.180, Jean: Messwerte auf dem iPhone verdeckt):** nicht mehr allein
  auf `--app-h` verlassen. `tastaturPlatz` hängt beim Fokus Luft an (`.app.luft
  main::after`), `feldFreiholen` holt Feld samt Begleiter (`BEGLEITER`: „999“,
  „übernehmen“) über `tastaturKante()` (aus visualViewport, sonst geschätzt);
  `ruheH` = Höhe ohne Fokus; kein `scrollTo(0,0)` während des Tippens; Blätter
  (`#modal`) bekommen `bottom` in Tastaturhöhe (seit v1.213 aus `min(ruheH, innerHeight)`
  gerechnet, dazu `.ueberTastatur`: Blatt höchstens so hoch wie der Platz darüber, Feld
  im Blatt ins Bild gerollt – sonst ragte „Leitung hinzufügen“ oben hinaus). Im langen
  Blatt (`.modal-box.lang`) ist die Knopfzeile beim Tippen weg (v1.214, Jean: nicht über die Tastatur). Testen: per Init-Skript
  `window.visualViewport` durch ein Objekt mit setzbarer Höhe ersetzen und `resize`
  feuern; einmal mit gleichbleibendem, einmal mit mitschrumpfendem `innerHeight`.
- **Ablage:** `archVorher` hält den Stand vor „Nachbessern“; `go` fragt beim
  Verlassen (`nachbessernAbschluss`: Jetzt ausgeben / Später → `nachOffen` /
  Verwerfen), ohne Änderung kommt der alte Stand samt Unterschrift zurück. Im
  Lesemodus fragt der erste Tipp in ein Feld nach „Nachbessern“.
- **Messen:** `grenzLive` färbt Werte über Grenz-/Richtwert schon beim Tippen;
  Zuleitung im Messen mit Kopfkarte und `feedAendern`; `kabelText` zeigt „×“.
- **Sonst:** `letzterBereich` je Projekt; Listen löschen ohne Rückfrage mit
  „Rückgängig“ (8 s); SAM-Zeichen als Abzeichen an der Wolke; FI-Typ als Kacheln
  (`#typKacheln`); `--fault-fill` für rote Flächen.

## Nach QK (v1.184–v1.195)

- **Lager:** Name des angemeldeten Kontos (`lagerWer`), neue Einträge mit `vonUid`;
  `lagerWerNachziehen` schreibt alte Einträge mit dem Prüfernamen des Geräts aufs
  Konto um (Jean: jeder hatte sein eigenes Gerät).
- **Tastatur (v1.185):** Meldet iOS die Tastatur (`--app-h` gesetzt), bleibt die
  Seite oben (`scrollTo(0,0)` auch beim Tippen), sonst rutschte die Kopfleiste weg.
- **Trafo-LS (v1.189):** `trafoLs`/`ohneMessung` – LS mit „Trafo“ im Namen wie ein
  sonstiges Gerät: keine Messung, nicht in der Messtabelle, sperrt nicht.
- **Dateinamen Neuinstallation (v1.189):** Datum vorn = Projektbeginn (Ordner des
  Kurzbefehls; seit v1.196 nach `angelegt`). Das Ausgabedatum hinter dem Typ
  (v1.189) ist seit v1.197 wieder weg (Jean: Name zu lang) – spätere Ausgabe ersetzt
  die frühere. Projektdatei ohne Zusatz. Materialblatt ohne Anzahl 0.
- **Verteilerbeschreibung auf ein Blatt (v1.190):** `beschStufe` misst das Blatt
  unsichtbar (1024 px) und nimmt die erste Stufe `s1`–`s5` (Zeilen/Schrift kleiner)
  unter `BESCH_MAX_H`; von Jean auf dem Gerät bestätigt.
- **Prüfvermerk (v1.198):** Verteilerbeschreibung mit Kopf `.kopfz`, rechts fest der
  Vermerk `.pv` (108 px = 20 mm, Plakette Ø 30 mm deckt ihn ab): „Anlage geprüft“,
  BDS-Logo, Linien für Datum und Unterschrift. Seit v1.210 (Jeans Wahl: Variante A
  mit Beschriftung) wieder „Datum“/„Unterschrift“ unter den Linien, Datumslinie genau
  mittig zwischen grüner Linie und Unterschriftslinie (`.pvf.d`/`.pvf.u`); keine
  nächste Prüfung. Umlaute der eingebetteten Schrift sind seit v1.209 feste Zeichen
  (zusammengesetztes Ü kam auf Jeans Drucker falsch). Die Punkte in der Überschrift entfallen dort (`seite` in `blaetterBauen`).
- **Messen (v1.191):** FI im Messen öffnet mit Fokus auf `#mIdn` (direkt in
  `openCircuit`, nicht verzögert – sonst keine Tastatur auf iOS); `mIdn`/`mT` springen
  erst nach der ersten Nachkommastelle (Sonderfall 30 mA aus v1.177 entfällt).
  R_PE ist freiwillig: kein Teil von `missingValues`/`mangelText` mehr (F7 überholt).
- **Leitungen planen (v1.192, Neuinstallation):** Block „LEITUNGEN PLANEN“. `+ Leitung`
  (`leitungBlatt`, `leitungBauen`: Kreis mit `no:''`, Absicherung aus dem Zweck,
  1,5 mm² → B10); Liste zeigt „Ohne Nummer“; `refreshNoField` vergibt einer Leitung
  keine Nummer. `ordnen`/`ordnenWahl` (nur `planBar()`, nur in der Liste, `go` setzt
  zurück): Ziehen am Griff per Pointer-Ereignissen (`ordnenZiehen`, Rand rollt mit),
  Ziehen gleitend (v1.195: Zeile am Finger, andere rücken per transform), Zusammenlegen mit `teile` (Trennen), `+ FI` (`ordnenFiTyp`), Entfernen mit
  Rückgängig, `nummernPlan` nummeriert nach TE und setzt `covers` jedes FI;
  Seit v1.219 nummeriert jede Änderung im Ordnen sofort (`nummernAnwenden` am Anfang von
  `ordnenZeigen`), „Fertig“ ohne Rückfrage (Jean: wegfallen). Jean: Ziehen ggf. später ersetzen.
  Seit v1.211 wählt „Leitung hinzufügen“ den Zweck mit den Kacheln der Bezeichnung
  (`leitungFolge`, `sugNameAus`, `paarPartnerAus`; Räume/Kabel nach der Kette wie
  `applySugValues`). Dunstabzug unter „Steckdose“: nur Küche, 3×1,5 an B16 (`b16Bei15`,
  Jean), zählt in `kabelJeArt` nicht als Vorbild. Seit v1.215 ebenso Kühlschrank (nur
  Küche); beide nicht mehr Endpunkt (`KUECHE_GERAET`): danach Arbeitsfläche (`AF_GERAET`,
  3×2,5, links/rechts) oder das andere Gerät; `liste`-Glieder bekommen Komma und machen
  „Steckdose“ zu „Steckdosen“ (`sugNameAus`), `ohnePaar` unterdrückt „Beleuchtung“ dazu.
  v1.216: auch hinter „Steckdosen links/rechts/Arbeitsfläche (links/rechts)“ (`GERAET_DANACH`,
  `kommaVor`), Kabel bleibt 2,5, Raum Küche. Nach „Hinzufügen“ startet die nächste Leitung ohne Räume (v1.217, Jean).
  Zusammenlegen (v1.212, Jean): Kabel und Absicherung von der Leitung mit dem kleinsten
  Querschnitt, bei Gleichstand die kleinere Absicherung; Altbestand ohne Querschnitt zählt
  nur, wenn alle so sind (vorher trug die stärkste Leitung).
  **Freie TE (v1.218, Jean):** Zeilen `{kind:'frei', te, rest}` in `PROJ.items` (nicht in
  `circuits()`, aber in `planZeilen()`); „+ Frei“ im Ordnen mit −/+ und „bis Reihenende“
  (`freiBreite`, `ROW_SIZE` 12). `lueckenAlsFrei` macht beim Öffnen von Ordnen Lücken
  zwischen Nummern zu freien Zeilen (endet die Lücke am Reihenende: `rest`);
  `nummernPlan` zählt sie mit. `freiAnpassen` (in `saveProj`, nicht während `ordnen` – v1.220) lässt sie schrumpfen, wenn ein
  Kreis ihren Platz belegt; `verschiebePlan` behandelt sie als Lücke. Sichtbar in der
  Erfassen-Liste (nicht antippbar) und in der Verteilerbeschreibung nicht (v1.218 „frei“, v1.251 nur Nummer, seit v1.253 gar nicht); nicht in
  Messen/Protokoll. Abweichende Nummerierung entfernt sie. `teLage` (Material: Reihen,
  Phasenschiene, durchgeschliffene FI) nimmt seit v1.218 die Nummern statt der lückenlosen TE.
- **K-Nummern (v1.193):** `kNummernSetzen` läuft in `saveProj` – Stromstoßschalter
  (`istStromstoss`) bekommen „K1 …“ nach Lage, nur Projekte mit `kNr` (neu ab v1.193,
  bestehende unverändert). Wiederholung: K vom Blatt (SAM) oder von Hand → `kFest`.

## Prüfung Erfassen (20.10.2026, Artifact „Erfassen unter der Lupe“, Jean: alles umsetzen)

- **Paket 1 (v1.221):** `erfassNaechster` – im bestehenden Kreis „Weiter → N“ (offene SAM-Kreise
  zuerst); `persistCircuit` gibt den Kreis zurück, `nummernPruefen(fertig, obj)` fragt auch bei
  neuem Kreis auf belegter Nummer; `fiOhneAbdeckung` macht den FI bernstein, `coversVorschlag`
  (aus `coversHint` gelöst) als Knopf `[data-covers]` unter dem FI in der Liste, gelbe Karte im
  Abschluss (sperrt nicht); Blatt „Leitung hinzufügen“: „Fertig“ nimmt gewählte Leitung mit
  (`leitungZurueckOrig`).
- **Paket 3 (v1.222):** `.btn.ghost` deckend (`--surface`) mit `--ink`, gesperrt gestrichelt
  (`#sigView` bleibt durchsichtig); `.list-item.ord-zeile` neutraler Streifen; `.list-item .no`
  in `--f-label` 20 px, `.t` zweizeilig (line-clamp); `.list-item .s` und `.sug.mono` in
  `--f-body` mit `tabular-nums`; `.eyebrow` 15 px dunkel, `.row-head` 13 px ohne Linie,
  Feldbeschriftung 13,5 px.
- **Paket 2 + Listenlage (v1.223, Jean: Lage sprang an den Anfang):** `go` merkt je Listenansicht
  (`LAGE_ANSICHTEN`, Schlüssel je Projekt bzw. Einstellungsseite) die Rolllage in `bildLagen`
  und stellt sie beim Wiederkommen her (nicht beim Neuaufbau derselben Ansicht). `persistCircuit`
  setzt `boardMarke` (cid); zurück aus dem Kreis `kreisHervorheben` (ins Bild, `.zuletzt` leuchtet).
  `kreisTitel` („Stromkreis 7“/„Neuer Stromkreis 14“, auch aus `refreshNoField`); `#kreisOk`
  „✓ … gespeichert“ nach Weiter/Nächster Kreis, weg beim ersten Tippen.
- **Paket 4 (v1.224):** Prüfpunkt-Kacheln 48 px; gewählte Räume (`.chk.on`) dunkel gefüllt und
  rund wie die Kacheln; Bezeichnungs-/Zweck-Kacheln mit Fläche `--enclosure-2`; FI-Typ zweispaltig
  mit Kurztext `fiKurz` („40 A · 30 mA · 4-pol.“); ± der freien TE 44 px; Return in `#cName`
  springt zu `#cRoom`, dort schließt es die Tastatur.
- **Paket 5 (v1.225):** Ordnen-Leiste je nach Auswahl (`planLeisteZeigen`: ohne Markierung
  „+ FI“/„+ Frei“, mit Markierung „+ FI“, „Zusammenlegen (n)“ nur wenn möglich, „Entfernen“;
  ausgeblendet statt gesperrt). „+ FI“ setzt den FI vor die erste markierte Zeile und holt
  alle markierten Leitungen direkt dahinter. Gerät über das Reihenende (`ROW_SIZE`): Hinweis
  `.ord-reihe` in der Zeile, „Ab 13 beginnen“ fügt davor `freiNeu(1, true)` ein. Absicherung
  folgt der getippten Bezeichnung (`absJeArt`, nur ohne Kachelpfad und solange nicht `absHand`).
  Leerer Fotokasten ist der Knopf (`[data-fotoneu]`, „Foto aufnehmen“ erst bei Fotos).
  Zuleitung: `feedFuseNorm` legt „3× gG 35 A“ auf die Kachel „35 A (gG)“.
- **Messwerte eingeklappt (v1.226, Jean: erst alles erfassen, dann bauen, am Ende messen):**
  im Erfassen ersetzt `#messZu` (Zeile mit eingetragenen Werten bzw. „werden im Messen erfasst“,
  `messZeile`) den Block `#messTeil` samt Überschrift `#messTitel`; `messKlappe` am Ende von
  `messteilZeigen`, `messAuf` beim Öffnen immer zurück (Jean: auch bei gemessenen Kreisen zu).
  Zuleitung ebenso (`feedKlappe`, `#feedMessZu`/`#feedMessTeil`). Im Messen immer offen.
- **„+ Gerät“ im Ordnen (v1.227, Jean: Leitungen erfassen, zusammenlegen, dann FIs und Geräte
  einfügen):** `#btnPlanGeraet` (nur ohne Markierung) bietet `specialList()` per `waehlDialog`,
  setzt das Gerät mit seiner TE-Breite oben ein; Unterzeile im Ordnen „n TE“ statt des Namens.
  Seit v1.228 (Jean) steht der FI an erster Stelle darin (`ordnenFiEinfuegen`, früher Knopf
  `#btnPlanFi`, entfällt); „+ Gerät“ daher auch mit Markierung: FI holt die Markierten hinter
  sich, andere Geräte kommen vor die erste markierte Zeile. Leiste: „+ Gerät“/„+ Frei“ bzw.
  „+ Gerät“/„Zusammenlegen (n)“/„Entfernen“.
- **Eine Liste (v1.229, Jean: Ordnen und Bearbeiten zusammen):** bei der Neuinstallation ist die
  Erfassen-Liste immer die Ordnen-Liste (`ordnen = planBar()` in `renderBoard`, kein `#btnOrdnen`,
  kein `#btnPlanFertig`). Zeile: `.ord-wahl` (eigener Tippbereich, nur dort markieren), Tipp
  sonst öffnet den Kreis (`data-idx`, auch für `kreisHervorheben`/`picked`), Griff rechts; Reihen-
  Überschriften. `ordnenVorbereiten` (in `go` beim Hereinkommen) sortiert einmal und macht Lücken
  zu freien Zeilen – nie nach dem Ziehen. Reihenrest ohne Breite wird nicht gezeigt,
  `ordnenUebernehmen` setzt ihn hinter seinen Vorgänger. Leiste: `#planLeiste` („+ Leitung“
  `#btnPlanLeitung`, „+ Gerät“, „+ Frei“ bzw. mit Markierung „+ Gerät“, „Nächste Reihe“) und
  `#planLeiste2` („Zusammenlegen“, „Entfernen“); `#addZeile` mit „+ Stromkreis“ entfällt dort
  (Jean). „Nächste Reihe“ (`#btnPlanReihe`, Frage 2 a): Markierte vor die erste Zeile der
  folgenden Reihe, davor `freiNeu(1, true)`. `planProjekt()`: kein
  `nummernPruefen`, kein `freiAnpassen` (`#cNo` war v1.229–v1.232 nur lesbar). Neue Kreise/Leitungen ans Ende (Jean).
  Ziehen an den Reihenanfang (v1.230, Jean): `ordnenZiehen` merkt die Mitte der Überschriften
  (`.row-head[data-r]`); landet die Zeile vor dem ersten Kreis einer Reihe und wurde unterhalb der
  Überschrift losgelassen, setzt `ordnenUebernehmen(ids, anfang)` davor `freiNeu(1, true)`.
  Seit v1.231 (Jean: vor dem Loslassen nicht erkennbar) zeigt `zielZeigen` beim Ziehen das Ziel:
  Schild `.zieh-ziel` („→ 13 · Reihe 2“, gezählt mit `nummernPlan(voll)` über die gedachte
  Reihenfolge, `ordnenVollstaendig`), Nummer der Zeile läuft mit, Überschrift `.row-head.ziel` grün.
  Kreise hinter „bis Reihenende“ (v1.232, Jean): Kreis mit `amEnde` direkt hinter dem Rest (oder
  hinter einem anderen `amEnde`) steht hinten in der Reihe; `nummernPlan` zieht ihre TE vom Rest ab.
  `wohin()` in `ordnenZiehen` setzt `ende`, wenn der Vorgänger der Rest bzw. ein `amEnde` ist und
  nicht `anfang` gilt; `ordnenUebernehmen(ids, anfang, gezogen, amEnde)` setzt/löscht das Merkmal,
  `nummernAnwenden` löscht es, wo die Kette nicht mehr stimmt. Rest ohne Breite behält seine
  Nummer (sonst sortierte `sortCircuits` ihn ans Ende). Freie Zeile zeigt echte Breite.
  Nummer eintippen (v1.233, Jean 1 b / 2 a / 3 ja): `persistCircuit` ruft bei geänderter Nummer
  `planVersetzen(c, N)` – Kreis raus, Folgende rücken auf; belegt → davor einfügen; in fester
  Lücke → teilen; im Reihenrest bis ans Ende → `amEnde` hinter den Rest, sonst fester Freiraum
  davor; hinter allem → freie TE davor (gleiche Reihe und Reihenende: Rest + `amEnde`).
  `planEndeNr`. Kein Überschneidungs-Hinweis (`#noUeber`) bei der Neuinstallation.
  Stufen über freiem Platz (v1.234, Jean): beim Ziehen werden freie Blöcke auf `FREI_STUFE`
  (30 px) je TE erhöht (Zeile bleibt per Scroll unter dem Finger, `y0` aus dem Griffpunkt);
  `imFrei()` zählt in der Höhe des Blocks k TE, der Block bleibt dabei stehen; Schild „(k frei
  davor)“; Ablegen `ordnenFreiUebernehmen` → `freiEinsetzenListe` (fest: teilen; Rest: frei k
  davor, Rest dahinter, bis ans Ende → `amEnde`). Nummer innerhalb der eigenen Breite
  (`planVersetzen(c, N, bisher)`, FI 13–16 → 14): Kreis samt Folgenden um k nach hinten, frei
  davor, bezahlt vom Rest bzw. festen freien TE derselben Reihe; sonst Hinweis, Nummer bleibt.
  Zwischenstufe (v1.235, Jean a / immer): mittleres Drittel (0,35–0,65) jeder Kreiszeile →
  `zwischen`, Ziel „vor diesem Kreis mit einer freien TE davor“ (`luecke`), Schild „(1 frei
  davor)“; `ordnenUebernehmen(…, luecke)` fügt `freiNeu(1)` ein. Reicht der Platz nicht und
  endet die Reihe mit einem Reihenrest, schiebt `reiheUeberlauf` den Rest vor den ersten
  überzähligen Kreis – der beginnt die nächste Reihe, die übrigen rücken nach.
  Freie Zeile kompakt (v1.236, Jean: zu hoch): zu wie eine Kreiszeile („frei · n TE“), Tipp
  öffnet −/+ und „bis Reihenende“ (`freiOffen`). `lageHalten` um Zusammenlegen/Trennen,
  Entfernen und „Nächste Reihe“ (Fokus lösen, Rolllage über den Bildaufbau halten – Jean: auf
  dem iPhone sprang die Liste nach oben, im Test nicht nachstellbar). `ordnenVollstaendig(ids,
  bewegt)`: Reihenrest ohne Breite bleibt vor seinem Nachfolger, wenn sein Vorgänger gezogen wird.
  Zusammenlegen der Bezeichnungen (v1.237, Jean): `namenVereinen` fasst gleiche Arten
  (`NAMEN_ARTEN`: Steckdose(n), Beleuchtung, Licht) zu einem Teil mit allen Zusätzen zusammen
  („Steckdosen Arbeitsfläche links, Dunstabzug“), Teile ohne Art gehören zur Art davor,
  mehrere Steckdosen → Mehrzahl. Räume weiter `teileVereinen`.
  Zeile der Planliste (v1.238, Jean B): Bezeichnung vollständig (umbrechend, ohne Räume),
  Unterzeile „Räume · Absicherung · Kabel · n Leitungen“ über `ordUnter` (bricht nur zwischen den
  Angaben, `.tl` nowrap); `.ord-wahl` 42 px, `.ord-griff` 40 px.
  Seit v1.239 läuft auch das Übernehmen nach dem Ziehen durch `lageHalten` (Jean: FI ziehen →
  Liste sprang auf dem iPhone nach oben; im Test nicht nachstellbar).
  Griff (v1.240, Jean: beim Scrollen ungewollt verschoben): Finger erst nach `GRIFF_HALTEN`
  (250 ms) ruhigem Halten → `ordnenZiehen`; vorher bewegt (> 8 px) oder `pointercancel` → nichts,
  die Liste rollt (`.ord-griff` `touch-action:pan-y`, `touchmove` nur bei `.zieht` verhindert);
  Maus sofort. `lageHalten(fn, abzug)`: der beim Anfassen mitgerollte Ausgleich für die
  erhöhten freien Blöcke wird beim Loslassen abgezogen (Jean: sprang eine Zeile höher).
  Testen mit CDP `Input.dispatchTouchEvent` (touchStart, warten, touchMove …, touchEnd).
  Darstellung beim Ziehen (v1.242, Jean alle vier + halb durchsichtig): Lücke über `elems`
  (Zeilen und Überschriften rücken gemeinsam; Einfügestelle aus `w.ids`, am Reihenanfang hinter
  der Überschrift), gestrichelter Platzhalter `.zieh-platz` (absolut in `#boardBody`, „1 frei“
  bei der Zwischenstufe); `gedacht(w)` rechnet die Reihenfolge wie beim Ablegen – alle `.no`
  laufen mit (`.nr-neu`); TE-Skala `.frei-skala` in jedem freien Block (Stufen mit Zielnummer,
  aktive grün), Breite ohne die gezogene Zeile (`freiBreiteOhne`, auch in `imFrei` und
  `freiEinsetzenListe`); Zielangabe in der Unterzeile der gezogenen Zeile (`.zieh-text`), Schild
  `.zieh-ziel` entfällt; Zeile `opacity:.8`, über freiem Block `.6`. Tests lesen `.zieh-text`.
  Freie TE (v1.243, Jean): `nummernAnwenden` fasst freie Blöcke direkt hintereinander in
  derselben Reihe zusammen (fest + fest addiert, fest + Rest → Rest; ein Rest bleibt). Beim Ziehen
  jede TE ein Streifen der Skala (Nummer ohne die gezogene Zeile), `imFrei` zählt je TE (`… * w`),
  grün sind alle Streifen, die die Zeile belegt; Vergrößerung nach `freiBreiteOhne`.
  v1.241: auch Antippen der freien Zeile und −/+/„bis Reihenende“ über `lageHalten`.
  Ganze Reihe frei (v1.244, Jean: Reihe markiert, „Nächste Reihe“ – Kreise rutschten wieder
  hoch): bliebe von der Reihe nichts, setzt `#btnPlanReihe` statt des 0-TE-Rests `freiNeu(12)`
  davor und lässt einen leeren Reihenrest am Ende davor weg.
  „+ Frei“ (v1.245, Jean: Ansicht sprang nach oben): `#btnPlanFrei` öffnet die neue Zeile
  (`freiOffen`) und rollt sie in die Bildmitte (sofort, rAF, 80 ms wie `lageHalten`).
  „Nächste Reihe“ als neue Reihe (v1.246, Jean 2 a, auch für einen Teil der Reihe): hinter den
  markierten Zeilen `freiNeu(1, true)`, leere Reihenwechsel am Anfang von `danach` entfallen –
  alle folgenden Reihen rücken als Ganzes eine Reihe weiter.
  Gruppe ziehen (v1.247, Jean 1–3 ja): Griff einer markierten Zeile bei ≥ 2 markierten →
  `bundZiehen`: Platzhalter-Kreis `cid:BUND` (Gesamt-TE, `bund:[Zeilen]`) ersetzt die markierten
  in `PROJ.items`; die angefasste DOM-Zeile wird selbst zur Karte (neu zeichnen verlor auf iOS
  den Finger – pointercancel), die anderen markierten Zeilen werden aus dem DOM genommen.
  `bundAktiv` sperrt `saveProj`; nach dem Ablegen löst `bundAufloesen` (in `saveProj` bzw.
  `renderBoard`) die Karte in Reihenfolge auf, `amEnde` gilt für alle, Markierung weg.
  Neue Reihe: `ordnenZiehen` setzt unter die letzte Zeile `.row-head.neu` „Reihe n (neu)“;
  darunter losgelassen (`!nach`) gilt `anfang` mit `r = neuR`. „Nächste Reihe“ bleibt vorerst.
  Test: Ziel nicht in die Randzone (70 px) legen, sonst rollt die Liste mit.
  Geleerte Reihen (v1.248, Jean: Reihe 1 nach Reihe 3 gezogen – Reihe 2 rückte nach, „tauschten
  nur“): beim Anfassen `ziehLeer = leereReihen(bewegt)` (Reihen, deren Kreise alle gezogen
  werden, samt ihren freien Zeilen); `leereReihenHalten(liste, ziehLeer, gezogen)` nimmt deren
  freie Zeilen heraus und setzt `freiNeu(12)` vor das, was in die Reihe gerückt wäre (nicht vor
  die gezogene Zeile selbst). Läuft in `gedacht`, für `neuR`, in `ordnenUebernehmen` und
  `ordnenFreiUebernehmen`. Ziehen begrenzt auf die Liste (`dMin`/`dMax`) – vorher wuchs die
  Seite unter dem Finger, und am Rand rollte es ins Leere.
  Letzte Reihe in die neue (v1.249, Jean: nur Reihe 2 → Reihe 3 ging nicht): `neuR` zählt
  geleerte Reihen mit; `leereReihenHalten(…, zielR)` hält die geleerte Reihe auch dann frei,
  wenn nur die gezogene Zeile in sie rückte, solange sie an den Anfang einer späteren Reihe
  (`w.anfang`, `w.r`) gezogen wurde.
  Freie TE am Reihenende (v1.250, Jean: erste Kreise einer Reihe blieben in der Reihe davor
  hängen): `nummernAnwenden` macht feste freie Zeilen, die genau am Reihenende enden und nicht
  am Reihenanfang beginnen, zu `rest` (eine ganz freie Reihe bleibt fest – Rest am Anfang hätte
  0 TE). „−“ auch beim Rest: feste Breite eins kleiner. „Nächste Reihe“ wirft nur Reste ohne
  Breite vom Ende von `davor` (vorher auch den Rest der Reihe davor).
  Ziehen in freie TE (v1.252, Jean: Reihe 3 → 4, dann Reihe 2 in die freie Reihe 3 – alles wieder
  am Anfang): `imFrei` liefert `zr` = Reihe nach der Lage des Blocks vor dem Ziehen (`origNr`);
  `gedacht` und `ordnenFreiUebernehmen(…, zielR)` geben sie an `leereReihenHalten`. TE-Skala zählt
  über `leereReihenHalten(…, null)`. `bundZiehen`: lässt sich oben nicht nachrollen, bekommt
  `ordnenZiehen` ein verschobenes `clientY`, die erste Bewegung holt die Karte unter den Finger.
  FI-Abdeckung (v1.254, Jean 1/2 ja): `nummernPlan` rechnet `coversAuto` nur bis zum Ende der
  Reihe des FI; mit `c.coversHand` (Kennungen der Kreise) gilt die Hand-Abdeckung, Nummern aus der
  aktuellen Lage. `persistCircuit` → `coversHandSetzen`: Eingabe = berechnet → Merkmal weg, sonst
  die gemeinten Kreise. `coversHint` zeigt „Automatisch: …“, solange das Feld davon abweicht.
  Verteilerbeschreibung (v1.253): freie TE gar nicht mehr.
  Lesemodus der Ablage (v1.255, Jean: Bild eingefroren): `docsVorwahl` und `nummernAnwenden`
  tun bei `archOffen && archLesen` nichts – sie änderten den Stand, `saveProj` setzte zurück und
  rief `go` erneut auf, endlos. Neue Rechnungen, die beim Zeichnen etwas am Projekt ändern, im
  Lesemodus ebenso aussetzen (Test: `go` zählen nach `archAnsehen`).

## Adressvorschläge (v1.256, Jean 1–4 ja)

- `#npAddress` (Neues Projekt und Projektdaten) zeigt unter dem Feld Kacheln `#adrSug`
  (`renderAdrSug`): zuerst eigene Adressen aus Projekten und Ablage (`adrEigene`, „früher“),
  dann Treffer von Photon (`ADR_DIENST`, ab 3 Zeichen, 300 ms Pause, `adrCache`), höchstens 4.
  Antippen setzt „Straße Nr\nPLZ Ort“ und schließt die Tastatur. Ort für die Gewichtung:
  `adrOrtHolen` – Standort auf 2 Nachkommastellen (~1 km); ohne Freigabe oder ohne Antwort
  nach 6 s der Ort aus der zweiten Zeile des jüngsten eigenen Projekts (Photon, `limit=1`).
  Gesendet werden nur der getippte Text und dieser grobe Ort (Jean einverstanden).
  Test: Photon per `page.route` nachstellen (aus der Sitzung nicht erreichbar).

## Bewegung (Designteam 28.10.2026, Jean: Paket 1, dann 2 ohne rückende Zeilen, diese einzeln; kein Vibrieren)

- **Paket 1 (v1.257):** Zeitmaße `--t-tipp`/`--t-weg`/`--t-blatt`, Kurven `--k-an`/`--k-std`.
  `:active` dunkelt (`filter:brightness`) Knöpfe, Kacheln, Zeilen; im Ordnen nicht beim Halten
  am Griff (`:has(.ord-griff:active)`); leerer `touchstart`-Hörer, sonst zeigt iOS kein `:active`.
  `#kreisOk` steht vor `.panes` (im Messen ist `#paneGeraet` versteckt). `aufleuchten(el)` /
  `zeileLeuchten(cid, rollen)`: `.zuletzt` allgemein, Ringfarbe `--ring` nach Zustand; nach
  „+ Gerät“/FI, „+ Frei“, Zusammenlegen/Trennen (100 ms, nach `lageHalten`). `#btnExportDocs`
  nie `disabled`, sondern `.gesperrt` + `aria-disabled`; Tipp springt zur ersten roten Karte
  (`#plausiOut .warn:not(.gelb):not(.ok)`). `#modal` gleitet per `@starting-style` herein,
  Schließen sofort. Nicht anfassen: Bewegung auf `.view`/`main`/`.app`, sanftes Scrollen, Ziehen.
- **Paket 2 (v1.258):** `.view.active` blendet per Deckkraft ein (`ansichtEin`); `.b-gleiter` in
  `#bereiche` mit `--b-i` (aus `bereicheZeigen`); gesetzter Prüfpunkt `aufleuchten`; Kreisnummer im
  Kopf als `#title .tnr`, nach „Weiter“ `.neu`; `toast(msg, 'fehler')` rot mit „!“ (3,5 s), alle
  Fehlermeldungen umgestellt – neue ebenso; `toast(msg, 'halten')` (bis zur nächsten, höchstens
  30 s) für „Wird vorbereitet …“ am Anfang von `ablegen`. Der Hinweis lag schon über der Leiste,
  nur über dem Inhalt darüber – so gelassen.
- **Hinweis antippen (v1.259, Jean):** `#toast.show` nimmt Tipps an und verschwindet; bei
  `toastAktion` löst nur `.toast-knopf` die Aktion aus.
- **Rückende Zeilen (v1.260):** `sanftMessen`/`sanftSpielen` (FLIP in Bildschirmlage, nur sichtbare
  Zeilen von `SANFT_SEL`, höchstens 30, Schlüssel `data-ord`/`data-r`); `lageHalten(fn, abzug,
  sanft)` – sanft bei Zusammenlegen/Trennen, Entfernen, Rückgängig, „Nächste Reihe“, freie Zeile
  öffnen/ändern; nie nach dem Ziehen (gleitet schon). „+ Frei“/„+ Gerät“ rollen, dort nur Leuchten.
- **Blatt federt nicht (v1.261, Jean: Überziehen nahm die Knöpfe mit):** `.modal-box{overscroll-behavior:none}`
  – die klebende Knopfzeile des langen Blatts federte in Safari mit dem Inhalt nach oben.
- **Langes Blatt (v1.262, Jean 1 ja / 2 nur „Leitung hinzufügen“):** `.modal-box.lang` als Spalte ohne
  eigenes Rollen; nur `#modalBody` rollt und federt (`overscroll-behavior-y:contain`), Knopfzeile
  nicht mehr sticky. `feldFreiholen` rollt dort `#modalBody`.
- **Feldwechsel bei offener Tastatur (v1.263–v1.267, Jean: Inhalt glitt bei jedem Wechsel von unten
  hoch; mit v1.266 ruhig, 28.10.2026):** Messhilfe (v1.264, wieder entfernt) zeigte: ~80 ms nach dem
  Fokus schob iOS das Fenster um 177 (scrollY), `scrollTo(0,0)` holte es zurück. Abhilfe: `touchend`
  auf ein anderes Feld bei offener Tastatur → `preventDefault`, `focus({preventScroll:true})`, Cursor
  ans Ende (v1.266); `messWeiter` ebenso mit `preventScroll` (v1.263). Ob `html,body{height:var(--app-h,
  100%)}` (v1.265) nötig ist, blieb ungeklärt – drin gelassen.
- **„Weiter →“ bei offener Tastatur (v1.271, Jean wie empfohlen: immer):** `#btnWeiterTast` am Ende von
  `#measBlock`, sichtbar solange im Messen ein Messfeld den Fokus hat (`weiterTastZeigen` bei focusin/out),
  Text wie `#btnSaveCircuit`. Nimmt den Fokus nicht (mousedown/touchend `preventDefault`); `weiterTastLos`
  klickt `#btnSaveCircuit` und setzt im nächsten Kreis per `fokusRuhig` das erste leere Feld. `messWeiter`
  lässt im Messen nach dem letzten Wert die Tastatur offen (vorher `blur`). Seit v1.272 (Jean: Knopf halb
  hinter der Leiste der Tastatur; unter die Tastatur geht nicht – iOS) steht er fest unten in `.app`
  (`position:absolute`, 44 px, über der Tastatur, da `.app` dann `--app-h` hoch ist); `feldFreiholen` nimmt
  seine Oberkante als Kante.
- **Tastatur (v1.268):** `feldFreiholen` rollt nur, wenn das Feld wirklich unter der Kante liegt (vorher schon
  bei < 12 Punkten Abstand – Zucken beim Einblenden). Messhilfe (v1.268)
  für den Sprung zum Schutzleiterwiderstand, mit v1.270 wieder entfernt.
- **Fokus ruhig (v1.269, Protokoll):** iOS rollte `<main>` beim Fokus trotz `preventScroll` (Sprung zu R_PE:
  main 0 → 292 vor `feldFreiholen`). `fokusRuhig(el)` (in `messWeiter` und im `touchend`-Wechsel) setzt die
  Lage sofort zurück und ruft `feldFreiholen`. Von Jean bestätigt (28.10.2026).
- Paket 3 ohne Vibrieren (Jean: weglassen). Grenzwert-Blatt doppelt: Jean nie gesehen.

## Start (v1.273–, Jean: nach dem Schließen manchmal lange leerer Bildschirm)

- Ursache: 1 MB in einer Datei, kein Speicher auf dem Gerät, Google-Schriften blockieren das erste Bild.
  Jean: Schriften so lassen (Schritt 1 verworfen), Startbild ja, App auf dem Gerät speichern ja, still.
- **Startbild (v1.273, seit v1.275 Variante B nach Artifact „BDS Startbild“):** `#startBild` direkt nach `<body>`
  (Schriftzug `--logo`, Lichtstreif `.sb-glanz` per Maske aus dem Logo),
  `startBildWeg()` am Ende des Hauptskripts (rAF), bei Ladefehler und spätestens nach 12 s.
- **Speicher auf dem Gerät (v1.274, Jean: still):** `sw.js` (Service Worker, Speicher `bds-app-1`):
  eigene `.html`/Navigation (Schlüssel ohne `?…`), Google-Schriften und `www.gstatic.com/firebasejs/`
  kommen aus dem Speicher, im Hintergrund frisch geholt (`cache:'no-store'`) – **eine neue Version
  erreicht Jean erst beim übernächsten Öffnen** oder sofort über „App neu laden“ (`#btnReload` leert
  `bds-app*`). Bei Rückmeldungen nach einem Push daran denken. Firebase-Daten, Photon, SAM-Modelle
  gehen nicht durch den Speicher. Test: Server muss `.js` als `text/javascript` liefern.

## Designteam Runde 2 (28.10.2026, Jean: alles wie vorgeschlagen, außer Grenzwerte vor dem Messen – nicht zeigen)

- **v1.277:** `paintCableList` – passt die Aderzahl nicht, bleibt der Querschnitt (sonst nächstgrößerer),
  vorher `list[0]` (3x2,5 → 5x1,5). `saveCircuitThen`: stand `#grenzLive` schon da, kein `showWarnModal`,
  sondern speichern + `toastAktion` „Kreis N gespeichert – rot markiert“ / „Korrigieren“. Zuleitung unverändert.
- **v1.278:** `#isoSug/#fIsoSug .sug` 48 px; `#btnSaveCircuit` im letzten Kreis „Weiter → Zuleitung“ bzw.
  „Alles gemessen · Prüfpunkte →“, `weiterZumKreis` springt dorthin; `#feedKopf` nur ohne offene Kacheln;
  `grundKacheln(sel)` für `#cReason`/`#fReason` (Liste unsichtbar Quelle); FI ohne Name in der Liste
  `breaker` + „deckt … ab“; `planLeisteZeigen` setzt einen offenen Hinweis neu (`toastSetzen`).
- **v1.279:** Prüfpunkte: nicht bestätigter Vorschlag `button.vorschlag` (Umriss `--signal-ink`, nicht gefüllt);
  `bereicheZeigen`: Messen zählt Offene (sonst ✓), Abschluss-✓ bei `!ausgabeSperre()`; `projektNaechst(p, st)`
  (setzt kurz `PROJ = p`): Grenzwert → Bereit → Zuleitung fehlt → Prüfpunkte offen, Zeile `.s.naechst` in der Karte.
- **v1.280:** Ablage: `.arch-zeile` (Zeile wie `projekt-karte`, `data-asee`), `.arch-monat` je Monat, Bewertung nur
  bei Mangel (rot/gelb); Tipp öffnet (`archAnsehen`), alter Eintrag ohne Stand → `erneutSichern`; „Erneut ausgeben“
  nur noch im Eintrag (Abschluss); `#archHint` steht hinter `#archiveBody`.
- **v1.281:** Prüfpunkte: Abschnitt ohne roten Punkt und ohne Mangel → `.chk-zu`-Zeile (`data-chkauf`, `chkAuf`
  merkt Aufgeklapptes für die Sitzung). Abschluss: Dokumente → Auftraggeber (`.ag-zeile`, ganze Zeile `#btnAg`)
  → Fotos → Unterschrift → Ausgeben; „Material bearbeiten“. `.chk.on` nimmt `--sel` (im Dunkeln grau wie
  die übrigen), `--neutral-bg` grünlich. iPad: alle einspaltigen Ansichten `max-width:720px`.
- **v1.282:** iPad quer, Erfassen: `#technikBlock` (Absicherung, Pole, Kabel) wandert per `technikVerteilen`
  (in `openCircuit` und bei `resize`) in `#paneTechnik` oben in der rechten Spalte, sobald `.panes` ein Raster ist;
  im Messen und einspaltig zurück in `#paneGeraet`.
- **v1.283 (Jean: erste Reihe frei, nach Neuladen wieder Reihe 1):** `migrateProject` warf alle Zeilen außer
  Kreisen weg – auch die freien TE (bei jedem Start und Abgleich). Jetzt bleiben `kind:'frei'`.
- **v1.284 (Jean: FI 13–16 auf 14 ging nicht, letzter Kreis auf 23):** `planVersetzen(c, N, bisher)` zählt in der
  letzten belegten Reihe die offenen TE hinter dem letzten Eintrag mit (`offen`). `planKeinPlatz` hält „Kein Platz“
  stehen (sonst sofort von „Gespeichert“ überdeckt).

## Dunkelmodus (Designteam 29.10.2026, Jean: Grün zu stechend; Variante A „Grün gedämpft“)

- **v1.285:** nur der Block `@media (prefers-color-scheme:dark)`: Grund fast neutral (`--enclosure` #111310,
  `--surface` #23271F), `--strong` #86AE3C (Hauptknopf gedämpft), `--pe`/`--brand-dark` #8DB84A – der grüne
  Streifen der gemessenen Kreise bleibt (Jean), `--brand-ink` = `--ink` (Verweise hell, unterstrichen), `--sel`
  #C9CDBF, Rot `--fault` #F08A7E, `--warn-bg` #2E2220; Zurück-Ring, `.b-gleiter` neutral, Ränder von `.btn`/`.seg`
  in `--field-border`. Logogrün `--brand` bleibt (Logo, Wolke, Kamera). Hell unverändert.
- **v1.286 (Jean: 1 nein, 2–4 ja):** Vorschlag in den Prüfpunkten (`.seg button.vorschlag`) gestrichelt in
  `--ink-soft` (`outline`, hell und dunkel), „Vorschlag“ bleibt bernstein; `.z-bad .zst` gefüllte Scheibe mit
  ausgespartem „!“ (evenodd, beide Modi); im Dunkeln `.list-item .t` 500, `.no` 600; `.ord-zeile.an` Rand
  `--ink-soft`. Verworfen: Abschluss als Sammelkarte / „noch offen“ gelb (Jean: nein) – nicht wieder vorschlagen.

- **v1.287 (Jean: 1 ja, 2 a):** Lager-Knopf der Startseite nur noch mit Rand (2 px), kein äußerer Ring mehr:
  `ring-rot` rot (knapp), `ring-gelb` gelb (bestellt) – bewusste Ausnahme von „Gelb nur für bitte ansehen“
  (Jean: Lieferung steht noch aus). Nicht wieder auf Grau stellen.

## Erfassen flüssiger und ruhiger (Designteam 29.10.2026, Jean: Pakete C, A, B; Fragen 2–6 ja)

- **Paket C (v1.288) – Ziehen in `ordnenZiehen`:** Lagen über `offsetTop` (`messen()`, ohne transform/scale);
  `mv` setzt nur die Lage der Zeile, der Rest läuft per rAF in `malen()` und nur bei neuem `schluessel`
  (Ziel, freier Block i:k, Zahl der Reihenköpfe darüber); `zc` (Kennung → Zeile), `freiW` (Breiten der freien
  Blöcke) einmal beim Anheben. **Zwischenstufe entfällt** (Jean 4 ja; `luecke` immer false). **Freie Blöcke
  gehen erst in der Nähe auf** (`naehe()`, ± eine Zeilenhöhe, `.offen`, Skala nur dann): über dem Finger
  wächst der Block nach oben (Liste rollt mit, `ausgleich`), darunter nach unten; entfernt sich der Finger,
  schrumpft er. Halten: `.ord-zeile.halten` hebt sich über 250 ms (`scale` 1,015 + Schatten); `.zieht` deckend
  (`opacity:1`, über freiem Block .9 – Jean 3 ja, ersetzt „halb durchsichtig“ v1.242), `scale:1.03`, Federn
  140 ms; Nachbarn `transform 180ms cubic-bezier(.3,1.25,.5,1)`. **Ablegen sofort** mit
  `lageHalten(fn, ausgleich, vorherMap, gehoben)` – `sanftSpielen(vorher, gehoben)` lässt die gezogene Zeile
  (bzw. alle Zeilen der Gruppe aus der Karte) von ihrer Bildschirmlage mit Schatten absetzen (ersetzt „nie nach
  dem Ziehen“, Jean 2 ja), danach `zeileLeuchten`. Randrollen nach Zeit (bis ~900 px/s, 300 ms Anlauf),
  hält an, wenn die Karte bei `dMin`/`dMax` ansteht. Häkchen `.mark-neu` zeichnet sich.
  Gemessen (40 Zeilen, CPU ×4): Bilder > 20 ms beim Ziehen 47/51/47 → 4/3/2. Prüfung: `c-pruef.mjs`
  (Anzeige beim Ziehen = Ergebnis, 13 Fälle; Ziele nicht in die Randzone legen, sonst rollt die Liste weiter).
- **Paket A (v1.289) – Optik der Planliste** (CSS-Block „v1.289“ hinter `.list-item.ord-zeile .no`): Nummernspalte
  fest 48 px (`tabular-nums`), Kreise ohne Streifen (`border-left:1px`), FI mit `inset 4px` in `--ink-soft` und
  `--enclosure-2` (auch in `.halten`/`.zieht` mitgeführt); freie Zeile flach (48 px, gestrichelt `--line`, einzeilig);
  Reihenüberlauf `:has(.ord-reihe)` gelb (`--sig-bg`, `inset 4px --signal`), Text in `--signal-ink`; Ziel/Stufe/Platzhalter
  in `--pe` gedämpft (`color-mix`); beim Ziehen `#boardBody ~ :not(.actionbar)` auf .3.
- **Paket B (v1.290) – Gleiches gleich:** FI in der Planliste `planFiTitel(c)` („FI 40 A / 30 mA“), Unterzeile
  „4-pol. · deckt …“; Gruppenkarte „n Kreise“ mit `.bund-liste` (Nummer + Name) und Stapel-Schatten (`.bund`, `.bund3`);
  `.frei-skala::after` „frei“; `#planWahl` „n markiert · ✕ Markierung aufheben“ über der Leiste (`#btnPlanAufheben`),
  beim Markieren rückt die Liste, wenn die Leiste die Zeile verdeckt; Hinweis nur hinter `#btnPlanHilfe` („?“,
  `planHilfeAuf`); `waehlDialog` kennt `cls:'abbrechen'` (Textknopf, abgesetzt), genutzt in „Gerät einfügen“.
  Bewusst nicht: Nummern der freien Streifen „einfrieren“ – sie zeigen die Zielnummer (v1.243), sonst stimmte die
  Anzeige nicht mit dem Ergebnis.
- **Einrasten (v1.291, Versuch, Jean 6 ja):** `rasten(fr)` in `ordnenZiehen` – über einem freien Block steht die
  Zeile mittig auf ihrer Stufe (`transform 80ms`, Stufe weiter aus dem Finger), neue Stufe blitzt (`brightness`),
  `.zieh-text` wächst kurz; `mv` setzt dann keine Lage. Bei Missfallen: `rasten` liefert false → altes Gleiten.
- **v1.292 (Jean: Platz machender Kreis schnappte zu plötzlich; letzte TE nur „über die Reihengrenze“; „?“ kreuzte
  die Linie):** `ausweichen()` läuft jedes Bild – jede Zeile/Überschrift weicht stufenlos aus, Anteil
  f = (m − (c − H)) / H darunter bzw. (c + H − m) / H darüber (c = Mitte der Zeile, H = Höhe der gezogenen), voll genau
  an der Ziel-Schwelle; Übergang 60 ms linear, große Sprünge (freier Block an/aus) federnd; Platzhalter-Deckkraft
  1 − Anteil. Freie Blöcke beim Öffnen mit Rand `freiRand` = (H − `FREI_STUFE`) / 2 oben/unten (Skala innen,
  `imFrei`/`rasten` rechnen im Innern) – die Zeile steht auch auf der ersten/letzten Stufe ganz im Block.
  „?“ (`#btnPlanHilfe.plan-hilfe-knopf`) steht in `#kreiseTitel` hinter der Linie (`order:2`).
- **v1.293 (Jean, Video: Zeile stand sichtbar schon zwischen den Kreisen und schnappte zurück; Platzhalter nervös):**
  Ziel-Schwelle = sichtbares Kreuzen: `unter(c, nach)` – Element darunter gilt als überholt bei m > c − H/2, darüber
  bei m < c + H/2 (für `ziel`, Reihenköpfe `koepfeNach`, `anfang`); `ausweichen()` ist dort genau halb (f = 0,5).
  Der gestrichelte Platzhalter `.zieh-platz` entfällt ganz – die Lücke zeigt das Ziel. Tests: Ziele auch nicht in die
  Randzone über einer zweireihigen Leiste legen.
- **v1.294 (Jean: Rahmen der gezogenen Zeile links offen):** `.list-item.ord-zeile{border-left:1px …}` (v1.289) überdeckte
  die Randfarbe von `.zieht`/`.an` – `.list-item.ord-zeile.zieht/.an{border-left-color}` eigens gesetzt (dunkel `.an` grau).
  Ziehen nach v1.293 von Jean bestätigt: „fühlt sich deutlich ruhiger an“ (29.10.2026).

## Offen – von Jean noch am Gerät zu prüfen (Stand v1.294, 29.10.2026)

- **Erfassen Pakete A/B (v1.289/v1.290):** Optik, FI-Name, „n markiert“, „?“ am Gerät ansehen.
- **Ziehen (v1.288, Einrasten v1.291):** Halten/Anheben/Federn/Ablegen/Einrasten am iPhone ansehen – Werte (Größe, Federn, 250 ms) nach Gefühl nachstellen.
- **Dunkelmodus (v1.285):** im dunklen Keller bei geringer Helligkeit und draußen – Hauptknopf noch klar?
- **Designteam Runde 2 (v1.277–v1.282):** alles am Gerät ansehen (vorher „App neu laden“).
- **Startbild und Speicher auf dem Gerät (v1.273–v1.275):** Start ohne leeren Bildschirm, ohne Netz, neue Version beim übernächsten Öffnen.
- **Prüfvermerk (v1.210):** entschieden – Variante A mit Beschriftung auf der Verteiler-
  beschreibung; Aufkleber Ø 40 mm rund (Variante C) mit Beschriftung für die Wiederholungs-
  prüfung (Druckvorlage, Schnittlinie, Probebogen und Quellen in `vorlagen/pruefaufkleber/`). Am Ausdruck prüfen: Ü (v1.209), Größe.
  Selbst drucken auf A4-Etikettenbögen (Empfehlung Avery L3415, 24 × Ø 40 mm, dauerhaft,
  nicht „ablösbar“): Vorlage mit der Bogen-Aufteilung erst, wenn Jean die Etiketten
  gewählt hat (Ränder dann von ihm nachgemessen).
- **Leitung hinzufügen (v1.211–v1.217):** Zweck-Kacheln wie im Stromkreis, Dunstabzug/Kühlschrank mit Folgekacheln; Feld bleibt
  mit Tastatur im Bild (v1.213) – am Gerät ansehen.
- **Eine Liste (v1.229):** Markieren, Antippen, Ziehen, „Nächste Reihe“ am Gerät ausprobieren;
  ganze Reihe frei über „Nächste Reihe“ (v1.244); „+ Frei“ ohne Sprung nach oben (v1.245 –
  im Test sprang es nie, am iPhone prüfen); Gruppe ziehen und „Reihe n (neu)“ (v1.247), geleerte Reihen bleiben frei (v1.248, letzte Reihe v1.249), freie TE am Reihenende halten die Reihe (v1.250), Ziehen in eine freie Reihe (v1.252); FI-Abdeckung je Reihe und von Hand (v1.254).
- **Ordnen im praktischen Einsatz (v1.230–v1.243, Jean testet demnächst auf der Baustelle):**
  Ziehen an den Reihenanfang und hinter „bis Reihenende“, Stufen im freien Block (je TE ein
  Streifen, `FREI_STUFE` 30 px), Zwischenstufe (mittleres Drittel), Nummer eintippen, Halten am
  Griff (`GRIFF_HALTEN` 250 ms), Platzhalter/mitlaufende Nummern, zusammengefasste freie TE,
  `namenVereinen`. Werte bei Bedarf nachjustieren. Bekannt: am Bildschirmrand rollt die Liste
  beim Ziehen mit, dann läuft die Stufe schnell hoch.
- **Prüfung Erfassen (v1.221–v1.225):** alle fünf Pakete am Gerät durchgehen, besonders
  Listenlage (v1.223), Kacheln (v1.224) und Ordnen mit „+ FI“/Reihenende (v1.225).
- **Freie TE (v1.218–v1.220):** Ordnen mit „+ Frei“, Lücken bleiben, Nummern sofort beim Ziehen – am Gerät ausprobieren.
- **FI im Messen (v1.191):** öffnet die Tastatur beim Auslösestrom auch über „Weiter →“
  und aus der Liste? Hier nicht prüfbar.
- **Neuausgabe zeigte alten Inhalt:** liegt nach Jeans Versuch (Umbenennen) an
  iCloud/Dateien-App, nicht an der App. Empfohlen: im Kurzbefehl bei „Datei sichern“
  „Ersetzen“ an, nicht vorher von Hand löschen. „Ersetzen“ ist an (Jean, 14.10.2026);
  offen, ob der alte Inhalt seitdem noch vorkommt. Falls es bleibt: Uhrzeit im Dateinamen als Ausweg (nur nach Rückfrage).
- Bestätigt von Jean: v1.196 (Protokoll ohne Umbruch: rechte Spalte neben dem
  Mängelfeld gibt mit `rechtsOben` nach; Ordner der Neuinstallation nach
  `angelegt` statt `startedAt`, das bei der ersten Messung rückt), Tastatur-Darstellung (v1.185), Lager-Namen (v1.187),
  Verteilerbeschreibung auf einem Blatt (v1.190), Zusammenlegen ohne Markierung
  (v1.194), Ziehen gleitend (v1.195, „sehr schön“), Griff mit Halten und ruhige Liste beim
  Ziehen, Zusammenlegen und Antippen freier TE (v1.236–v1.241, 21.10.2026), Verschieben in Reihen samt
  Gruppe ziehen, neuen und geleerten Reihen (v1.244–v1.252, 25.10.2026: „funktioniert jetzt“), langes Blatt „Leitung hinzufügen“ – Inhalt federt, Knöpfe stehen (v1.262, 28.10.2026), Bewegungen (v1.257–v1.260) und Adressvorschläge (v1.256), ruhiger Feldwechsel und Sprung zum Schutzleiterwiderstand mit Tastatur (v1.266–v1.269), „Weiter →“ über der Tastatur, Tastatur bleibt beim Kreiswechsel offen (v1.272), 28.10.2026.

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
  einer Berührung heraus und lässt nichts in die iOS-Kamera schreiben. Seit v1.143
  gibt es deshalb die Kamera der App (`samKamOeffnen`, getUserMedia, voreingestellt,
  `CFG.eigeneKamera`); Jean fotografiert damit (14.10.2026). Hinweise im Sucher sind
  dort möglich, die iOS-Kamera bleibt Ersatzweg.
- **Umbau (14.10.2026):** SAM wird nach `sam-werkstatt/docs/umbau/KONZEPT.md`
  überarbeitet (ehrliche Markierung, Mehrfachlesung, später Kern-Umbau). Ältestes
  Gerät der Kollegen: iPhone 13 Pro. Seit v1.208 ist `sam.html` = Werkstatt v0.61 (v1.205: v0.60, v1.204: v0.59, v1.203: v0.58) (Mehrfachlesung:
  bei Bernstein zwei weitere Lesungen, Zwischenstände „Zweite/Dritte Lesung“ kommen als `{stand}`).
- **Etappe 4a (v1.206):** `samKreis` setzt `c.samZw` (Felder, die SAM unsicher las) und
  `c.samGelesen`; `samZwOffen` macht den Kreis in Erfassen bernstein („SAM: Nummer ansehen“),
  `samZwZeigen` umrandet die Felder (`.sam-zw`), `messKopfSetzen` markiert im Messen.
  `persistCircuit` löscht `samZw` (Speichern = angesehen) und notiert Änderungen still in
  `Store 'samNotiz'` (nur lokal, je Projekt; dazu Zeit vom Lesen bis zum Übernehmen).
  `#btnSamBoard` springt zum nächsten; Abschluss gelbe Karte, sperrt nicht (Jean).
- **Etappe 4c (v1.207):** `samLesung.leerNr` hält die Nummern ohne Text; `samTextFehlt`
  (am Ende von `samVerknuepfen`) sucht je Verteiler-Reihe den Versatz Nummer − Lage in TE
  (`te`, `teAb` aus der Geräteerkennung, Lücken zählen mit), bei dem ≥ 60 % der Geräte auf
  Einträge gleicher Breite fallen (ein Eintrag erklärt nur eine Reihe, Gleichstand: Zuordnung),
  oder nimmt den sicheren Streifen. Gerät auf einer leeren Nummer → Zeile `ausVt` bernstein
  („Text auf dem Blatt nicht gelesen – Gerät vom Verteiler“); beim nächsten Abgleich neu gebaut.
  Alte Lesungen ohne `teAb` bleiben unberührt.
- **Etappe 4b (v1.208, SAM v0.61):** `sam.html` schickt je Zeile `bild` (JPEG-Streifen); `samLesen`
  legt sie nur auf dem Gerät ab (`Bilder.datenLegen('streifen:<Foto>')`, Speicher `SAM_STREIFEN`)
  und entfernt sie vor Projekt und Trainingsordner. `z.streifen`/`c.samStreifen` = Index;
  `samStreifenZeigen` in der SAM-Liste (`#seStreifen`), im Kreis (`#cStreifen`) und im Messen-Kopf
  bei offenem Zweifel; Antippen vergrößert (`.sam-streifen.gross`).
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
