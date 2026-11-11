---
slug: jianbing-guozi-executable-steps
translationKey: jianbing-guozi-executable-steps
locale: fr
kind: article
title: "Sait-il cuisiner, ou seulement écrire la recette ? Douze scènes de cuisine familiale montrent si les étapes d’un modèle sont réalisables"
description: "Un modèle peut rédiger un tutoriel de jianbing complet et patient, et laisser malgré tout un débutant incapable de le cuisiner. Cette série vérifie si ce savoir devient un plan de cuisine familiale que l’on peut suivre, ajuster et poursuivre quand quelque chose tourne mal."
category: Évaluation
tags: [évaluation, vie quotidienne, cuisine]
authorId: iris-wu
modelIds: []
benchmarkSlugs: []
relatedSlugs: [how-to-score-a-cycling-pelican]
publishedAt: '2026-10-11'
updatedAt: '2026-10-11'
sources:
  - id: jianbing
    label: "Folkbench — Faire un jianbing : quelles étapes fonctionnent ?"
    url: https://folkbench.com/fr/evaluations/jianbing-guozi
    checkedAt: '2026-10-11'
    claimScope: observed
---

# Sait-il cuisiner, ou seulement écrire la recette ? Douze scènes de cuisine familiale montrent si les étapes d’un modèle sont réalisables

Un modèle peut rédiger un tutoriel de jianbing complet et patient, et laisser malgré tout un débutant incapable de le cuisiner.

Une vraie cuisine familiale comporte beaucoup de variables. Les poêles diffèrent par la taille et le matériau. La pâte peut être trop épaisse ou trop liquide. Le feu change entre le moment où l’on étale la crêpe, celui où l’on ajoute l’œuf et celui où on la retourne. La fine galette croustillante, le baocui, ne se trouve pas toujours. Un matin peut ne laisser que 20 minutes. Après le premier échec, l’utilisateur n’a pas besoin d’une autre jolie recette. Il a besoin de quelqu’un qui sache juger pourquoi la crêpe vient de se déchirer, et lui dire si elle peut encore être rattrapée.

