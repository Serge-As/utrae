# ECO-REPO-001 — travailler efficacement sans exposer le privé

Instruction du fondateur du 24 octobre 2026. Applicable à chaque chat, IA et contributeur qui utilise ces dépôts.

## Séparation obligatoire

**UTRAE est public : aucune donnée sensible ou confidentielle ne doit s'y trouver.** URAE est le dépôt privé du produit réel. Son code propriétaire, ses documents internes et son historique ne sont jamais transférés dans UTRAE pour économiser du quota. Secrets, sessions et données personnelles ou financières réelles restent hors de tout Git, y compris privé, dans les coffres et stockages privés autorisés.

Maximiser UTRAE signifie y réaliser les travaux réellement publiables : documentation publique revue, outils génériques autorisés, maquettes indépendantes, tests de syntaxe, accessibilité et responsive sur des pages publiques, contrats publics et fixtures entièrement fictives. Toute logique propriétaire reste privée par défaut.

| Support | Règle |
| --- | --- |
| Fichiers, branches, commits et historique UTRAE | Seulement des contenus explicitement revus comme publics |
| Issues, PR, commentaires, pièces jointes | Même règle ; aucune capture de compte réel ni information interne |
| Actions, logs, caches et artefacts | Aucun checkout, accès, fichier ou identifiant privé ; sorties synthétiques seulement |
| Pages, bundles et source maps | Leur contenu est public ; pas de secret ou de code privé caché dans un bundle |
| Archives et encodages | N'autorisent aucun transfert de sources, sauvegardes ou données privées |
| Qualification du produit réel | Locale ou privée ; le résultat public n'en tient pas lieu |

L'anonymisation apparente ne vaut pas approbation : montants, dates, noms de fichiers et métadonnées peuvent révéler une information. Si le classement est incertain, garder le fichier privé et poursuivre les tâches indépendantes.

## Réduire les requêtes et exécutions inutiles

1. Reprendre depuis les instructions, sources, dépendances et preuves locales. Vérifier d'abord ce qui est déjà disponible.
2. Lire uniquement les ressources distantes manquantes. Au début d'un lot, relever dépôt, branche, HEAD et résultats pertinents, puis réutiliser ce relevé pendant le travail. Revérifier le HEAD avant publication ou après une interruption pertinente.
3. Mettre en cache les ressources immuables par SHA. Ne pas rechercher de nouveau les mêmes fichiers ou télécharger à nouveau le même artefact sans raison.
4. Regrouper les recherches indépendantes et les modifications cohérentes. Faire des commits locaux sans pousser ni déclencher une CI à chaque ajustement.
5. Pendant la correction, exécuter les tests utiles à l'impact. Conserver ensuite les vérifications obligatoires sur la source finale, avec des données fictives et des services locaux isolés.
6. Publier un lot complet en un push Git ou un arbre groupé. Éviter un appel API par fichier, les poussées miroir et le force-push. Vérifier la destination et la base attendue.
7. Suivre un run lorsqu'un résultat nouveau est attendu. Préférer l'attente sur événement ; sinon espacer les consultations inchangées en continuant du travail indépendant. Ne pas lire tous les jobs à chaque consultation.
8. En cas d'échec, lire le résumé puis le seul job concerné. Diagnostiquer avant de relancer. Télécharger seulement les preuves nécessaires, une fois, et conserver leurs empreintes dans l'environnement approprié.
9. Réutiliser les preuves du même SHA, avec le même environnement et le même périmètre. Un changement de source ou d'environnement exige les contrôles nécessaires. Ne jamais recycler un ancien PASS comme preuve d'une nouvelle version.

Le budget de requêtes est un objectif d'efficacité ; il n'autorise pas à supprimer les contrôles de non-régression, confondre déploiement et recette ou annoncer un succès non vérifié. Les checkpoints n'imposent pas une exécution distante. Aucun montant ou quota actuel n'est déduit de ce document.

## Publication publique, pas à pas

1. Utiliser un clone indépendant d'UTRAE, dont `origin` vise exactement `Serge-As/utrae`. Aucun remote public ajouté au clone privé pour y envoyer l'application.
2. Préparer uniquement des fichiers publiables. Relire le diff, les nouveaux commits et leurs sorties. Ne jamais copier `.git`, l'historique, un dump ou un paquet du produit privé.
3. Ajouter chaque chemin public expressément approuvé à `approvedPublicPaths` dans le garde existant. Pas d'autorisation de dossier entier ou de wildcard.
4. Stage uniquement les fichiers choisis. Exécuter `node scripts/publication-guard.mjs` : il relit les **blobs staged**, leur type, leur taille, la destination et les motifs de secrets connus. Masquer un secret dans la copie de travail après l'avoir staged ne contourne pas le contrôle.
5. Exécuter `npm test`. Revoir les résultats, puis committer. Activer une fois le hook avec `git config core.hooksPath .githooks` ; vérifier le commit avec `node scripts/publication-guard.mjs --ref HEAD`.
6. Pousser un seul lot sans force. Le hook inspecte les nouveaux commits intermédiaires avant l'envoi, y compris un fichier ajouté puis supprimé. Une limite de contrôle provoque un refus, jamais une troncature silencieuse.
7. Conserver le SHA publié et le résultat du run public. Ce résultat valide ce dépôt public seulement. Les preuves et contrôles privés restent dans le parcours privé existant.

Le garde ne communique avec aucune API. Il ne lit pas le dépôt privé, n'imprime pas la valeur trouvée et ne transmet rien. Ses tests utilisent des chaînes entièrement fictives, assemblées localement. La CI existante le réutilise, avec permissions de lecture et durée bornée.

## Limites et incident

Un détecteur ne peut pas reconnaître toutes les informations confidentielles ni les données réelles dissimulées dans du texte. La revue préalable reste obligatoire. Un administrateur peut modifier ou contourner un hook local ; ce n'est pas une frontière de permissions GitHub. Les contrôles CI ont lieu après l'envoi et ne rendent pas une fuite impossible.

Si une exposition est soupçonnée, arrêter les transferts concernés, prévenir le propriétaire par un canal privé et révoquer les identifiants exposés. Ne pas coller le secret dans une issue publique. Supprimer le fichier au dernier commit ne retire ni les anciens commits, ni les copies ; une réécriture d'historique ou une action destructive exige sa procédure et son autorisation. Aucun effacement automatique de données métier.
