---
slug: jianbing-guozi-executable-steps
translationKey: jianbing-guozi-executable-steps
locale: de
kind: article
title: "Kann es kochen oder nur das Rezept schreiben? Zwölf Küchenszenarien zeigen, ob sich die Schritte eines Modells umsetzen lassen"
description: "Ein Modell kann eine geduldige, vollständige Jianbing-Anleitung schreiben, nach der ein Anfänger trotzdem nicht kochen kann. Diese Runde prüft, ob aus dem Wissen ein Plan für die Küche zu Hause wird, dem man folgen, den man anpassen und mit dem man weitermachen kann, wenn etwas schiefgeht."
category: Tests
tags: [tests, alltag, küche]
authorId: iris-wu
modelIds: []
benchmarkSlugs: []
relatedSlugs: [how-to-score-a-cycling-pelican]
publishedAt: '2026-10-11'
updatedAt: '2026-10-11'
sources:
  - id: jianbing
    label: Folkbench – Jianbing zubereiten, wessen Schritte funktionieren?
    url: https://folkbench.com/de/evaluations/jianbing-guozi
    checkedAt: '2026-10-11'
    claimScope: observed
---

# Kann es kochen oder nur das Rezept schreiben? Zwölf Küchenszenarien zeigen, ob sich die Schritte eines Modells umsetzen lassen

Ein Modell kann eine geduldige, vollständige Jianbing-Anleitung schreiben, nach der ein Anfänger trotzdem nicht kochen kann.

Eine echte Küche zu Hause hat viele Variablen. Pfannen unterscheiden sich in Größe und Material. Der Teig kann zu dick oder zu dünn sein. Die Hitze ändert sich zwischen dem Verstreichen der Crêpe, dem Aufschlagen des Eis und dem Wenden. Das dünne, knusprige Teigblatt Baocui ist nicht immer zu bekommen. Und morgens bleiben manchmal nur 20 Minuten. Nach dem ersten Fehlschlag braucht man kein weiteres hübsches Rezept. Man braucht jemanden, der beurteilen kann, warum die Crêpe gerade gerissen ist, und der sagt, ob sich dieser Versuch noch retten lässt.

