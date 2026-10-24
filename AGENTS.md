# UTRAE — consignes obligatoires

Instruction du fondateur du 24 octobre 2026. Lire ce fichier et `docs/GUIDE-CI-PUBLIQUE-PRIVEE.md` avant toute modification ou publication.

- `Serge-As/utrae` est **public**. Aucune donnée sensible ou confidentielle n'y est admise, même temporairement, en PR, issue, log, cache, artefact, pièce jointe ou encodage.
- `Serge-As/urae` reste le dépôt privé du produit réel, de ses sources propriétaires et de son historique. Les documents internes restent privés. Les secrets et données réelles brutes restent hors Git dans les stockages privés autorisés.
- Maximiser l'usage d'UTRAE pour les procédures publiques, outils génériques expressément revus et démonstrations/tests entièrement synthétiques. Aucun accès au dépôt privé depuis un workflow public, aucun jeton privé, aucune production ou sauvegarde réelle.
- Ne jamais importer l'historique privé. Travailler dans une copie publique distincte. Aucun miroir, bundle Git ou archive du produit.
- Avant push : revue humaine du contenu et des commits, liste explicite de fichiers publics, puis `node scripts/publication-guard.mjs` et `npm test`. Ajouter un chemin à la liste ne suffit pas à approuver son contenu.
- Activer la protection locale avec `git config core.hooksPath .githooks`. Le hook vérifie aussi les commits intermédiaires : supprimer un fichier sensible au dernier commit ne suffit pas.
- Ne pas contourner un refus du garde. Corriger le lot public en conservant les contenus privés hors de ce dépôt. Un contrôle CI intervient après publication et ne peut pas empêcher une fuite initiale.
- Minimiser les interactions avec URAE : travail local d'abord, cache par SHA, requêtes ciblées groupées, checkpoints locaux, une publication cohérente, suivi de CI espacé et seulement utile. Pas de relance aveugle ou de téléchargement répété d'artefacts.
- Préserver les contrôles du produit. Le succès des tests publics qualifie uniquement le périmètre public ; il ne prouve pas les parcours privés d'Eco.
- Procédure détaillée : `docs/REPOSITORY-EFFICIENCY.md`.
- Aucun redémarrage du PC sans autorisation explicite. Ne jamais inventer une mesure de crédits consommés.
