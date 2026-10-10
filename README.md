# UTRAE — espace public auxiliaire du projet Eco/URAE

> **Le développement d'Eco se poursuit sur l'application existante. Aucun redémarrage à zéro, nouveau frontend ou nouveau backend n'est prévu par cette annonce.**

📢 **[Annonce officielle — nouvelles adresses et organisation du développement](https://github.com/SergeDelor/utrae/issues/1)**

**📘 [Consigne obligatoire : utilisation des Actions publiques gratuites et protection du code privé](docs/GUIDE-CI-PUBLIQUE-PRIVEE.md)** — précise ce qui s'exécute dans UTRAE, ce qui doit rester dans URAE, les tests locaux sur Windows et les interdictions de transmission des secrets. Toute personne contribuant au projet doit lire ce guide avant de lancer une CI ou de publier du code.

## Deux dépôts, un seul produit réel

- **`SergeDelor/urae`** — dépôt principal **privé**, renommé depuis `SergeDelor/tontine-platform`. Il héberge le code source existant de l'application Eco, son historique et ses modules. Son infrastructure et sa production ne sont pas remplacées ici.
- **`SergeDelor/utrae`** — ce dépôt **public**, initialisé avec un historique indépendant. Il sert actuellement de vitrine de qualification et de tests synthétiques sans code privé.

## État du dépôt public

Ce dépôt ne contient actuellement **pas l'application financière réelle**. Les groupes, rubriques, Discover, prêts, intérêts, cockpits, authentification, fonctions sensibles et données financières ne sont ni copiés ni exposés ici.

Le test synthétique peut être exécuté avec `npm test`. La page `docs/index.html` est un simple exemple de prévisualisation mobile, **non destiné aux transactions ou à l'exploitation**.

## Développement et bascule des outils

Les modifications fonctionnelles se poursuivent dans l'application existante et sont validées par tests. Les exécutions publiques sont indépendantes, sans accès automatique au dépôt privé, sans jetons privés, et sans déclencher de migration D1/R2 ou de déploiement Cloudflare.

Aucun changement d'URL de production ou basculement de données n'est annoncé. Toute évolution impliquant des éléments publics sera explicitement revue avant publication.