Deshalb prüft dieser [Jianbing-Test](https://folkbench.com/de/evaluations/jianbing-guozi) nicht, ob ein Modell ein Rezept aufsagen kann. Er prüft, ob das Modell sein Wissen in einen Plan verwandeln kann, den man in der Küche zu Hause umsetzen und anpassen kann und mit dem man weiterkommt, wenn etwas schiefgeht.

## Zuerst das Ergebnis: Jenseits des Durchschnitts stecken die Unterschiede in Fehlschlägen und Risiken

Diese Runde umfasste 12 Szenarien aus der Küche zu Hause. Vier Modelle hinterließen 48 Ergebnisse mit übereinstimmendem promptHash. Die Regelwertung der Seite betrachtet eine Antwort aus fünf Blickwinkeln: ob man den Schritten folgen kann, ob sie Küchenverstand zeigen, ob sie mit einem Fehlschlag umgehen, ob die Darstellung klar ist und ob sich das Modell als übermäßig selbstsicherer Küchenmeister inszeniert.

Die auf der Seite veröffentlichten Gesamtwerte:

| Modell | Gesamt | Vorn bei den 12 Aufgaben (inkl. Gleichstand) | Auf der Seite markierte Regelhinweise oder harte Risiken |
| --- | ---: | ---: | --- |
| Sonnet 5 | 80,4 | 6 | Keine |
| GLM 5.2 | 79,3 | 5 | 1 Regelhinweis |
| Kimi K2.7 Code | 77,6 | 3 | 1 Regelhinweis, 1 hartes Risiko |
| GPT-5.6 Terra | 75,6 | 0 | Keine |

![Gesamtwerte der vier Modelle: Sonnet 5 erreicht 80,4, GLM 5.2 79,3, Kimi K2.7 Code 77,6 und GPT-5.6 Terra 75,6. Die Balkenlänge folgt einer Skala von 0 bis 100. Unter jedem Balken stehen die Zahl der Aufgaben, bei denen das Modell vorn lag, und die Risikomarkierungen.](/blog/figures/jianbing-guozi-executable-steps/scores-de.svg)

Sonnet 5 führt mit 80,4. Insgesamt kommt es am ehesten einer Anleitung gleich, die man einem Anfänger in die Hand geben könnte: Der erste Versuch, die Hitzekontrolle der Pfanne und das 20-Minuten-Frühstück gelingen vergleichsweise sicher. GLM 5.2 liegt nur 1,1 Punkte dahinter, erreicht bei den Arbeitsschritten aber 90 Punkte, den höchsten Wert der Runde. Kimi K2.7 Code hat einen niedrigeren Gesamtwert, schneidet aber in Szenarien am besten ab, die eine spontane Rettung verlangen, etwa „Die Crêpe ist gerissen, wie rette ich sie?“. GPT-5.6 Terra erreicht bei der ersten vollständigen Anleitung 84,2, zeigt aber deutliche Schwächen beim Teigverhältnis, bei der Hitze der Elektro-Bratplatte und bei der Fehlerdiagnose.

Auf den ersten Blick ist das ein Zeugnis für vier Modelle. Mehr Aufmerksamkeit verdient eine Tatsache, die leicht übersehen wird: **Umsetzbarkeit ist keine einzelne Fähigkeit. Ein Modell kann die Schritte klar aufschreiben und trotzdem schlecht darin sein, einen Fehlschlag zu diagnostizieren. Es kann gut im Retten sein und trotzdem ein Problem an der Sicherheitsgrenze hinterlassen, das man nicht ignorieren darf.**

## 1. Eine Küche zu Hause ist keine Rezeptvitrine

Fragt man nur „Wie mache ich Jianbing?“, liefert ein Modell bereitwillig etwas, das wie eine vollständige Standardantwort aussieht: Mehl bereitstellen, Teig anrühren, Pfanne vorheizen, Crêpe verstreichen, Ei aufschlagen, Frühlingszwiebeln darüberstreuen, Soße aufstreichen, das Knusperblatt auflegen und alles aufrollen.

Auf der Ebene der Worte hat diese Antwort vielleicht keinen offensichtlichen Fehler. Die Fragen, auf die ein Anfänger tatsächlich stößt, beantwortet sie aber nicht:

- Zu Hause gibt es nur eine beschichtete 26-cm-Pfanne und keinen Teigverteiler. Reichen Schöpfkelle und Pfannenwender?
- Wie dünn sollte der Teig eigentlich sein? Warum wird die Crêpe bei gleichem Verhältnis von Wasser zu Mehl bei dem einen zu dick, während sie beim anderen beim ersten Wenden reißt?
- Wenn es kein Knusperblatt gibt: Was bewirken Wan-Tan-Blätter, Youtiao (frittierte Teigstangen), Kartoffelchips und ein gewöhnliches dünnes Fladenbrot jeweils beim Ergebnis?
- Wie beurteilt man die Hitze einer Bratpfanne und die einer Elektro-Bratplatte? Wann kann man aufrollen, nachdem das Ei in der Pfanne ist?
- Die Crêpe ist schon gerissen, und das Ei ist noch nicht ganz gestockt. Weiter verstreichen, mit einem weiteren Löffel Teig flicken oder neu anfangen?
- Wenn nur eine Edelstahlpfanne da ist: Wie verringert man das Risiko, dass etwas anhängt?
- Kann man übrigen Teig und eine fertige Crêpe, die schon mit Soße bestrichen und mit Schinken belegt ist, am nächsten Tag noch essen?

![Eine begrenzte Ausstattung zu Hause: eine beschichtete Pfanne, ein Pfannenwender und eine Schöpfkelle, daneben Teig, Eier und Frühlingszwiebeln.](/blog/figures/jianbing-guozi-executable-steps/kitchen-setup.webp)

![Vier Ersatzlösungen, wenn das Knusperblatt fehlt: Wan-Tan-Blätter, Youtiao, Kartoffelchips und gewöhnliche dünne Fladenbrote.](/blog/figures/jianbing-guozi-executable-steps/substitutes.webp)

Solche Fragen verlangen vom Modell, Zutaten, Werkzeuge, Zeit, Reihenfolge, wechselnde Zustände und Risiken gleichzeitig zu berücksichtigen. Es geht nicht darum, Wissen aus dem Gedächtnis abzurufen. Es geht darum, den nächsten Handgriff aus den vorliegenden Bedingungen neu zu entwickeln.

Deshalb fragt die Seite nicht nur „Bitte ein Jianbing-Rezept schreiben“. Sie teilt die Aufgabe in 12 Szenarien auf: der erste Versuch eines Anfängers, das Teigverhältnis, ein Ersatz für das Knusperblatt, Hitzekontrolle auf verschiedenen Pfannen, die Rettung einer gerissenen Crêpe, fehlende Zutaten, eine fett- und schärfearme Version für ein Kind, ein 20-Minuten-Frühstück, Fehlerdiagnose, das Timing für drei Personen, eine Edelstahlpfanne und die Aufbewahrung über Nacht. Jede Frage drängt das Modell zu einer Nachfrage, die näher am echten Leben ist: **Lässt sich der nächste Schritt noch klar benennen, wenn die Bedingungen nicht ideal sind?**

## 2. Die entscheidende Trennlinie: Ausführlich heißt nicht zuverlässig

GLM 5.2 ist in dieser Runde ein gutes Beispiel. Bei den Arbeitsschritten erreicht es 90 Punkte. Es kann also einen Ablauf gut zerlegen und gibt konkrete Ratschläge für Bedingungen wie „nicht genug Zutaten“, „genug für drei Personen auf einmal“ und „wie man Teig und fertige Crêpe aufbewahrt“. Wer nur darauf achtet, wie vollständig der Text ist, bewertet eine solche Antwort leicht hoch.

Die Seite weist aber auch darauf hin, dass es bei der Frage zur Edelstahlpfanne empfiehlt, die Pfanne zu erhitzen, „bis sie bläulich raucht“, und das Einbrennen zu wiederholen. Ein solches Vorheizen bei hoher Hitze ist für einen normalen Haushalt alles andere als schonend. Je konkreter die Handlung in einer Antwort beschrieben ist, desto eher setzen Nutzer sie direkt um. Ein konkreter Rat, der nicht zur Situation passt, macht aus „wirkt professionell“ ein echtes Risiko.

![Eine Hand hält über einer Edelstahlpfanne inne, um die Hitze zu prüfen. Die Flamme ist klein, die Pfanne ist trocken, und es raucht nicht.](/blog/figures/jianbing-guozi-executable-steps/stainless-heat.webp)

Kimi K2.7 Code zeigt noch deutlicher, warum ein Durchschnitt nicht reicht. Bei „Die Crêpe ist gerissen, wie rette ich sie?“ erzielt es den höchsten Wert. Bei einer Pfanne mit gerissener Crêpe und noch nicht ganz gestocktem Ei gibt es Rettungsschritte, die sich gut umsetzen lassen. Auch bei den Szenarien zum Teig und für drei Personen liefert es brauchbare Details.

![Die Crêpe ist gerissen, und das Ei ist noch nicht ganz gestockt. Mit einer Schöpfkelle wird ein Löffel Teig zum Flicken nachgegeben.](/blog/figures/jianbing-guozi-executable-steps/torn-crepe.webp)

Bei „Morgens in 20 Minuten fertig“ markiert die Seite jedoch ein hartes Risiko für die Lebensmittelsicherheit, das sich nicht ignorieren lässt: Die Antwort legt nahe, dass Eier vorab herausgenommen und bei Zimmertemperatur stehen gelassen werden können. Wie gut die anderen Fragen auch beantwortet sind – dieser Punkt sollte gesondert ausgewiesen werden. Er darf nicht durch den „höchsten Wert bei der Rettungsfrage“ aufgewogen werden.

Das heißt nicht, dass jeder Vorschlag von Kimi K2.7 Code unzuverlässig ist, und es ist auch kein dauerhaftes Etikett, das ihm schwache Fähigkeiten bei der Lebensmittelsicherheit bescheinigt. Die genaue Aussage lautet: **In dieser Runde, bei dieser Frage, in diesem konkreten Vorschlag trat ein hartes Risiko im Sinne der Regeln der Seite auf.** Für Nutzer hat diese Information Vorrang vor einer Gesamtrangfolge, deren Werte nur wenige Punkte auseinanderliegen.

## 3. Die vier Modelle sind eher vier verschiedene Küchenhelfer

### Sonnet 5: ein verlässlicherer Helfer für den ersten Versuch

Der Vorteil von Sonnet 5 liegt nicht darin, dass es eine Frage besonders beeindruckend löst. Über die 12 Fragen hinweg ist es vergleichsweise ausgewogen. Beim ersten Versuch, bei der Hitze der Pfanne und beim 20-Minuten-Frühstück bleibt es vorn, und es löst weder einen Regelhinweis noch ein hartes Risiko aus, das auf der Seite vermerkt wäre.

![Zwei Hände rollen eine noch intakte Crêpe auf, gefüllt mit Youtiao, Ei, Frühlingszwiebeln und Soße.](/blog/figures/jianbing-guozi-executable-steps/rolling.webp)

Ein solches Modell eignet sich für Nutzer, die noch kein eigenes Gespür für die Küche entwickelt haben. Lassen Sie es zuerst den Ablauf, die Reihenfolge und die Entscheidungspunkte aufschreiben, und kürzen Sie das dann auf die Pfanne und die Zutaten, die Sie tatsächlich zur Hand haben. Auch seine Grenzen sind klar. Aufbewahrung und Fehlerdiagnose gehören nicht zu seinen stärksten Fragen. Die Anleitung enthält viele Informationen, und bevor Sie wirklich kochen, müssen Sie die langen Erklärungen noch zu wenigen Schritten verdichten, die Sie beim Arbeiten im Blick behalten können.

### GLM 5.2: stark beim Zerlegen des Ablaufs, aber die Hitzeangaben prüfen

GLM 5.2 kann komplizierte Bedingungen gut in eine Liste übersetzen. Bei fehlenden Zutaten, mehreren Portionen und Aufbewahrung sagt es oft recht vollständig, was fehlt, was zuerst zu tun ist, wann man sich um was kümmert und wie man die Zeit einteilt.

Es ist eher ein Helfer, der Abläufe gut organisiert. Prüfen Sie bei der Nutzung die Handgriffe, bei denen es um hohe Hitze, Vorheizen, Ölmenge und Aufbewahrung geht. Verzichten Sie nicht auf Ihr eigenes Urteil über die tatsächliche Pfanne und die Küche zu Hause, nur weil sich die Antwort wie eine professionelle Anleitung liest.

### Kimi K2.7 Code: herausragend beim Retten, Sicherheitsratschläge Punkt für Punkt prüfen

Die Stärke von Kimi K2.7 Code liegt bei „Es ist schon etwas schiefgegangen, was jetzt?“. Es erkennt, in welchem Zustand sich die Pfanne gerade befindet, und bietet einen Rettungsweg, der konkreter ist als „von vorn anfangen“. Viele Modelle übersehen das, weil eine Rettungsfrage verlangt, einen unvollkommenen Zwischenzustand zu akzeptieren, statt den Standardablauf noch einmal zu erzählen.

Zugleich zeigt das harte Risiko im Szenario mit Vorbereitung über Nacht: Ein Modell kann sehr gut darin sein, Handgriffe zu liefern, ohne dass diese Handgriffe an einer Sicherheitsgrenze geprüft wurden. Wenn es um Lebensmittelaufbewahrung, eine Mahlzeit für ein Kind oder die Lagerung über Nacht geht, sollten Sicherheitsratschläge als eigener Prüfpunkt behandelt werden.

### GPT-5.6 Terra: solide Grundanleitung, weniger sicher bei der Fehlersuche

GPT-5.6 Terra erreicht bei der ersten vollständigen Anleitung 84,2. Verhältnisse, Pfannentemperatur und Grundablauf sind recht vollständig beschrieben. Für eine Anfrage wie „Ich habe noch nicht angefangen, bitte zuerst den ganzen Ablauf von Anfang bis Ende“ ist der Ausgangspunkt nicht schlecht.

Beim Teigverhältnis, bei der Hitze der Elektro-Bratplatte und bei der Fehlerdiagnose fällt es aber deutlich zurück. Es kann eine einführende Erklärung schreiben, die vollständig aussieht, und trotzdem nicht herausfinden, welche Variable schiefgelaufen ist, nachdem der Versuch bereits gescheitert ist.

Das ist der Unterschied zwischen „kann eine Anleitung schreiben“ und „kann jemanden durch die Aufgabe führen“. Für das Erste muss man nur einen idealen Weg ordnen. Für das Zweite muss man auch verstehen, was passiert ist, nachdem der Weg vom Ideal abgewichen ist.

## 4. Warum sich ein hartes Risiko nicht in einem Durchschnitt verstecken darf

Eine klassische Gesamtpunktzahl birgt eine naheliegende Versuchung: die Punkte jeder Frage zusammenzählen und den höchsten Wert auswählen. Bei einer Aufgabe im Haushalt kosten verschiedene Fehler aber nicht gleich viel.

„Dieser Satz ist etwas umständlich“ und „dieser Aufbewahrungstipp kann ein Problem für die Lebensmittelsicherheit verursachen“ sollten sich nicht in derselben Summe gegenseitig aufheben. „Es hat nicht gesagt, wie man den Fehler behebt“ und „es hat einen übermäßig aggressiven Handgriff bei hoher Hitze empfohlen“ sollten nicht wie zwei gewöhnliche Punktabzüge behandelt werden.

Diese Runde macht bereits etwas Wichtiges. Neben dem Regeldurchschnitt weist die Seite Regelhinweise und harte Risiken gesondert aus. Diese Struktur lohnt es sich beizubehalten, und sie kann zu drei Ebenen von Ergebnissen ausgebaut werden:

1. **Wert für die Aufgabenerfüllung**: Kann der Nutzer das Ziel erreichen, wenn er der Antwort folgt?
2. **Wert für die Prozessqualität**: Sind Schritte, Erklärung, Anpassung an die Bedingungen und Rettung klar?
3. **Risikokennzeichnungen, die sich nicht verrechnen lassen**: Tauchten Probleme der Lebensmittelsicherheit, gefährliche Handgriffe oder Ratschläge auf, die eindeutig gegen eine Vorgabe der Frage verstoßen?

Für echte Nutzer entscheidet die dritte Ebene oft noch vor der ersten darüber, ob sie sich trauen, der Anleitung zu folgen.

## 5. Was bringt diese Runde normalen Nutzern?

Sie benennt kein Modell, das bei jeder Küchenfrage das beste ist. Sie bietet eine praktischere Art, auszuwählen.

- Für einen ersten Versuch mit möglichst wenigen Umwegen: zuerst auf Antworten achten, die insgesamt stabil sind und kein Risiko ausgelöst haben.
- Wenn die vorhandenen Zutaten unvollständig sind: darauf achten, ob das Modell den Plan an das Vorhandene anpasst, statt auf dem Standardrezept zu beharren.
- Wenn die Crêpe schon gerissen ist oder anhängt: auf Fehlerdiagnose und Rettungsschritte achten, nicht nur darauf, ob die Grundanleitung schön geschrieben ist.
- Wenn ein Kind, Aufbewahrung über Nacht oder hohe Hitze im Spiel sind: zuerst die Risikokennzeichnungen prüfen, dann die Gesamtpunktzahl und die Qualität des Textes.
- Wenn es in 20 Minuten fertig sein muss: prüfen, ob das Modell einen Teil einplant, der sich am Vorabend vorbereiten lässt, und ob es die Aufbewahrungsbedingungen klar nennt.

![Ein aufgerollter Jianbing auf einem Frühstückstisch, aufgeschnitten, sodass Ei, Frühlingszwiebeln und Soße zu sehen sind.](/blog/figures/jianbing-guozi-executable-steps/breakfast.webp)

Sicherer ist es, die Antwort als ersten Entwurf eines Plans zu behandeln und dann drei weitere Fragen zu stellen:

1. Worin unterscheiden sich meine Pfanne und meine Zutaten von den Standardbedingungen?
2. Wenn mittendrin ein bestimmter Fehler auftritt: Bei welchem Schritt sollte ich aufhören oder etwas ändern?
3. Berührt dieser Vorschlag eine Frage der Lebensmittelsicherheit, die gesondert geprüft werden muss?

Je konkreter das Modell ist, desto mehr lohnt es sich, diese Fragen zu stellen. Eine konkrete Antwort lässt sich tatsächlich leichter umsetzen – und sie kann einen falschen Handgriff auch leichter als professionell wirkende Anweisung verpacken.

## 6. Eine Alltagsaufgabe testet man nicht gut, wenn man nur fragt, ob sie wie die richtige Antwort aussieht

Diese Jianbing-Aufgaben legen für Folkbench nicht nahe, künftig mehr Rezepte hinzuzufügen. Sie legen nahe, die Frage, ob sich eine Aufgabe aus dem echten Leben tatsächlich umsetzen lässt, als eigene Richtung weiterzuentwickeln.

Ein guter Test einer Alltagsaufgabe sollte vor dem Start mindestens vier Dinge festhalten:

- Von welchen Bedingungen der Nutzer ausgeht.
- Was der Mindeststandard für einen Erfolg ist.
- Welche Fehler sich durch eine Rettung ausgleichen lassen.
- Welche Risiken, sobald sie auftreten, gesondert markiert werden müssen.

Auch der Bewertungsmaßstab sollte eingefroren werden, bevor jemand die Modellausgaben ansieht. Sonst wird aus einem angenehm klingenden Satz eines Modells kurzfristig ein Kriterium „natürlicher Ausdruck“, aus einem gefährlichen Vorschlag eines anderen Modells kurzfristig eine höhere Gewichtung der Sicherheit – und am Ende steht ein Zeugnis, das sich nicht überprüfen lässt.

Diese Runde hat bereits eine gute Grundlage: dieselben Szenarien, dieselben Ausgabevorgaben, übereinstimmende promptHashes und Gesamtwerte, die zusammen mit Risikomarkierungen gezeigt werden. Als Nächstes lohnt es sich am meisten, Durchschnitt, Höchstwert bei einzelnen Fragen, Fehlerart und harte Risiken getrennt zu speichern. Dann wissen Leser, wie das Modell insgesamt abgeschnitten hat, und auch, wo es sie am ehesten enttäuschen wird.

## Fazit: Ein wirklich nützliches Modell muss Sie durch den Schritt begleiten, der nicht glattläuft

Ein vollständiges Rezept zu schreiben, ist die Fähigkeit, Sprache zu ordnen. Den Plan an Pfanne, Zutaten und Zeit anzupassen, ist die Fähigkeit, Bedingungen zu verstehen. Dem Nutzer zu sagen, wie es weitergeht, nachdem die Crêpe gerissen ist, ist Zustandsbeurteilung und Fehlerbehebung. Bei der Frage nach Aufbewahrung über Nacht klar innezuhalten, ist eine Sicherheitsgrenze.

Zusammengenommen kommen diese vier dem näher, was normale Menschen meinen, wenn sie sagen: „Dieses Modell ist wirklich nützlich.“

Die Schlussfolgerung, die sich aus dieser Jianbing-Runde am meisten zu behalten lohnt, ist deshalb nicht, wie viele Punkte Sonnet 5 vor GPT-5.6 Terra liegt, und auch nicht, wer jede Küchenfrage gewinnen kann. Sie lautet: **Ein Test einer echten Aufgabe muss „Lässt es sich umsetzen?“, „Lässt es sich retten, wenn etwas schiefgeht?“ und „Gibt es ein Risiko, das nicht hinnehmbar ist?“ gleichzeitig sichtbar machen.**

### Grenzen des Tests

Dieser Artikel beruht auf den V1-Szenarien und -Ergebnissen, die derzeit auf der Folkbench-Seite veröffentlicht sind. Die Stichprobe umfasst 12 Fragen aus der Küche zu Hause und 48 Ergebnisse mit übereinstimmendem promptHash. Die Regelwerte dienen nur dazu, Ergebnisse innerhalb dieses Fragensatzes zu vergleichen. Sie ersetzen keine fachliche Beratung zur Lebensmittelsicherheit und stützen keine Aussage über die allgemeine Fähigkeit eines Modells bei allen Kochaufgaben. Wenn Aufbewahrung, eine Mahlzeit für ein Kind oder hohe Hitze im Spiel sind, sollten Nutzer weiterhin selbst urteilen – anhand der tatsächlichen Lebensmittel, der tatsächlichen Geräte und der örtlichen Vorgaben zur Lebensmittelsicherheit.

**Quelle:** [Folkbench – Jianbing zubereiten: Wessen Schritte funktionieren?](https://folkbench.com/de/evaluations/jianbing-guozi)
