# Import bourses - critères de filtrage

Source initiale : extraction Claude fournie par l'utilisateur.

## Critères conservés

- Niveau : Master uniquement, avec tolérance pour les programmes Master / cycle ingénieur quand l'entrée reste compatible avec un parcours informatique.
- Domaines conservés : cybersécurité, génie logiciel, informatique, systèmes d'information, réseaux informatiques, IA/data science lorsque c'est lié à l'informatique avancée.
- Domaines exclus : réseaux télécom purs, programmes non master, entrées manifestement dupliquées, entrées trop éloignées du profil informatique/cybersécurité.

## Compatibilité avec l'application

Le site accepte uniquement les statuts suivants :

- A_POSTULER
- EN_COURS
- SOUMIS
- ACCEPTE
- REFUSE

Les statuts Claude comme `FERME`, `BIENTOT_OUVERT` et `A_SURVEILLER` ont donc été normalisés en `A_POSTULER` quand l'entrée doit rester dans la liste de suivi. L'information originale est conservée dans `notes`.

## Fichier produit

- `src/data/scholarships_claude_filtered_master_cyber_info.json`

Ce fichier est prêt à servir de base pour l'import Supabase après vérification avec Perplexity.
