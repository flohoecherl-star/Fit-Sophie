// Inhalte der App: Phasen, Einheiten, HIIT, Coaching. Alles auf Deutsch.
// Quellen siehe README.md und Reiter "Coach" > "Quellen".

window.SF_DATA = (() => {
  // Phasen nach Wochen seit der Geburt (pp = postpartum). Wechsel nur, wenn die Kriterien erfüllt sind.
  const PHASES = [
    {
      key: 'p1', name: 'Fundament', ppFrom: 6, ppTo: 10, color: 'var(--p1)',
      goal: 'Beckenboden und tiefe Bauchmuskeln ansteuern, Atmung, erste leichte Kraftübungen, zügiges Gehen.',
      slots: ['p1_kraft', 'p1_walk', 'p1_kraft', 'p1_intwalk'],
      daily: 'pf_full',
      criteria: [
        'Beckenboden im Stehen: 10 schnelle Anspannungen, 10 × 6 Sek. halten, 1 × 60 Sek. halb so stark',
        '30 Min. zügig gehen ohne Druck- oder Schweregefühl',
        'Kein Urinverlust im Alltag, Wochenfluss abgeschlossen',
        'Bauchmitte baut beim Kopfheben Spannung auf, keine Wölbung',
        'Nachuntersuchung bei der Frauenärztin erledigt, ohne Einwände',
      ],
    },
    {
      key: 'p2', name: 'Aufbau', ppFrom: 11, ppTo: 16, color: 'var(--p2)',
      goal: 'Ganzkörperkraft mit Kurzhanteln und Band, Ausdauer ohne Stoß (Rad, Crosstrainer, Schwimmen), erste Intervalle im Sitzen.',
      slots: ['p2_kraftA', 'p2_cardio', 'p2_kraftB', 'p2_bike'],
      daily: 'pf_short',
      criteria: [
        'Beide Kraft-Einheiten mit 3 Runden sauber und beschwerdefrei',
        '45 Min. Rad, Crosstrainer oder zügiges Gehen ohne Beschwerden',
        'Kraft-Test: je 20 × einbeiniges Wadenheben, einbeinige Brücke, Seitlage-Beinheben (je Seite)',
        'Belastungstest bestanden: 1 Min. auf der Stelle joggen, 10 Hüpfer vorwärts, 10 Hops je Bein, 10 × „Running Man“ je Seite',
        'Mindestens 12 Wochen seit der Geburt',
      ],
    },
    {
      key: 'p3', name: 'Laufstart & HIIT', ppFrom: 17, ppTo: 24, color: 'var(--p3)',
      goal: 'Schwerere Kraft-Einheiten, Lauf-Geh-Einstieg, Low-Impact-HIIT ohne Sprünge.',
      slots: ['p3_kraftA', 'p3_run', 'p3_kraftB', 'p3_hiit'],
      daily: 'pf_short',
      criteria: [
        'Lauf-Geh-Programm bis „20 Min. am Stück“ beschwerdefrei',
        'Unterarmstütz 30 Sek. ohne Wölbung der Bauchmitte',
        'Low-Impact-HIIT ohne Druck im Becken',
        'Kraft: Goblet Squat und Kreuzheben mit spürbarem Gewicht sauber über 3 Wochen',
      ],
    },
    {
      key: 'p4', name: 'Vollplan', ppFrom: 25, ppTo: 99, color: 'var(--p4)',
      goal: 'Dauerhaft fit: zwei Kraft-Tage, ein Lauf-Tag, ein HIIT-Tag. Sprünge erst nach 4 Wochen beschwerdefreiem Laufen.',
      slots: ['p4_lower', 'p4_run', 'p4_upper', 'p4_hiit'],
      daily: 'pf_short',
      criteria: [
        'Laufumfang höchstens 10 % pro Woche steigern',
        'Gewicht erhöhen, wenn alle Sätze am oberen Ende sauber gehen',
        'Alle 4 bis 6 Wochen eine leichtere Woche einplanen',
      ],
    },
  ];

  const E = (name, dose, hint) => ({ name, dose, hint });

  const SESSIONS = {
    pf_full: { title: 'Beckenboden-Routine', mins: 12, kind: 'pf', ex: [
      E('360°-Atmung', '2 Min.', 'Rückenlage, in Bauch, Flanken und Rücken einatmen, lang ausatmen.'),
      E('Beckenboden halten', '10 × 6–10 Sek.', 'Ausatmen, schließen, nach innen oben ziehen. Danach ganz loslassen.'),
      E('Beckenboden schnell', '10 ×', '1 Sek. kräftig, dann komplett locker.'),
      E('Tiefer Bauch', '10 × 5 Sek.', 'Bauchnabel sanft nach innen, Beckenboden mit.'),
      E('Beckenkippen', '10 ×', ''),
      E('Im Stehen üben', '5 × 6 Sek.', 'Ab Woche 3: auch im Stehen und beim Baby-Hochheben anspannen.'),
    ]},
    pf_short: { title: 'Beckenboden kurz', mins: 5, kind: 'pf', ex: [
      E('Beckenboden halten im Stehen', '8–12 × 6–8 Sek.', ''),
      E('Beckenboden schnell', '10 ×', ''),
      E('Ausdauer-Halten', '1 × 60 Sek.', 'Nur halb so stark anspannen, normal weiteratmen.'),
    ]},

    p1_kraft: { title: 'Fundament-Kraft', mins: 25, kind: 'kraft', rounds: '2 Runden, 60 Sek. Pause', ex: [
      E('Brücke', '12', 'Ausatmen und Beckenboden anspannen, dann Po hoch.'),
      E('Kniebeuge zum Stuhl', '10', 'Kurz antippen, wieder hoch.'),
      E('Liegestütz an der Wand', '10', ''),
      E('Rudern mit Band', '12', 'Schulterblätter zusammen.'),
      E('Kreuzheben mit Babygewicht', '10', 'Leichte Kurzhanteln oder Babyschale ohne Baby, Rücken lang.'),
      E('Seitlage Beinheben', '10 je Seite', ''),
      E('Fersen schieben', '8 je Seite', 'Becken bleibt ruhig.'),
    ]},
    p1_walk: { title: 'Power-Walk', mins: 35, kind: 'cardio', ex: [
      E('Zügig gehen', '30–40 Min.', 'Gern mit Kinderwagen. Sprechen geht noch, Singen nicht mehr.'),
      E('Alternativ: Ergometer', '20–30 Min.', 'Nur wenn Sitzen auf dem Sattel angenehm ist.'),
    ]},
    p1_intwalk: { title: 'Intervall-Gehen', mins: 20, kind: 'hiit', hiit: 'walk', ex: [
      E('5 Min. locker einlaufen', '', ''),
      E('6 × 1 Min. zügig / 2 Min. locker', 'Timer', 'Bergauf ist ideal.'),
      E('5 Min. locker auslaufen', '', ''),
    ]},

    p2_kraftA: { title: 'Kraft A', mins: 35, kind: 'kraft', rounds: '3 Runden, 60–90 Sek. Pause', ex: [
      E('Goblet Squat', '10–12', 'Kurzhantel vor der Brust.'),
      E('Hip Thrust am Sofa', '12', ''),
      E('Einarmiges Rudern', '10 je Seite', ''),
      E('Liegestütz an der Arbeitsplatte', '8–10', ''),
      E('Bird Dog', '6 je Seite', ''),
      E('Dead Bug, Füße tippen', '6 je Seite', ''),
    ]},
    p2_kraftB: { title: 'Kraft B', mins: 35, kind: 'kraft', rounds: '3 Runden, 60–90 Sek. Pause', ex: [
      E('Ausfallschritt rückwärts', '8 je Seite', 'Erst mit Halt, dann frei.'),
      E('Rumänisches Kreuzheben', '10', ''),
      E('Schulterdrücken im Sitzen', '10', ''),
      E('Seitstütz auf Knien', '20–30 Sek. je Seite', ''),
      E('Clamshell mit Band', '12 je Seite', ''),
      E('Einbeiniges Wadenheben', '12 je Seite', 'Vorbereitung für den Kraft-Test.'),
    ]},
    p2_cardio: { title: 'Ausdauer ohne Stoß', mins: 40, kind: 'cardio', ex: [
      E('Rad, Crosstrainer oder Schwimmen', '30–45 Min.', 'Schwimmen erst, wenn der Wochenfluss vorbei ist.'),
      E('Tempo', 'locker bis mittel', 'Unterhalten muss möglich sein.'),
    ]},
    p2_bike: { title: 'Rad-Intervalle', mins: 25, kind: 'hiit', hiit: 'bike', ex: [
      E('5 Min. locker einrollen', '', ''),
      E('8 × 30 Sek. zügig / 90 Sek. locker', 'Timer', 'Im Sitzen bleiben.'),
      E('5 Min. ausrollen', '', ''),
    ]},

    p3_kraftA: { title: 'Kraft A', mins: 40, kind: 'kraft', rounds: '3–4 Sätze, 8–12 Wdh.', ex: [
      E('Goblet Squat', '8–12', 'Schwerer als in Phase 2.'),
      E('Hip Thrust mit Gewicht', '10–12', ''),
      E('Einarmiges Rudern', '10 je Seite', ''),
      E('Liegestütz erhöht', '8–10', 'Höhe nach und nach senken.'),
      E('Pallof Press', '10 je Seite', ''),
      E('Dead Bug, Beine gestreckt', '8 je Seite', ''),
    ]},
    p3_kraftB: { title: 'Kraft B', mins: 40, kind: 'kraft', rounds: '3–4 Sätze, 8–12 Wdh.', ex: [
      E('Rumänisches Kreuzheben', '8–10', ''),
      E('Split Squat', '10 je Seite', ''),
      E('Schulterdrücken im Stehen', '10', ''),
      E('Step-ups', '10 je Seite', ''),
      E('Seitstütz', '30 Sek. je Seite', ''),
      E('Unterarmstütz', '3 × 20–30 Sek.', 'Nur ohne Wölbung der Bauchmitte.'),
    ]},
    p3_run: { title: 'Lauf-Geh-Einstieg', mins: 30, kind: 'run', ex: [
      E('Woche 1: 8 × (1 Min. laufen / 2 Min. gehen)', '', ''),
      E('Woche 2: 6 × (2 / 2)', '', ''),
      E('Woche 3: 5 × (3 / 1:30)', '', ''),
      E('Woche 4: 4 × (5 / 1)', '', ''),
      E('Woche 5: 3 × (8 / 1)', '', ''),
      E('Woche 6: 2 × (12 / 1)', '', ''),
      E('Danach: 20–30 Min. am Stück', '', 'Erst Umfang, dann Tempo. Bei Beschwerden eine Woche zurück.'),
    ]},
    p3_hiit: { title: 'Low-Impact-HIIT', mins: 25, kind: 'hiit', hiit: 'circuit', alt: 'tabata', ex: [
      E('Gerade Wochen: Low-Impact-Zirkel', 'Timer', '8 Übungen, 30/30 Sek., 2 Runden.'),
      E('Ungerade Wochen: Tabata Low-Impact', 'Timer', '2 Blöcke à 4 Min.'),
    ]},

    p4_lower: { title: 'Unterkörper + Rumpf', mins: 45, kind: 'kraft', rounds: '3–4 Sätze, 6–12 Wdh.', ex: [
      E('Kniebeuge (Goblet oder Langhantel)', '6–10', ''),
      E('Rumänisches Kreuzheben', '8–10', ''),
      E('Bulgarian Split Squat', '8 je Seite', ''),
      E('Hip Thrust', '10–12', ''),
      E('Einbeiniges Wadenheben', '15 je Seite', ''),
      E('Pallof Press oder Seitstütz mit Beinheben', '3 Sätze', ''),
    ]},
    p4_upper: { title: 'Oberkörper + Rumpf', mins: 45, kind: 'kraft', rounds: '3–4 Sätze, 8–12 Wdh.', ex: [
      E('Liegestütz', '6–12', 'Knie oder voll.'),
      E('Rudern', '10–12', ''),
      E('Schulterdrücken', '8–10', ''),
      E('Latzug oder Klimmzug mit Band', '8–10', ''),
      E('Farmer’s Walk', '3 × 30 m', ''),
      E('Plank mit Schulter-Tippen', '3 × 10 je Seite', ''),
    ]},
    p4_run: { title: 'Lauf', mins: 35, kind: 'run', ex: [
      E('Lockerer Dauerlauf', '25–45 Min.', 'Höchstens 10 % mehr Umfang pro Woche.'),
      E('Alle 2 Wochen statt dessen', 'Timer', 'Lauf-Intervalle aus dem HIIT-Reiter.'),
    ]},
    p4_hiit: { title: 'HIIT', mins: 25, kind: 'hiit', hiit: 'run', alt: 'impact', ex: [
      E('Gerade Wochen: Lauf-Intervalle', 'Timer', '6 × 1 Min. zügig / 2 Min. locker.'),
      E('Ungerade Wochen: Impact-HIIT', 'Timer', 'Erst nach 4 Wochen beschwerdefreiem Laufen, sonst Low-Impact-Zirkel.'),
    ]},
  };

  // HIIT-Bibliothek. phase = frühestmögliche Phase (Index).
  const HIIT = [
    { id: 'walk', title: 'Intervall-Gehen', phase: 0, level: 1, from: 'Phase 1, ab Woche 3',
      desc: 'Zügig oder bergauf im Wechsel mit lockerem Gehen. Geht gut mit Kinderwagen.',
      rounds: 6, work: 60, rest: 120, ex: [['Zügig gehen', 'So schnell, dass Reden schwerer fällt']], restName: 'Locker gehen' },
    { id: 'bike', title: 'Rad-Intervalle', phase: 1, level: 2, from: 'Phase 2',
      desc: 'Ergometer oder Fahrrad, im Sitzen. Kein Stoß für den Beckenboden.',
      rounds: 8, work: 30, rest: 90, ex: [['Zügig treten', 'Etwa 7 von 10']], restName: 'Locker treten' },
    { id: 'circuit', title: 'Low-Impact-Zirkel', phase: 2, level: 3, from: 'Phase 3',
      desc: 'Acht Übungen ohne Sprünge, 30 Sek. Arbeit, 30 Sek. Pause, zwei Runden.',
      rounds: 2, work: 30, rest: 30, roundRest: 90, restName: 'Pause', ex: [
        ['Kniebeuge mit Kurzhantel', 'Hoch ausatmen'], ['Step-ups zügig', 'Seite pro Runde wechseln'],
        ['Mountain Climber am Tisch', 'Hände erhöht, kontrolliert'], ['Seitschritt-Skater', 'Ohne Sprung, tief in die Hüfte'],
        ['Band-Rudern schnell', ''], ['Squat to Press', ''], ['Marschieren mit hohen Knien', 'Kein Hüpfen'], ['Brücke im Tempo', 'Oben kurz halten'],
      ] },
    { id: 'tabata', title: 'Tabata Low-Impact', phase: 2, level: 3, from: 'Phase 3, ab Woche 3 der Phase',
      desc: 'Zwei Blöcke mit je zwei Übungen im Wechsel, 20 Sek. Arbeit, 10 Sek. Pause.',
      rounds: 4, work: 20, rest: 10, blockRest: 60, restName: 'Pause', blocks: [
        [['Kurzhantel-Swing (leicht)', 'Kraft aus der Hüfte'], ['Seitschritt-Skater', 'Ohne Sprung']],
        [['Rückwärts-Ausfallschritt im Wechsel', ''], ['Box-Punches mit Kurzhanteln', 'Rumpf fest']],
      ] },
    { id: 'run', title: 'Lauf-Intervalle', phase: 3, level: 4, from: 'Phase 4',
      desc: 'Nach 10 Min. Einlaufen. Danach 5 Min. auslaufen.',
      rounds: 6, work: 60, rest: 120, ex: [['Zügig laufen', 'Etwa 8 von 10, nicht sprinten']], restName: 'Gehen oder traben' },
    { id: 'impact', title: 'Impact-HIIT', phase: 3, level: 5, from: 'Phase 4, nach 4 Wochen beschwerdefreiem Laufen',
      desc: 'Mit kleinen Sprüngen. Bei Druck im Becken oder Urinverlust die Low-Impact-Variante nehmen.',
      rounds: 3, work: 40, rest: 20, roundRest: 90, restName: 'Pause', ex: [
        ['Kniebeuge mit kleinem Sprung', 'Weich landen'], ['Hampelmann', 'Alternative: Step-Jacks'], ['Mountain Climber', ''],
        ['Skater-Hops', 'Klein anfangen'], ['Burpee ohne Sprung', 'Füße zurücksetzen'], ['High Knees', ''],
      ] },
  ];

  // Wochenfokus fürs Coaching, nach Planwoche (wiederholt sich ab Woche 13 im Kreis).
  const FOCUS = [
    ['Klein anfangen', 'Fünf Minuten zählen. Wer jeden Tag kurz übt, kommt weiter als mit einer langen Einheit pro Woche.'],
    ['Wenn-dann-Plan', 'Lege fest: „Wenn das Baby mittags einschläft, dann mache ich meine Beckenboden-Routine.“ Feste Auslöser schlagen Motivation.'],
    ['Schlaf in Schichten', 'Florian übernimmt einen festen Block in der Nacht oder am Morgen (z. B. Fläschchen mit abgepumpter Milch). 4 bis 5 Stunden am Stück wirken Wunder für die Energie.'],
    ['Eiweiß zu jeder Mahlzeit', 'Eine Handfläche Eiweiß pro Mahlzeit: Skyr, Eier, Hülsenfrüchte, Fisch, Fleisch, Tofu. Das hält satt und hilft beim Muskelaufbau.'],
    ['Nie zweimal auslassen', 'Eine Einheit ausfallen lassen ist normal. Danach gilt: die nächste nicht auch noch. Notfalls die 10-Minuten-Version.'],
    ['Tageslicht am Morgen', '10 bis 20 Minuten draußen am Vormittag stabilisieren den Schlaf-Wach-Rhythmus und heben die Stimmung. Der Kinderwagen-Spaziergang zählt.'],
    ['Fortschritt sichtbar machen', 'Hake Einheiten ab und schau am Sonntag auf die Woche. Mehr Wiederholungen, mehr Gewicht, weniger Schnaufen: notiere es.'],
    ['Wasser beim Stillen', 'Zu jeder Stillmahlzeit ein Glas Wasser bereitstellen. Leichter Durst und Müdigkeit hängen oft zusammen.'],
    ['Leichte Woche', 'Diese Woche Umfang um ein Drittel kürzen. Erholung ist Teil des Trainings, besonders mit wenig Schlaf.'],
    ['Vorbereitung ist die halbe Miete', 'Sonntag 45 Minuten Meal-Prep: ein Blech Ofengemüse, eine Portion Eiweiß, Overnight Oats. Spart unter der Woche Energie.'],
    ['Körpergefühl vor Plan', 'Der Plan ist ein Angebot. Druckgefühl, Schmerzen oder Erschöpfung haben Vorrang. Eine Stufe zurück ist kein Rückschritt.'],
    ['Feiern', 'Drei Monate dabei geblieben. Was geht heute, was vor 12 Wochen nicht ging? Zeit für eine kleine Belohnung.'],
  ];

  return { PHASES, SESSIONS, HIIT, FOCUS };
})();
