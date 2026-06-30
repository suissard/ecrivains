# Écrivains - Assistant de Co-Écriture de Livres IA ✍️📖

**Écrivains** est une application web moderne développée en **Vue 3** et **Vite**, conçue pour assister les auteurs dans le processus de création de romans et de récits littéraires en collaboration avec une Intelligence Artificielle.

L'application guide l'utilisateur à travers un pipeline structuré en **5 étapes**, allant du pitch initial à l'exportation finale d'un fichier PDF professionnel prêt pour l'impression ou la publication numérique.

---

## 🚀 Fonctionnalités Clés

1. **Étape 1 : Base du récit**
   - Saisie du pitch et du nombre de chapitres.
   - Définition du contexte géoculturel (Époque, Lieu, Culture).
   - Configuration avancée du **style d'écriture** via **11 curseurs littéraires** (longueur de phrase, complexité grammaticale, rythme, introspection, show-don't-tell, etc.).
   
2. **Étape 2 : Structure de l'histoire**
   - Réception et modification d'une proposition de plan de chapitres.
   - **Éditeur visuel de cartes** pour réorganiser, modifier, ajouter ou supprimer des chapitres à la main.
   - Entrée de feedback pour que l'IA régénère la structure selon les directives de l'utilisateur.

3. **Étape 3 : Personnages et trames**
   - Génération automatique de fiches de personnages détaillées (physique, personnalité, valeurs, etc.).
   - **Éditeur visuel de cartes de personnages** bidirectionnel (synchronisé avec les données brutes).
   - Possibilité d'éditer manuellement ou de faire régénérer l'univers de personnages par l'IA.

4. **Étape 4 : Génération des chapitres**
   - Écriture automatisée et séquentielle de tous les chapitres à la suite, ou chapitre par chapitre.
   - **Indicateur de progression circulaire** et jauge de progression en temps réel.
   - Rendu fluide du contenu des chapitres en **Markdown** (titres, citations, listes, dialogues) dans un accordéon interactif.

5. **Étape 5 : Rendu final et Exportation**
   - Configuration de la mise en page : format de page (**A4** vs **A5**), marges (1 à 5 cm), taille des caractères (8pt à 28pt), et choix de polices typographiques élégantes.
   - **Mode Livret (Imposition)** : Mise en page automatique 2 pages par feuille paysage (A4 paysage pour A5, A3 paysage pour A4) pour l'impression et la reliure sous forme de cahiers pliés.
   - **Aperçu interactif en direct** : Visualisation exacte de chaque page (style, marges, numérotation de pages, couverture élégante) avant de générer le fichier.
   - **Génération PDF haute qualité** : Exportation via jsPDF avec en-têtes de page courants, numéros de pages automatiques et couverture ornementale.

6. **Paramètres Réseau & Modèles**
   - Intégration d'**OpenRouter** pour sélectionner dynamiquement parmi des centaines de modèles IA (DeepSeek, Claude, Gemini, GPT, etc.) via un menu déroulant filtrable.
   - Configuration des points de terminaison (webhooks) pour intégration transparente avec un orchestrateur comme **n8n**.

---

## 🛠️ Stack Technique

- **Framework frontend** : Vue 3 (Composition API, `<script setup>`)
- **Gestionnaire d'état** : Pinia (avec persistance automatique de l'état dans le `localStorage`)
- **Routage** : Vue Router
- **Styles** : Tailwind CSS v4
- **Moteur de rendu Markdown** : Marked.js
- **Génération PDF** : jsPDF (avec support pour le chargement et la mesure dynamique de polices TTF personnalisées)
- **Outil de build** : Vite

---

## 📦 Installation et Lancement Local

### Prérequis

Assurez-vous d'avoir installé [Node.js](https://nodejs.org/) (version 18+ recommandée) et npm.

### 1. Cloner le dépôt et installer les dépendances

```bash
# Installer les dépendances
npm install
```

### 2. Lancer le serveur de développement

```bash
npm run dev
```

Par défaut, l'application est accessible à l'adresse `http://localhost:5173`. 
*Note : Le fichier `vite.config.js` est configuré avec un proxy `/n8n-proxy` redirigeant les requêtes réseau locales vers `https://n8n.clavier.dev` pour éviter les blocages CORS lors du développement.*

### 3. Compiler pour la production

```bash
# Générer le bundle de production optimisé
npm run build

# Prévisualiser le build localement
npm run preview
```

---

## 🔗 Architecture des Webhooks (n8n)

L'application communique avec votre backend (par exemple, des workflows n8n) via des requêtes `POST` au format JSON. Voici les payloads attendus par les points d'accès :

### 1. Création de la Structure (Base du Récit)
- **Point d'accès** : webhook configuré à l'étape 1
- **Payload envoyé** :
```json
{
  "base": {
    "pitch": "Résumé de l'histoire...",
    "nombre_de_chapitres": 5,
    "contexte": {
      "epoque": "Futuriste",
      "culture": "Cyberpunk",
      "lieu": "Neo-Tokyo"
    },
    "style": {
      "longueurPhrases": 5,
      "complexiteGrammaticale": 4
      // ... 11 variables de style graduées de 1 à 10
    }
  },
  "modele": "deepseek/deepseek-v4-flash"
}
```
- **Réponse attendue** : Un objet JSON ou une chaîne contenant la liste structurée des chapitres (titre + résumé).

### 2. Génération des Personnages
- **Point d'accès** : webhook de validation d'étape 2
- **Payload envoyé** :
```json
{
  "action": "valider",
  "base": { ... },
  "structure": "[{\"title\":\"Chapitre 1\",\"resume\":\"Description...\"},...]",
  "modele": "..."
}
```
- **Réponse attendue** : Un objet JSON décrivant la liste des personnages principaux et secondaires.

### 3. Génération des Chapitres
- **Point d'accès** : webhook d'écriture d'étape 4
- **Payload envoyé** (pour chaque chapitre à rédiger) :
```json
{
  "action": "generer_chapitre",
  "chapNum": 1,
  "title": "Titre du chapitre",
  "resume": "Résumé du chapitre...",
  "previous_chapter": "Contenu complet du chapitre précédent (s'il y en a un)",
  "base": { ... },
  "structure": "...",
  "personnages": "...",
  "modele": "..."
}
```
- **Réponse attendue** : Le texte rédigé du chapitre, formaté en Markdown.
