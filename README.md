# AI Bloc

**Progresse, prise après prise.** Le coach de bloc dans ta poche.

Application web mobile (installable sur l'écran d'accueil) réalisée pour le projet de création d'entreprise AI Bloc — ICAM Toulouse.

👉 **Essayer l'app : https://boydeathmonsters.github.io/ai-bloc/**

## Fonctionnalités

- **Compte** : inscription, connexion, mot de passe oublié, compte démo pré-rempli.
- **Analyser un bloc** : caméra arrière du téléphone, marquage des prises d'un tap, enregistrement vidéo (2 min max), import d'une vidéo ou saisie sans vidéo.
- **Suivi** : niveau actuel, blocs réussis, séances, meilleure série, projet du moment, historique, notes par essai.
- **Profil** : courbe de progression sur 6 mois, badges, activité récente.
- **Exercices** : recherche, filtres, objectifs, séances guidées avec minuteur.
- **Coachs** : recherche, filtres, favoris, réservation avec calendrier et créneaux, annulation, export calendrier (.ics).
- **Paramètres** : profil et photo, notifications, confidentialité des vidéos, consentement IA, export / suppression des données (RGPD), cotation française ou V-scale, thème clair/sombre, abonnements Free / Premium / Premium+.

**Pas encore disponible** : l'analyse IA du mouvement (détection automatique des prises, lecture du squelette, conseils). L'écran est prévu et les essais sont conservés pour être analysés plus tard.

## Version bêta

- Les données (comptes, essais, vidéos) sont stockées **sur l'appareil**, dans le navigateur (localStorage + IndexedDB). Rien n'est envoyé sur un serveur.
- Les coachs sont fictifs, les réservations et abonnements sont des démonstrations : aucun paiement.

## Lancer en local

```bash
python -m http.server 5173
```

Puis ouvrir http://localhost:5173. Aucune dépendance, aucun build : HTML, CSS et JavaScript (modules ES).
