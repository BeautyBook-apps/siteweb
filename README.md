# BeautyBook Web

Version ordinateur de BeautyBook, pensée comme un espace social beauté inspiré des usages de TikTok.

## Ce qui est déjà inclus

- Fil social « Pour toi » avec défilement vertical, lecture vidéo quand une publication en possède une et actions likes, favoris, commentaires et partage.
- Explorer avec mosaïque de styles, filtres par catégorie, prestations, bundles et salons.
- Recherche multi-onglets : styles, salons et bundles.
- Profils de salons avec photo de profil, couverture, publications et informations locales.
- Authentification Supabase par lien e-mail.
- Synchronisation avec les mêmes tables que l’application mobile : `Style`, `ProfilPro`, `ServiceBundle`, `user_like` et `user_favorite`.
- Abonnement temps réel aux changements de la table `Style`.
- Données de démonstration utilisées automatiquement si Supabase est momentanément indisponible, sans casser l’interface.

## Lancer le site

```bash
npm install
npm run dev
```

Pour la production, renseigner `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` à partir de `.env.example`.

Le dépôt contient aussi le workflow GitHub Pages. Après activation de Pages avec la source « GitHub Actions », le site est disponible sur `https://beautybook-apps.github.io/siteweb/`.

## Build

```bash
npm run build
```

Le projet mobile reste dans le dépôt principal `Beautybook_titan`. Ce dossier est un dépôt indépendant destiné à `BeautyBook-apps/siteweb`.
