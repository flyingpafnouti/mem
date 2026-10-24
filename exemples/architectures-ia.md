## Architectures majeures en IA — nom, année, idée clé

### Réseaux classiques

- Perceptron (1958) — Rosenblatt — classifieur linéaire à seuil
- Perceptron multicouche — couches denses et non-linéarités, approximateur universel
- Réseau de Hopfield (1982) — Hopfield — mémoire associative, minimisation d'une énergie
- Machine de Boltzmann (1985) — Hinton, Sejnowski — modèle génératif à énergie stochastique
- Autoencodeur — compression dans un goulot d'étranglement puis reconstruction

### Réseaux convolutifs

- LeNet-5 (1998) — LeCun — convolution, sous-échantillonnage, partage des poids
- AlexNet (2012) — Krizhevsky — ReLU, dropout, entraînement sur GPU
- VGG (2014) — Simonyan, Zisserman — empilement de convolutions 3×3
- Inception (2014) — Szegedy — convolutions parallèles de tailles différentes
- ResNet (2015) — He — connexions résiduelles, y = x + F(x)
- U-Net (2015) — Ronneberger — encodeur-décodeur avec connexions de saut
- Faster R-CNN (2015) — Ren — détection en deux étapes, réseau de propositions de régions
- YOLO (2016) — Redmon — détection en une seule passe sur une grille
- DenseNet (2017) — Huang — chaque couche reçoit toutes les précédentes
- MobileNet (2017) — Howard — convolutions séparables en profondeur, réseaux embarqués
- Mask R-CNN (2017) — He — détection et segmentation d'instances
- EfficientNet (2019) — Tan, Le — mise à l'échelle conjointe de la profondeur, largeur et résolution
- ConvNeXt (2022) — Liu — convolutif modernisé avec les recettes des Transformers

### Réseaux récurrents

- RNN d'Elman (1990) — Elman — état caché réinjecté à chaque pas de temps
- LSTM (1997) — Hochreiter, Schmidhuber — cellule mémoire et portes d'entrée, d'oubli et de sortie
- GRU (2014) — Cho — deux portes, plus léger que le LSTM
- Seq2seq (2014) — Sutskever — encodeur et décodeur récurrents
- Attention de Bahdanau (2014) — Bahdanau — pondération apprise des états de l'encodeur

### Transformers

- Transformer (2017) — Vaswani — self-attention multi-têtes, encodage positionnel
- GPT (2018) — Radford — décodeur seul, prédiction du jeton suivant
- BERT (2018) — Devlin — encodeur seul, masquage de jetons
- T5 (2019) — Raffel — toute tâche formulée en texte vers texte
- DETR (2020) — Carion — détection d'objets par Transformer et appariement
- Vision Transformer (2020) — Dosovitskiy — image découpée en patchs traités comme des jetons
- Switch Transformer (2021) — Fedus — mélange d'experts, un expert par jeton
- Swin Transformer (2021) — Liu — attention par fenêtres glissantes, hiérarchie multi-échelle

### Modèles génératifs

- VAE (2013) — Kingma, Welling — encodeur probabiliste, borne inférieure variationnelle
- GAN (2014) — Goodfellow — jeu à deux joueurs entre générateur et discriminateur
- RealNVP (2016) — Dinh — flot normalisant, transformation inversible à jacobien simple
- StyleGAN (2018) — Karras — style injecté à chaque échelle du générateur
- DDPM (2020) — Ho — débruitage itératif d'un bruit gaussien
- Diffusion latente (2021) — Rombach — diffusion dans l'espace latent d'un autoencodeur
- Flow matching (2022) — Lipman — champ de vitesse appris entre bruit et données
- Diffusion Transformer (2022) — Peebles, Xie — Transformer comme réseau de débruitage

### Graphes, nuages de points et séquences longues

- GCN (2016) — Kipf, Welling — convolution sur graphe par agrégation des voisins
- GAT (2017) — Veličković — attention sur les arêtes d'un graphe
- PointNet (2017) — Qi — traitement direct de nuages de points, invariance par permutation
- Neural ODE (2018) — Chen — dynamique continue ẋ = f(x, t, θ) intégrée par un solveur
- S4 (2021) — Gu — modèle à espace d'états structuré pour séquences longues
- Mamba (2023) — Gu, Dao — espace d'états sélectif, coût linéaire en longueur

### Apprentissage auto-supervisé et multimodal

- SimCLR (2020) — Chen — apprentissage contrastif entre deux vues augmentées
- BYOL (2020) — Grill — réseau étudiant et réseau cible, sans paires négatives
- CLIP (2021) — Radford — alignement contrastif entre images et textes
- MAE (2021) — He — reconstruction de patchs d'image masqués
- DINO (2021) — Caron — auto-distillation sans étiquettes
- JEPA (2022) — LeCun — prédiction de représentations plutôt que de pixels
- I-JEPA (2023) — Assran — JEPA appliquée aux images
- V-JEPA (2024) — Bardes — JEPA appliquée aux vidéos

### Apprentissage par renforcement et world models

- DQN (2013) — Mnih — Q-learning profond, replay buffer, réseau cible
- Actor-critic — politique et fonction de valeur apprises conjointement
- World Models (2018) — Ha, Schmidhuber — VAE, RNN de dynamique et contrôleur
- Dreamer (2019) — Hafner — apprentissage par imagination dans un modèle latent
- MuZero (2019) — Schrittwieser — planification avec un modèle appris de la récompense et de la valeur
- Decision Transformer (2021) — Chen — RL formulé comme modélisation de séquence

### Représentations 3D

- NeRF (2020) — Mildenhall — champ de radiance continu représenté par un MLP
- 3D Gaussian Splatting (2023) — Kerbl — scène représentée par des gaussiennes 3D, rendu temps réel
