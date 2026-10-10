# MODE OPÉRATOIRE OFFICIEL — ECO / URAE / UTRAE
**Date : 10 octobre 2026 — Règle de fonctionnement commune à tous les contributeurs.**

> **À lire avant chaque PR et chaque workflow.** Le dépôt privé `Serge-As/urae` conserve **l'application réelle** et son historique. Le dépôt public `Serge-As/utrae` est un **outil auxiliaire de CI publique et de communication**. **Il ne remplace ni l'application, ni son frontend, ni son backend, ni les données Cloudflare.**

## 1. Pourquoi ce système ?
Le quota de minutes GitHub-hosted standard du dépôt privé URAE est annoncé **épuisé pour le mois**. Ce quota concerne les actions GitHub-hosted lancées depuis les dépôts privés du propriétaire. Déplacer seulement le nom du workflow ou appeler un workflow public depuis un dépôt privé **ne transforme pas ses jobs privés en jobs gratuits**.

Selon GitHub, les runners **standards GitHub-hosted** des **dépôts publics** sont gratuits et sans quota mensuel de minutes. Cela **ne** signifie **pas** calcul illimité, accès au code privé, stockage illimité, absence de limites par job ou absence de règles d'usage : runners « larger » facturables, jobs bornés (six heures), files d'attente, concurrence et quotas de stockage. Vérifier les conditions officielles avant d'engager des ressources :
- https://docs.github.com/en/actions/how-tos/write-workflows/choose-where-workflows-run/choose-the-runner-for-a-job
- https://docs.github.com/en/billing/concepts/product-billing/github-actions
- https://docs.github.com/en/actions/reference/limits

**Jamais de promesse « tout le code privé testé gratuitement sur UTRAE ».** Ce serait faux ou exposerait nos sources.

## 2. Qui fait quoi ?

| Lieu | Autorisé | Interdit |
| --- | --- | --- |
| `Serge-As/urae` (privé) | Développement réel, branches métier, cahiers, secrets gérés hors Git, PR du produit, tests de non-régression | Rendre public, exporter le Git historique, laisser des CI automatiques gaspiller des minutes indisponibles |
| PC Windows / runner privé de confiance | `npm ci`, `npm run build`, `npm run typecheck`, `npm test`, tests Node/Playwright, validation du SHA | Exposer le runner privé aux PR du dépôt public |
| `Serge-As/utrae` (public) | Tests génériques, interfaces et fichiers **explicitement audités**, contrats publics, fixtures synthétiques, HTML de démonstration | Cloner `urae`, jetons à accès privé, codes financiers/rubriques/Discover/cockpits, cahiers, bases réelles, logs, scripts anciens |
| Cloudflare actuel (privé) | Exécuter le service Eco existant; staging distinct pour les tests mobiles fonctionnels | Transformer D1/R2 en « coffre » pour un JavaScript secret distribué au navigateur; partager D1 de production avec les tests |

## 3. Procédure concrète pendant que le quota URAE est à zéro

**A — Faire la vraie modification dans URAE privé.** Créer une branche de correction à partir de la branche applicative vérifiée. Ne pas déployer, purger D1 ou changer les identifiants IndexedDB implicitement.

**B — Compiler et qualifier en local.** Sur le PC de confiance disposant de Node >= 24, ouvrir le vrai clone privé (ne jamais copier `.git` dans UTRAE). Après vérification de `git status` et de la bonne branche, utiliser au besoin :

```bash
node --version
npm ci
npm run build
npm run typecheck
npm test
# Option plus complète, à lancer lorsque les dépendances et l'environnement le permettent :
npm run ci
```

Ces commandes exécutées **sur le PC** ne consomment pas les minutes GitHub-hosted ; elles peuvent néanmoins consommer des ressources locales et, si des tests les contactent, des API distantes. Employer des données fictives et un environnement local/staging isolé. Garder la trace des résultats, du commit exact et des éventuels échecs ; jamais de « PASS » sans test exécuté.

**C — Tester les éléments réellement publics dans UTRAE.** N'y copier que du code/public assets indépendants, soigneusement revus, et des tests synthétiques. La CI publique déjà opérationnelle utilise `ubuntu-latest`, permissions `contents: read`, sans secret ni accès au dépôt privé. Un résultat **vert ici valide seulement ces éléments publics**, PAS les prêts, intérêts, groupes ou transactions réels.