C’est pourquoi cette [évaluation sur la préparation du jianbing](https://folkbench.com/fr/evaluations/jianbing-guozi) ne vérifie pas si un modèle sait réciter une recette. Elle vérifie s’il sait transformer un savoir en un plan qu’une cuisine familiale peut exécuter, ajuster et poursuivre quand quelque chose tourne mal.

## D’abord le résultat : au-delà de la moyenne, les différences se logent dans les échecs et les risques

Cette série comportait 12 scènes de cuisine familiale. Quatre modèles ont laissé 48 résultats appariés par promptHash. La note selon les règles de la page examine une réponse sous cinq angles : les étapes peuvent-elles être suivies, montrent-elles du bon sens culinaire, gèrent-elles un échec, le texte est-il clair, et le modèle se pose-t-il en « maître cuisinier » trop sûr de lui ?

Les notes globales publiées sur la page sont les suivantes :

| Modèle | Note globale | En tête sur les 12 (ex æquo inclus) | Remarques de règle ou risques critiques signalés sur la page |
| --- | ---: | ---: | --- |
| Sonnet 5 | 80,4 | 6 | Aucun |
| GLM 5.2 | 79,3 | 5 | 1 remarque de règle |
| Kimi K2.7 Code | 77,6 | 3 | 1 remarque de règle, 1 risque critique |
| GPT-5.6 Terra | 75,6 | 0 | Aucun |

![Notes globales des quatre modèles. Sonnet 5 obtient 80,4, GLM 5.2 79,3, Kimi K2.7 Code 77,6 et GPT-5.6 Terra 75,6. La longueur des barres suit une échelle de 0 à 100. Le nombre de questions en tête et les signalements de risque figurent sous chaque barre.](/blog/figures/jianbing-guozi-executable-steps/scores-fr.svg)

Sonnet 5 est en tête avec 80,4. Dans l’ensemble, sa copie ressemble davantage à un tutoriel qu’on pourrait confier à un débutant : la première tentative, la maîtrise de la poêle et le petit-déjeuner en 20 minutes sont relativement solides. GLM 5.2 n’est qu’à 1,1 point derrière, mais sa note sur les étapes atteint 90, la plus élevée de la série. La note globale de Kimi K2.7 Code est plus basse, et pourtant il fait mieux que les autres sur les scènes qui exigent un rattrapage sur le moment, comme « la crêpe s’est déchirée, comment la rattraper ? ». GPT-5.6 Terra obtient 84,2 sur le premier tutoriel complet, mais montre de nettes faiblesses sur les proportions de la pâte, le feu de la crêpière électrique et le diagnostic d’échec.

En apparence, c’est le bulletin de notes de quatre modèles. Ce qui mérite davantage l’attention, c’est un fait qu’on passe facilement sous silence : **produire des étapes réalisables n’est pas une compétence unique. Un modèle peut être bon pour écrire clairement les étapes et mauvais pour diagnostiquer un échec. Il peut exceller dans le rattrapage et laisser malgré tout un problème de sécurité qu’on ne devrait pas ignorer.**

## 1. Une cuisine familiale n’est pas une vitrine de recettes

Demandez seulement « comment faire un jianbing ? », et un modèle produit volontiers ce qui ressemble à une réponse type complète : préparer la farine, mélanger la pâte, préchauffer la poêle, étaler la crêpe, casser l’œuf, parsemer de ciboule, badigeonner de sauce, ajouter la galette croustillante, puis rouler.

Au niveau des mots, cette réponse ne comporte peut-être aucune erreur évidente. Elle ne répond pas pour autant aux questions qu’un débutant rencontre réellement :

- À la maison, il n’y a qu’une poêle antiadhésive de 26 cm et pas de râteau à crêpes. Une louche et une spatule suffisent-elles ?
- Quelle doit être, concrètement, la fluidité de la pâte ? Pourquoi les mêmes proportions d’eau et de farine donnent-elles une crêpe épaisse chez l’un et une crêpe qui se déchire au premier retournement chez l’autre ?
- Sans galette croustillante, quel effet ont sur le résultat les feuilles à wonton, le youtiao, les chips et une galette fine ordinaire ?
- Comment juger le feu d’une poêle et celui d’une crêpière électrique ? Une fois l’œuf ajouté, quand peut-on rouler ?
- La crêpe s’est déjà déchirée et l’œuf n’a pas complètement pris. Faut-il continuer à étaler, colmater avec une autre cuillerée de pâte, ou recommencer ?
- Avec seulement une poêle en inox, comment réduire le risque que ça attache ?
- La pâte en trop, et une crêpe cuite déjà badigeonnée de sauce et garnie de jambon, peuvent-elles encore se manger le lendemain ?

![Un équipement familial limité : une poêle antiadhésive, une spatule et une louche, avec à côté la pâte, des œufs et de la ciboule.](/blog/figures/jianbing-guozi-executable-steps/kitchen-setup.webp)

![Quatre substituts quand il n’y a pas de galette croustillante : feuilles à wonton, youtiao, chips et galettes fines ordinaires.](/blog/figures/jianbing-guozi-executable-steps/substitutes.webp)

Ce type de question demande au modèle de gérer en même temps les ingrédients, les ustensiles, le temps, l’ordre des opérations, l’évolution de la cuisson et le risque. Il ne s’agit pas de tirer un savoir de la mémoire, mais de reconstruire l’action suivante à partir des conditions du moment.

C’est pourquoi la page ne se contente pas de demander « écrivez une recette de jianbing ». Elle découpe la tâche en 12 scènes : la première tentative d’un débutant, les proportions de la pâte, un substitut à la galette croustillante, la maîtrise du feu selon la poêle, le rattrapage d’une déchirure, des ingrédients manquants, une version moins grasse et moins épicée pour un enfant, un petit-déjeuner en 20 minutes, le diagnostic d’échec, le rythme pour trois personnes, une poêle en inox et la conservation jusqu’au lendemain. Chaque question pousse le modèle vers une question de suivi plus proche de la vraie vie : **quand les conditions ne sont pas idéales, savez-vous encore dire quelle est l’étape suivante ?**

## 2. La ligne de partage qui compte : détaillé ne veut pas dire fiable

GLM 5.2 en est un bon exemple dans cette série. Sa note sur les étapes atteint 90 : il sait bien décomposer un processus et donner des conseils concrets pour des situations comme « pas assez d’ingrédients », « assez pour trois personnes d’un coup » ou « comment conserver la pâte et la crêpe cuite ». Pour qui ne regarde que la complétude du texte, ce genre de réponse obtient facilement une bonne note.

La page relève aussi que, sur la question de la poêle en inox, il conseille de chauffer la poêle « jusqu’à ce qu’elle dégage une fumée bleutée » et de répéter le culottage. Ce type de préchauffage à très haute température n’a rien de doux pour un foyer ordinaire. Plus l’action proposée est concrète, plus l’utilisateur risque de l’appliquer telle quelle. Un conseil concret qui ne correspond pas à la situation transforme « avoir l’air professionnel » en risque réel.

![Une main s’arrête au-dessus d’une poêle en inox pour juger la chaleur. La flamme est petite, la poêle est sèche et il n’y a pas de fumée.](/blog/figures/jianbing-guozi-executable-steps/stainless-heat.webp)

Kimi K2.7 Code montre encore plus clairement pourquoi une moyenne ne suffit pas. Il obtient la meilleure note sur « la crêpe s’est déchirée, comment la rattraper ? ». Face à une crêpe déjà déchirée et à un œuf qui n’a pas complètement pris, il propose des étapes de rattrapage qui paraissent applicables. Il apporte aussi des détails utiles sur les scènes de la pâte et des trois personnes.

![La crêpe s’est déchirée et l’œuf n’a pas complètement pris. Une louche ajoute une cuillerée de pâte pour colmater.](/blog/figures/jianbing-guozi-executable-steps/torn-crepe.webp)

Sur « tout boucler en 20 minutes le matin », la page signale un risque critique de sécurité alimentaire qu’on ne peut pas ignorer : la réponse laisse entendre que les œufs peuvent être sortis à l’avance et laissés à température ambiante. Aussi bien rédigées que soient les autres réponses, celle-ci doit être présentée à part. Elle ne doit pas être compensée par « meilleure note sur la question du rattrapage ».

Cela ne veut pas dire que tous les conseils de Kimi K2.7 Code sont peu fiables, ni qu’il faille lui coller l’étiquette définitive de modèle faible en sécurité alimentaire. La formulation exacte est la suivante : **dans cette série, sur cette question, dans ce conseil précis, un risque critique au sens des règles de la page est apparu.** Pour l’utilisateur, cette information passe avant un classement global qui ne diffère que de quelques points.

## 3. Les quatre modèles ressemblent plutôt à quatre commis de cuisine différents

### Sonnet 5 : un commis plus sûr pour une première tentative

L’atout de Sonnet 5 n’est pas une réponse éblouissante. Sur les 12 questions, il est relativement équilibré. Il reste en tête sur la première tentative, le feu de la poêle et le petit-déjeuner en 20 minutes, et ne déclenche aucune remarque de règle ni aucun risque critique enregistrés sur la page.

![Deux mains roulent une crêpe encore intacte, garnie de youtiao, d’œuf, de ciboule et de sauce.](/blog/figures/jianbing-guozi-executable-steps/rolling.webp)

Ce type de modèle convient à un utilisateur qui n’a pas encore son propre jugement en cuisine. Laissez-le d’abord écrire le déroulé, l’ordre et les points de décision, puis réduisez le tout à la poêle et aux ingrédients dont vous disposez réellement. Sa limite est claire elle aussi : la conservation et le diagnostic d’échec ne sont pas ses meilleures questions. Le tutoriel contient beaucoup d’informations, et avant de vraiment cuisiner, il faut encore condenser les longues explications en quelques étapes qu’on peut consulter tout en travaillant.

### GLM 5.2 : fort pour décomposer le processus, mais vérifiez les conseils sur le feu

GLM 5.2 sait bien transformer des conditions compliquées en liste. Sur les ingrédients manquants, les portions multiples et la conservation, il dit souvent de façon assez complète ce qui manque, ce qu’il faut faire d’abord, quand s’en occuper et comment organiser le temps.

Il ressemble davantage à un commis doué pour organiser un processus. Quand vous l’utilisez, vérifiez les actions qui concernent les hautes températures, le préchauffage, la quantité d’huile et la conservation. Ne faites pas l’impasse sur votre propre jugement de la poêle réelle et de votre cuisine simplement parce que la réponse ressemble à un tutoriel professionnel.

### Kimi K2.7 Code : le rattrapage se distingue, les conseils de sécurité sont à vérifier ligne par ligne

L’atout de Kimi K2.7 Code se concentre sur « quelque chose a déjà mal tourné, et maintenant ? ». Il sait lire l’état dans lequel se trouve la poêle et proposer une voie de rattrapage plus précise que « recommencez ». Beaucoup de modèles passent à côté, parce qu’une question de rattrapage oblige le modèle à accepter un état intermédiaire imparfait au lieu de redérouler le processus standard.

En même temps, le risque critique de sa scène de préparation la veille montre qu’un modèle peut être très bon pour produire des actions sans que ces actions aient été passées au crible de la sécurité. Quand il est question de conservation des aliments, de repas d’enfant ou de préparation la veille, les conseils de sécurité doivent faire l’objet d’une liste de vérification à part.

### GPT-5.6 Terra : le tutoriel de base est correct, le dépannage est moins solide

GPT-5.6 Terra obtient 84,2 sur le premier tutoriel complet. Les proportions, la température de la poêle et le déroulé de base sont écrits de façon assez complète. Pour une demande comme « je n’ai pas encore commencé, donnez-moi d’abord le déroulé du début à la fin », son point de départ n’est pas mauvais.

Sur les proportions de la pâte, le feu de la crêpière électrique et le diagnostic d’échec, il est nettement en retrait. Il sait écrire une explication d’initiation qui a l’air complète, sans pour autant parvenir à localiser la variable fautive une fois que l’utilisateur a déjà échoué.

C’est toute la différence entre « savoir écrire un tutoriel » et « savoir accompagner quelqu’un jusqu’au bout de la tâche ». Le premier n’a qu’à organiser un chemin idéal. Le second doit aussi comprendre ce qui s’est passé une fois sorti de ce chemin idéal.

## 4. Pourquoi un risque critique ne peut pas se cacher dans une moyenne

Un total classique comporte une tentation naturelle : additionner la note de chaque question et retenir la plus élevée. Dans une tâche domestique, toutes les erreurs n’ont pas le même coût.

« Cette phrase est un peu verbeuse » et « ce conseil de conservation peut poser un problème de sécurité alimentaire » ne devraient pas s’annuler dans la même somme. « Il n’a pas expliqué à l’utilisateur comment rattraper le coup » et « il a proposé une action à haute température trop agressive » ne devraient pas être traités comme deux pénalités ordinaires.

Cette série fait déjà quelque chose d’important : en plus de la moyenne selon les règles, la page signale à part les remarques de règle et les risques critiques. Cette structure mérite d’être conservée, et elle peut évoluer vers trois niveaux de résultat :

1. **Note d’accomplissement de la tâche** : l’utilisateur peut-il atteindre l’objectif en suivant la réponse ?
2. **Note de qualité du processus** : les étapes, l’explication, l’adaptation aux conditions et le rattrapage sont-ils clairs ?
3. **Étiquettes de risque non compensables** : un problème de sécurité alimentaire, une action dangereuse ou un conseil qui enfreint clairement une contrainte de la question sont-ils apparus ?

Pour un utilisateur réel, c’est souvent le troisième niveau, plus encore que le premier, qui décide « est-ce que j’ose suivre ça ? ».

## 5. Qu’apporte cette série à un utilisateur ordinaire ?

Elle ne désigne pas un modèle meilleur que tous sur chaque question de cuisine. Elle propose une façon plus pratique de choisir.

- Pour une première tentative, avec moins de faux pas : regardez d’abord les réponses solides dans l’ensemble et qui n’ont déclenché aucun risque.
- Quand les ingrédients dont vous disposez sont incomplets : voyez si le modèle repense la recette à partir de ce que vous avez, au lieu de s’accrocher à la formule standard.
- Quand la crêpe s’est déjà déchirée ou attache : regardez le diagnostic d’échec et les étapes de rattrapage, pas seulement la qualité de rédaction du tutoriel de base.
- Quand il est question d’un enfant, d’une conservation jusqu’au lendemain ou de haute température : vérifiez d’abord les étiquettes de risque, puis la note totale et la qualité de rédaction.
- Quand il faut avoir fini en 20 minutes : voyez si le modèle prévoit une partie à préparer la veille, et s’il précise clairement les conditions de conservation.

![Un jianbing roulé sur une table de petit-déjeuner, coupé pour montrer l’œuf, la ciboule et la sauce.](/blog/figures/jianbing-guozi-executable-steps/breakfast.webp)

Une façon plus sûre d’utiliser la réponse est de la traiter comme un premier jet de plan, puis de poser trois questions de plus :

1. En quoi ma poêle et mes ingrédients diffèrent-ils des conditions standard ?
2. Si un échec précis survient en cours de route, quelle étape faut-il arrêter ou modifier ?
3. Ce conseil soulève-t-il une question de sécurité alimentaire qui doit être vérifiée à part ?

Plus le modèle est concret, plus ces questions valent la peine d’être posées. Une réponse concrète est réellement plus facile à appliquer, et il est aussi plus facile d’y glisser une mauvaise action sous la forme d’une consigne d’allure professionnelle.

## 6. Pour bien tester une tâche du quotidien, il ne suffit pas de se demander si la réponse a l’air juste

Ce que cette série de questions sur le jianbing suggère pour Folkbench, ce n’est pas d’ajouter davantage de recettes à l’avenir. C’est que la question « une tâche réelle peut-elle vraiment être menée à bien ? » peut continuer à se développer comme une direction à part entière.

Une bonne évaluation d’une tâche du quotidien devrait fixer par écrit au moins quatre choses avant de commencer :

- Les conditions de départ de l’utilisateur.
- Le niveau minimal de réussite.
- Les erreurs qu’un rattrapage peut compenser.
- Les risques qui, dès qu’ils apparaissent, doivent être signalés à part.

La grille de notation doit aussi être figée avant que quiconque regarde les sorties des modèles. Sinon, une phrase agréable d’un modèle devient à la dernière minute un critère « expression naturelle », un conseil dangereux d’un autre modèle devient à la dernière minute une hausse du poids accordé à la sécurité, et le bulletin de notes ne peut plus être vérifié.

Cette série dispose déjà d’une bonne base : les mêmes scènes, les mêmes exigences de sortie, des promptHash appariés, et des notes globales affichées avec les signalements de risque. La prochaine amélioration la plus utile serait d’enregistrer séparément la moyenne, le plafond sur une question, le type d’échec et les risques critiques, pour qu’un lecteur sache à la fois comment le modèle s’en est sorti dans l’ensemble et où il risque le plus de le décevoir.

## Conclusion : un modèle vraiment utile doit vous accompagner dans l’étape qui ne se passe pas bien

Écrire une recette complète relève de la capacité à organiser le langage. Adapter le plan à la poêle, aux ingrédients et au temps disponible relève de la compréhension des conditions. Dire à l’utilisateur comment continuer une fois la crêpe déchirée relève du jugement de situation et de la reprise après erreur. S’arrêter clairement quand se pose la question de la conservation jusqu’au lendemain relève de la limite de sécurité.

Réunies, ces quatre capacités se rapprochent de ce qu’une personne ordinaire entend par « ce modèle est vraiment utile ».

Ainsi, la conclusion la plus utile à retenir de cette série sur le jianbing n’est pas le nombre de points d’avance de Sonnet 5 sur GPT-5.6 Terra, ni de savoir qui peut gagner toutes les questions de cuisine familiale. C’est celle-ci : **l’évaluation d’une tâche réelle doit faire apparaître en même temps « peut-on y arriver ? », « peut-on rattraper le coup quand ça tourne mal ? » et « y a-t-il un risque inacceptable ? ».**

### Limites du test

Cet article s’appuie sur les scènes et les résultats V1 actuellement publiés sur la page de Folkbench. L’échantillon compte 12 questions de cuisine familiale et 48 résultats appariés par promptHash. Les notes selon les règles servent uniquement à comparer les résultats sur ce même ensemble de questions. Elles ne remplacent pas un avis professionnel en sécurité alimentaire et ne permettent pas d’affirmer quoi que ce soit sur la capacité générale d’un modèle pour toutes les tâches culinaires. Quand il est question de conservation, de repas d’enfant ou de haute température, l’utilisateur doit toujours juger de manière indépendante en fonction des aliments réels, des ustensiles réels et des exigences locales en matière de sécurité alimentaire.

**Source :** [Folkbench — Faire un jianbing : quelles étapes fonctionnent ?](https://folkbench.com/fr/evaluations/jianbing-guozi)
