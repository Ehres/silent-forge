# Silent Forge
Un outil invisible pour analyser, repérer et tirer parti des opportunités… sans jamais se faire voir.

## 🎯 Objectif principal

Automatiser la visite des profils amis/voisins pour :
	1.	Accéder à leurs Grands Monuments
	2.	Lire les places disponibles et les récompenses
	3.	Détecter si une opportunité de snipe existe (ex. : place 1 à 200 PF pour 300 de retour)
	4.	Te signaler l’opportunité (ou l’ajouter à une liste)


## 🔧 Stack technique
	•	Langage : TypeScript
	•	Automatisation : @nut-tree/nut-js
	•	OCR : Tesseract.js intégré à nut.js
	•	Reconnaissance visuelle : Images de référence (captures d’éléments d’interface)
	•	Système de clics humains : Mouvement irrégulier, délais aléatoires

## 🧪 Étapes de MVP (Produit minimal viable)
	1.	📸 Capturer l’écran d’un Grand Monument
	2.	🧠 OCR ou image recognition pour lire les 5 premières places
	3.	📊 Calcul de la rentabilité (ex : tu dépenses 250 PF pour un retour de 280)
	4.	✅ Affichage CLI ou log d’un snipe potentiel
	5.	🔄 Refaire pour tous les amis/voisins