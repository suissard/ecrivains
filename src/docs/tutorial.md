# Guide & Tutoriel de l'Assistant d'Écriture IA

Bienvenue dans l'outil de **Création de Livre IA** ! Cette application vous permet de co-écrire des romans et des récits structurés main dans la main avec une Intelligence Artificielle. Grâce à une architecture en 5 étapes et une communication bidirectionnelle avec vos workflows d'IA (ex: n8n), vous pouvez façonner votre histoire depuis l'idée initiale jusqu'à la mise en page finale.

---

## ⚙️ Configuration Globale & Paramètres

Avant de commencer, vous pouvez configurer l'intelligence et le réseau de l'application via le panneau des **Paramètres** (accessible via l'icône d'engrenage flottante en bas à droite).

1. **Choix du Modèle IA** : Une barre de recherche dynamique vous permet de sélectionner le modèle de langage de votre choix parmi ceux disponibles via OpenRouter (ex: *DeepSeek*, *Gemini*, *GPT*, *Claude*, etc.).
2. **URLs des Webhooks N8N** : Vous pouvez spécifier les points d'accès URL pour chaque phase de la génération :
   - *Étape 1 : Base du Récit* (génération de la structure de base)
   - *Étape 2 : Structure* (validation et ajustement)
   - *Étape 3 : Personnages* (génération des personnages et trame)
   - *Étape 4 : Chapitres* (rédaction du contenu)
3. **Persistance de l'état** : Tous vos choix, vos textes saisis, et l'avancement de votre livre sont gérés via Pinia et stockés en temps réel dans votre navigateur (`localStorage`). Vous ne perdrez pas votre travail si vous rafraîchissez la page !

---

## 🧭 Le Processus de Création en 5 Étapes