**D — Recette mobile de la VRAIE application.** Tester le frontend et le backend EXISTANTS d'Eco sur un environnement HTTPS de préproduction authentifié, avec D1/R2 distincts, données fictives, permissions réduites. Vérifier PWA, hors ligne, reconnexion/Outbox, rubriques, Discover, groupes, calculs, prêts et conflits multi-appareils. Ne pas confondre la petite page HTML publique UTRAE avec une version de l'application.

**E — Intégration et livraison.** Revue humaine + preuves de tests du **même commit**; si des contrôles GitHub privés obligatoires sont bloqués par le quota, configurer un runner privé sûr ou attendre un quota disponible — **ne pas contourner une exigence de sécurité en fusionnant sans qualification**. Aucune mise en production automatique depuis le dépôt public.

## 4. Interdits absolus : zéro fuite

- **Jamais** de `git clone` / `actions/checkout` de `Serge-As/urae` dans un workflow public UTRAE, y compris avec PAT, GitHub App, submodule, URL signée ou secret.
- **Jamais** de `repository_dispatch`, `workflow_run` ou réutilisation de workflow qui transfère fichiers, artefacts, logs, données, variables ou accès privés vers la CI publique.
- **Jamais** de push miroir, fork/clone de l'historique URAE dans UTRAE, d'archives `.b64`, `.zip` de sauvegarde, sources maps, dumps D1, captures privées, clés ni jeux de données clients.
- Les règles de **rubriques**, **Discover**, prêts/intérêts, groupes, identités, permissions, cockpit, tarification, scoring, antifraude, gouvernance et tout module inédit sont **privées par défaut**; toute publication nécessite une revue explicite des sources ET du bundle final.
- **Frontend avertissement :** le code JS envoyé au navigateur devient visible pour ses utilisateurs, indépendamment de la visibilité GitHub. Une logique à garder confidentielle doit résider côté serveur, pas dans le bundle.
- Les runners auto-hébergés du propriétaire sont interdits dans les workflows de PR publiques non fiables. Éviter `pull_request_target` avec exécution de code externe; minimiser `GITHUB_TOKEN`.
- Ne pas exposer les endpoints privés par des captures, documents de diagnostics publics, caches ou uploads `actions/upload-artifact`.

## 5. Règles d'optimisation

1. **URAE :** limiter les anciens workflows redondants (audit déjà identifié : dizaines de workflows versionnés), utiliser les vérifications locales/runner privé et garder les checks bloquants indispensables avant livraison. Éviter les relances d'échecs sans diagnostic.
2. **UTRAE :** construire une CI publique légère, indépendante et véritablement publique (smoke, syntaxe, lint public, accessibilité, responsive, contrats **non sensibles**). Préférer `ubuntu-latest` standard; définir `timeout-minutes`, `concurrency` et `paths` pour la qualité et l'usage raisonnable.
3. **Artefacts :** ne publier que les résultats synthétiques sans secrets ; garder une rétention courte. Les limites de stockage s'appliquent, même quand les minutes standard sont gratuites.
4. **Cloudflare :** ne jamais déplacer tous les tests Node/Playwright vers D1 de production; profiler les accès D1/Workers et prévoir un staging pour les essais réels sur téléphone.

## 6. Critères de contrôle obligatoires, même avec 0 minute privée

Un changement d'Eco doit conserver : **compatibilité d'IndexedDB et Outbox; intégrité et idempotence du registre financier; isolation des locataires et accès; remboursement/intérêts cohérents; sécurité des données; non-régression PWA/hors ligne; déploiement reproductible**. En cas de doute, **ne pas déployer**.

**En résumé :** `URAE` contient le vrai code; Windows ou runner privé le teste intégralement; `UTRAE` teste sans frais mensuels de minutes les **seuls artefacts autorisés à être publics**; Cloudflare continue de faire fonctionner l'Eco existant. **La création d'UTRAE n'a remplacé aucune fonctionnalité du projet.**

**Documentation de sécurité GitHub :**
- https://docs.github.com/en/actions/reference/security/secure-use
- https://docs.github.com/en/actions/how-tos/reuse-automations/share-across-private-repositories