### Étape 1 : Base du récit (Les Fondations)
C'est ici que vous définissez l'univers et le ton de votre livre.
* **Pitch général** : Décrivez l'idée principale, l'intrigue et les enjeux de votre histoire.
* **Nombre de chapitres** : Spécifiez la longueur attendue de votre livre.
* **Contexte de l'œuvre** : Détaillez l'**Époque**, la **Culture** et le **Lieu** dans lesquels s'inscrit votre intrigue.
* **Style Littéraire (11 variables)** : Ajustez finement la voix de l'IA grâce à des curseurs précis :
  - *Longueur des phrases* (du style télégraphique au style proustien)
  - *Complexité grammaticale*
  - *Densité descriptive* (minimaliste à foisonnant)
  - *Registre de langue* (familier à académique)
  - *Nature du lexique* (concret à abstrait)
  - *Richesse lexicale* (usuel à érudit)
  - *Rythme* (contemplatif à frénétique)
  - *Engagement émotionnel* (clinique à lyrique)
  - *Humour* (sérieux à satirique)
  - *Explicitation* (Show, don't tell vs Tell)
  - *Introspection* (faits objectifs vs pensées subjectives)

Une fois cette base validée, cliquez sur **"Générer la structure"** pour soumettre le payload à l'IA.

---

### Étape 2 : Structure de l'histoire (Le Squelette)
L'IA vous propose un titre, un style narratif recommandé, un synopsis général, ainsi qu'un découpage chapitre par chapitre.
* **Éditeur Visuel de Cartes** : Chaque chapitre est modélisé sous forme de carte. Vous pouvez modifier directement le titre et le résumé de chaque chapitre (les zones de texte s'adaptent automatiquement à leur contenu).
* **Gestion du plan** : Vous pouvez réorganiser votre plan en **ajoutant** de nouveaux chapitres manuellement ou en **supprimant** ceux qui ne vous conviennent pas.
* **Ajustement par IA** : Si la proposition générale ne vous plaît pas, saisissez vos commentaires dans le champ de retour utilisateur et cliquez sur **"Demander des modifications"** pour régénérer la structure globale.
* Si le plan vous convient, cliquez sur **"Valider la structure"** pour passer à l'étape suivante.

> [!WARNING]
> **Gestion des désynchronisations** : Si vous retournez à une étape précédente pour la régénérer, un indicateur d'alerte jaune apparaîtra sur les étapes suivantes pour vous signaler que vos données actuelles ne sont plus synchronisées avec vos dernières modifications.

---

### Étape 3 : Personnages et trames (L'Âme du Récit)
L'IA exploite la structure validée pour concevoir l'univers humain de votre œuvre.
* **Fiches Personnages Visuelles** : L'interface affiche des cartes pour chaque personnage clé. Vous pouvez modifier à la main :
  - Le *Nom*
  - Le *Physique* (utilisé également comme prompt de génération d'image de portrait)
  - La *Personnalité*
  - Le *Comportement*, les *Habilités*, et les *Valeurs* du protagoniste.
* Vous pouvez ajouter des fiches ou supprimer des personnages secondaires.
* **Ajustement par IA** : Comme à l'étape précédente, vous pouvez demander à l'IA d'ajuster les fiches de personnages en saisissant des remarques textuelles.
* Cliquez sur **"Valider les personnages"** pour initialiser l'écriture.

---

### Étape 4 : Génération des chapitres (L'Écriture)
L'histoire prend enfin vie ! Vous disposez de plusieurs modes pour orchestrer la rédaction :
* **Génération en série (Tout générer)** : Cliquez sur **"Tout générer à la suite"** pour lancer l'écriture automatisée et consécutive de tous vos chapitres. L'IA rédigera chaque chapitre en tenant compte du contexte général et du contenu du chapitre précédent pour assurer la fluidité de la lecture.
* **Génération unitaire** : Écrivez ou régénérez les chapitres un par un à votre rythme grâce aux boutons **"Rédiger" / "Régénérer"** sur chaque en-tête.
* **Suivi de la progression** : 
  - Une jauge de progression s'affiche sous le titre.
  - La bulle d'étape 4 dans le menu supérieur se transforme en **indicateur de progression circulaire** dynamique affichant le pourcentage d'avancement réel.
* **Lecture intégrée** : Cliquez sur un chapitre pour l'étendre et lire son contenu rédigé, mis en forme en **Markdown** (titres, listes, dialogues, citations).
* **Actualisation** : Utilisez le bouton **"Actualiser les chapitres"** pour récupérer manuellement le statut des rédactions depuis le serveur.

---

### Étape 5 : Rendu final et Exportation (La Publication)
Votre livre est entièrement rédigé ! Vous pouvez maintenant le configurer comme un véritable objet éditorial.

#### 🎛️ Paramètres de mise en page
* **Format de page** : Choisissez entre le format **A4** (idéal pour l'impression classique ou la lecture sur écran) ou **A5** (format poche / roman).
* **Police de caractères** : Choisissez parmi plusieurs polices haut de gamme (Serif classique, Sans-Serif moderne, Monospace, ou des polices web additionnelles chargées dynamiquement).
* **Taille de police & Marges** : Ajustez la taille des caractères (de 8pt à 28pt) et les marges extérieures (de 1cm à 5cm).
* **Mode Livret (Imposition pour reliure)** : 
  Cette option avancée réorganise les pages du PDF pour l'impression en livret double face (imposition). Les pages sont combinées 2 par 2 sur des feuilles au format paysage (A4 paysage pour livre A5, A3 paysage pour livre A4).
  - Vous pouvez choisir de regrouper les feuilles en **cahiers (signatures)** de tailles fixes (de 1 à 16 feuilles par cahier, soit 4 à 64 pages imprimées par livret).
  - L'application calcule et ajoute automatiquement les **pages blanches nécessaires** à la fin du document pour compléter les cahiers.

#### 📱 Aperçu dynamique en direct
L'écran affiche une liseuse virtuelle qui simule exactement le rendu final du PDF en fonction de la police, de la taille des caractères, et des marges réelles choisies. Vous pouvez feuilleter le livre (couverture comprise) page par page avant de générer le fichier.

#### 📥 Téléchargement
Cliquez sur **"Obtenir mon Livre (Format PDF)"** pour lancer le compilateur jsPDF. Le fichier généré inclura :
- Une **page de couverture élégante** ornée d'un double cadre de couleur, de votre synopsis centré et des métadonnées contextuelles en pied de page.
- Des **en-têtes courants** sur chaque page de texte (sauf la couverture et les débuts de chapitres) reprenant le titre de l'œuvre.
- Une **numérotation automatique** des pages en pied de page.
