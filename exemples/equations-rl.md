## Équations de l'apprentissage par renforcement et du deep RL

### Cadre MDP

- Processus de décision markovien : $$\mathcal{M} = (\mathcal{S}, \mathcal{A}, P, r, \gamma, \rho_0), \qquad P(s' \mid s, a), \quad \gamma \in [0, 1)$$ Un agent observe l'état, choisit une action, reçoit une récompense et l'environnement passe à un nouvel état selon P.
- Retour actualisé : $$G_t = \sum_{k=0}^{\infty} \gamma^k\, r_{t+k+1} = r_{t+1} + \gamma\, G_{t+1}$$ Somme des récompenses futures pondérées par γ ; sa forme récursive est à l'origine de toutes les équations de Bellman.
- Horizon effectif : $$\sum_{k=0}^{\infty} \gamma^k = \frac{1}{1 - \gamma}$$ Avec γ = 0,99, l'agent regarde en pratique une centaine de pas en avant.
- Objectif du RL : $$J(\pi) = \mathbb{E}_{\tau \sim \pi}\left[ \sum_{t=0}^{\infty} \gamma^t\, r(s_t, a_t) \right], \qquad \pi^* = \arg\max_\pi J(\pi)$$ On cherche la politique qui maximise le retour moyen sur les trajectoires qu'elle génère.
- Probabilité d'une trajectoire : $$p_\theta(\tau) = \rho_0(s_0) \prod_{t=0}^{T-1} \pi_\theta(a_t \mid s_t)\, P(s_{t+1} \mid s_t, a_t)$$ Seuls les termes de la politique dépendent de θ, ce qui rend le gradient de politique calculable sans modèle.
- Fonction de valeur d'état : $$V^\pi(s) = \mathbb{E}_\pi\left[ G_t \mid s_t = s \right]$$ Retour moyen obtenu en partant de s et en suivant π.
- Fonction de valeur d'action : $$Q^\pi(s, a) = \mathbb{E}_\pi\left[ G_t \mid s_t = s,\, a_t = a \right]$$ Retour moyen en jouant a depuis s, puis en suivant π.
- Distribution d'états actualisée : $$d^\pi(s) = (1 - \gamma) \sum_{t=0}^{\infty} \gamma^t\, P(s_t = s \mid \pi)$$ Fréquence pondérée de visite des états ; c'est la loi sous laquelle s'écrivent le gradient de politique et le lemme de différence de performance.
- Objectif par la mesure d'occupation : $$J(\pi) = \frac{1}{1 - \gamma}\, \mathbb{E}_{s \sim d^\pi,\, a \sim \pi}\big[ r(s, a) \big]$$ Le retour s'écrit comme une récompense moyenne sous la distribution des couples état-action visités.
- Récompense moyenne : $$\rho^\pi = \lim_{T \to \infty} \frac{1}{T}\, \mathbb{E}_\pi\left[ \sum_{t=1}^{T} r_t \right]$$ Critère sans actualisation pour les tâches continues ; la valeur différentielle mesure l'écart à cette moyenne.
- Mise à jour de croyance d'un POMDP : $$b'(s') = \eta\; O(o \mid s', a) \sum_{s} P(s' \mid s, a)\, b(s)$$ Quand l'état est caché, l'agent raisonne sur une loi b, mise à jour comme un filtre bayésien ; η normalise.

### Équations de Bellman

- Bellman pour $V^\pi$ : $$V^\pi(s) = \sum_a \pi(a \mid s) \left[ r(s, a) + \gamma \sum_{s'} P(s' \mid s, a)\, V^\pi(s') \right]$$ La valeur d'un état est la récompense immédiate plus la valeur actualisée de l'état suivant, en moyenne.
- Bellman pour $Q^\pi$ : $$Q^\pi(s, a) = r(s, a) + \gamma\, \mathbb{E}_{s' \sim P,\, a' \sim \pi}\big[ Q^\pi(s', a') \big]$$ Même récursion, exprimée sur les couples état-action.
- Lien entre V et Q : $$V^\pi(s) = \mathbb{E}_{a \sim \pi}\big[ Q^\pi(s, a) \big], \qquad Q^\pi(s, a) = r(s, a) + \gamma\, \mathbb{E}_{s'}\big[ V^\pi(s') \big]$$ Chaque fonction se déduit de l'autre par une moyenne sur l'action ou sur l'état suivant.
- Forme matricielle : $$V^\pi = r^\pi + \gamma P^\pi V^\pi \;\Rightarrow\; V^\pi = (I - \gamma P^\pi)^{-1}\, r^\pi$$ Pour un MDP fini, l'évaluation d'une politique est un système linéaire, toujours inversible car γ < 1.
- Optimalité de Bellman pour $V^*$ : $$V^*(s) = \max_a \left[ r(s, a) + \gamma \sum_{s'} P(s' \mid s, a)\, V^*(s') \right]$$ La moyenne sur les actions est remplacée par un maximum.
- Optimalité de Bellman pour $Q^*$ : $$Q^*(s, a) = r(s, a) + \gamma\, \mathbb{E}_{s'}\left[ \max_{a'} Q^*(s', a') \right]$$ Point de départ du Q-learning et de DQN.
- Politique gloutonne optimale : $$\pi^*(s) = \arg\max_a Q^*(s, a)$$ Connaître Q* suffit pour agir de façon optimale, sans modèle de l'environnement.
- Contraction de l'opérateur de Bellman : $$\left\| \mathcal{T} Q_1 - \mathcal{T} Q_2 \right\|_\infty \leq \gamma\, \left\| Q_1 - Q_2 \right\|_\infty$$ L'opérateur rapproche deux fonctions quelconques d'un facteur γ, d'où un unique point fixe Q*.
- Fonction avantage : $$A^\pi(s, a) = Q^\pi(s, a) - V^\pi(s), \qquad \mathbb{E}_{a \sim \pi}\big[ A^\pi(s, a) \big] = 0$$ Mesure combien une action fait mieux que la moyenne de la politique dans cet état.
- Théorème d'amélioration de politique : $$Q^\pi\big(s, \pi'(s)\big) \geq V^\pi(s) \;\; \forall s \;\Rightarrow\; V^{\pi'}(s) \geq V^\pi(s) \;\; \forall s$$ Agir de façon gloutonne vis-à-vis de Q^π ne peut jamais dégrader la politique.
- Lemme de différence de performance : $$J(\pi') - J(\pi) = \frac{1}{1 - \gamma}\, \mathbb{E}_{s \sim d^{\pi'},\, a \sim \pi'}\big[ A^\pi(s, a) \big]$$ L'écart entre deux politiques s'écrit avec l'avantage de l'ancienne, mesuré sur les états de la nouvelle. Fondement de TRPO et PPO.
- Programme linéaire du MDP : $$\min_V \sum_s \mu(s)\, V(s) \;\;\text{s.c.}\;\; V(s) \geq r(s, a) + \gamma \sum_{s'} P(s' \mid s, a)\, V(s') \;\; \forall (s, a)$$ V* est la plus petite fonction qui majore son image par Bellman ; le dual porte sur la mesure d'occupation.
- Bellman différentiel, récompense moyenne : $$h(s) = \sum_a \pi(a \mid s) \sum_{s'} P(s' \mid s, a) \big[ r(s, a) - \rho^\pi + h(s') \big]$$ En récompense moyenne, la valeur relative h remplace V et la récompense est centrée par ρ.

### Programmation dynamique

- Évaluation itérative de politique : $$V_{k+1}(s) = \sum_a \pi(a \mid s) \left[ r(s, a) + \gamma \sum_{s'} P(s' \mid s, a)\, V_k(s') \right]$$ On applique l'opérateur de Bellman de π jusqu'à convergence vers V^π.
- Itération sur les valeurs : $$V_{k+1}(s) = \max_a \left[ r(s, a) + \gamma \sum_{s'} P(s' \mid s, a)\, V_k(s') \right]$$ Applique l'opérateur d'optimalité ; converge vers V* quel que soit V₀.
- Vitesse de l'itération sur les valeurs : $$\| V_k - V^* \|_\infty \leq \gamma^k\, \| V_0 - V^* \|_\infty$$ Convergence géométrique ; plus γ est proche de 1, plus il faut d'itérations.
- Itération sur les politiques : $$\pi_{k+1}(s) = \arg\max_a \left[ r(s, a) + \gamma \sum_{s'} P(s' \mid s, a)\, V^{\pi_k}(s') \right]$$ Alterne évaluation exacte et amélioration gloutonne ; converge en un nombre fini d'étapes pour un MDP fini.
- Perte de la politique gloutonne : $$\| V - V^* \|_\infty \leq \varepsilon \;\Rightarrow\; V^{\pi_{greedy}} \geq V^* - \frac{2 \gamma \varepsilon}{1 - \gamma}$$ Une erreur ε sur la valeur coûte au plus 2γε/(1 − γ) en performance ; l'erreur est amplifiée par l'horizon.

### Bandits manchots

- Regret cumulé : $$R_T = T \mu^* - \mathbb{E}\left[ \sum_{t=1}^{T} r_t \right] = \sum_a \Delta_a\, \mathbb{E}\big[ N_a(T) \big], \quad \Delta_a = \mu^* - \mu_a$$ Ce que l'on perd par rapport à toujours jouer le meilleur bras ; il dépend du nombre de tirages des bras sous-optimaux.
- Moyenne incrémentale : $$Q_{n+1} = Q_n + \frac{1}{n} \big( R_n - Q_n \big)$$ Forme générique du RL : nouvelle estimation = ancienne + pas × (cible − ancienne).
- Politique ε-gloutonne : $$\pi(a \mid s) = \begin{cases} 1 - \varepsilon + \dfrac{\varepsilon}{|\mathcal{A}|} & \text{si } a = \arg\max_b Q(s, b) \\[2mm] \dfrac{\varepsilon}{|\mathcal{A}|} & \text{sinon} \end{cases}$$ Exploite la meilleure action connue, explore uniformément avec probabilité ε.
- Exploration de Boltzmann : $$\pi(a \mid s) = \frac{\exp\big( Q(s, a) / \tau \big)}{\sum_b \exp\big( Q(s, b) / \tau \big)}$$ Les actions sont choisies en proportion de leur valeur ; la température τ règle l'exploration.
- UCB1 : $$a_t = \arg\max_a \left[ \hat{\mu}_a + \sqrt{\frac{2 \ln t}{N_a(t)}} \right]$$ Optimisme face à l'incertitude : on joue le bras dont la borne supérieure de confiance est la plus haute. Regret en O(log T).
- Borne de Lai-Robbins : $$\liminf_{T \to \infty} \frac{\mathbb{E}[R_T]}{\ln T} \geq \sum_{a :\, \Delta_a > 0} \frac{\Delta_a}{D_{\mathrm{KL}}(\nu_a \,\|\, \nu^*)}$$ Aucun algorithme ne fait mieux qu'un regret logarithmique ; les bras proches du meilleur coûtent le plus cher.
- Échantillonnage de Thompson, cas Bernoulli : $$\theta_a \sim \operatorname{Beta}(\alpha_a, \beta_a), \quad a_t = \arg\max_a \theta_a, \quad \alpha_{a_t} \mathrel{+}= r_t, \;\; \beta_{a_t} \mathrel{+}= 1 - r_t$$ On tire un modèle dans la loi a posteriori et on agit comme s'il était vrai.
- Bandit par gradient : $$H(a) \leftarrow H(a) + \alpha\, (R_t - \bar{R}_t) \big( \mathbf{1}_{a = A_t} - \pi(a) \big), \qquad \pi = \operatorname{softmax}(H)$$ Montée de gradient stochastique sur des préférences ; la récompense moyenne R̄ sert de baseline.
- LinUCB, bandit contextuel : $$a_t = \arg\max_a \left[ x_a^\top \hat{\theta} + \alpha \sqrt{x_a^\top A^{-1} x_a} \right], \qquad A = \lambda I + \sum_s x_s x_s^\top$$ La récompense est linéaire dans le contexte ; le bonus est l'écart-type de la prédiction par moindres carrés régularisés.

### Monte-Carlo et différences temporelles

- Mise à jour Monte-Carlo : $$V(s_t) \leftarrow V(s_t) + \alpha \big[ G_t - V(s_t) \big]$$ Cible sans biais mais à forte variance, disponible seulement en fin d'épisode.
- TD(0) : $$V(s_t) \leftarrow V(s_t) + \alpha \big[ r_{t+1} + \gamma V(s_{t+1}) - V(s_t) \big]$$ On remplace le retour par une estimation à un pas : biais introduit par V, variance réduite.
- Erreur de différence temporelle : $$\delta_t = r_{t+1} + \gamma V(s_{t+1}) - V(s_t), \qquad \mathbb{E}_\pi[\delta_t \mid s_t] = 0 \text{ si } V = V^\pi$$ Surprise entre la valeur prédite et la cible à un pas ; nulle en moyenne à convergence.
- Retour à n pas : $$G_t^{(n)} = \sum_{k=0}^{n-1} \gamma^k\, r_{t+k+1} + \gamma^n\, V(s_{t+n})$$ Interpole entre TD (n = 1) et Monte-Carlo (n = ∞) ; compromis biais-variance.
- λ-retour : $$G_t^\lambda = (1 - \lambda) \sum_{n=1}^{\infty} \lambda^{n-1}\, G_t^{(n)}$$ Moyenne géométrique de tous les retours à n pas ; λ = 0 donne TD(0), λ = 1 donne Monte-Carlo.
- TD(λ) avec traces d'éligibilité : $$e_t = \gamma \lambda\, e_{t-1} + \nabla_w \hat{v}(s_t, w), \qquad w \leftarrow w + \alpha\, \delta_t\, e_t$$ Version en ligne du λ-retour : chaque erreur TD crédite les états récents en proportion de leur trace.
- SARSA : $$Q(s_t, a_t) \leftarrow Q(s_t, a_t) + \alpha \big[ r_{t+1} + \gamma Q(s_{t+1}, a_{t+1}) - Q(s_t, a_t) \big]$$ TD sur les couples état-action, sur politique : la cible utilise l'action réellement jouée.
- Expected SARSA : $$Q(s_t, a_t) \leftarrow Q(s_t, a_t) + \alpha \Big[ r_{t+1} + \gamma \sum_{a'} \pi(a' \mid s_{t+1})\, Q(s_{t+1}, a') - Q(s_t, a_t) \Big]$$ Remplace l'action tirée par une moyenne sous π, ce qui supprime une source de variance.
- Q-learning : $$Q(s_t, a_t) \leftarrow Q(s_t, a_t) + \alpha \Big[ r_{t+1} + \gamma \max_{a'} Q(s_{t+1}, a') - Q(s_t, a_t) \Big]$$ Hors politique : apprend Q* quelle que soit la politique d'exploration, si tous les couples sont visités infiniment souvent.
- Convergence du Q-learning tabulaire : $$\sum_t \alpha_t(s, a) = \infty, \qquad \sum_t \alpha_t(s, a)^2 < \infty$$ Conditions de Robbins-Monro sur le pas, pour chaque couple état-action.
- Double Q-learning : $$Q_A(s, a) \leftarrow Q_A(s, a) + \alpha \Big[ r + \gamma\, Q_B\big(s', \arg\max_{a'} Q_A(s', a')\big) - Q_A(s, a) \Big]$$ Une table choisit l'action, l'autre l'évalue ; corrige le biais de surestimation du max.
- Biais de surestimation du max : $$\mathbb{E}\Big[ \max_a \hat{Q}(s, a) \Big] \geq \max_a \mathbb{E}\big[ \hat{Q}(s, a) \big]$$ Inégalité de Jensen : le maximum d'estimations bruitées est biaisé vers le haut, et Bellman propage ce biais.
- Ratio d'importance d'une trajectoire : $$\rho_{t:T-1} = \prod_{k=t}^{T-1} \frac{\pi(a_k \mid s_k)}{b(a_k \mid s_k)}$$ Corrige l'écart entre la politique cible π et la politique de comportement b ; les dynamiques inconnues se simplifient.
- Monte-Carlo hors politique pondéré : $$V(s) = \frac{\sum_{t \in \mathcal{T}(s)} \rho_{t:T-1}\, G_t}{\sum_{t \in \mathcal{T}(s)} \rho_{t:T-1}}$$ La normalisation par la somme des ratios introduit un biais mais réduit fortement la variance.
- Retrace : $$\Delta Q(s_t, a_t) = \sum_{k \geq t} \gamma^{k-t} \Big( \prod_{i=t+1}^{k} c_i \Big) \Big[ r_{k+1} + \gamma\, \mathbb{E}_\pi Q(s_{k+1}, \cdot) - Q(s_k, a_k) \Big], \quad c_i = \lambda \min\!\left(1, \frac{\pi(a_i \mid s_i)}{\mu(a_i \mid s_i)}\right)$$ Retours multi-pas hors politique, sûrs : les ratios tronqués à 1 évitent l'explosion de la variance.
- V-trace d'IMPALA : $$v_s = V(s_s) + \sum_{t=s}^{s+n-1} \gamma^{t-s} \Big( \prod_{i=s}^{t-1} c_i \Big) \rho_t\, \delta_t, \qquad \rho_t = \min\!\left(\bar{\rho}, \frac{\pi(a_t \mid s_t)}{\mu(a_t \mid s_t)}\right)$$ Corrige le retard des acteurs distribués ; ρ̄ fixe le point fixe visé, c̄ la vitesse de contraction.

### Approximation de fonctions

- Erreur quadratique de valeur : $$\overline{VE}(w) = \sum_s \mu(s) \big[ V^\pi(s) - \hat{v}(s, w) \big]^2$$ Objectif naturel de l'évaluation, pondéré par la distribution des états visités.
- Gradient Monte-Carlo : $$w \leftarrow w + \alpha \big[ G_t - \hat{v}(s_t, w) \big]\, \nabla_w \hat{v}(s_t, w)$$ Vraie descente de gradient stochastique sur VE ; converge vers un optimum local.
- TD(0) semi-gradient : $$w \leftarrow w + \alpha \big[ r_{t+1} + \gamma\, \hat{v}(s_{t+1}, w) - \hat{v}(s_t, w) \big]\, \nabla_w \hat{v}(s_t, w)$$ On ignore la dépendance de la cible en w : ce n'est pas un vrai gradient, d'où les instabilités possibles.
- Point fixe de TD linéaire : $$w_{TD} = A^{-1} b, \qquad A = \mathbb{E}\big[ x_t (x_t - \gamma x_{t+1})^\top \big], \quad b = \mathbb{E}\big[ r_{t+1}\, x_t \big]$$ Avec des caractéristiques linéaires sur politique, TD converge vers ce point ; LSTD l'estime directement par moindres carrés.
- Qualité du point fixe TD : $$\overline{VE}(w_{TD}) \leq \frac{1}{1 - \gamma}\, \min_w \overline{VE}(w)$$ TD peut perdre jusqu'à un facteur d'horizon par rapport à la meilleure approximation.
- Équation de Bellman projetée : $$\hat{v}_w = \Pi\, \mathcal{T}^\pi \hat{v}_w, \qquad \overline{PBE}(w) = \big\| \Pi\, \delta_w \big\|_\mu^2$$ TD cherche le point fixe de Bellman suivi d'une projection sur l'espace des fonctions représentables ; GTD et TDC descendent le gradient de cette erreur.
- Itération Q ajustée : $$Q_{k+1} = \arg\min_{f \in \mathcal{F}} \sum_i \Big( f(s_i, a_i) - \big[ r_i + \gamma \max_{a'} Q_k(s'_i, a') \big] \Big)^2$$ L'itération sur les valeurs devient une suite de régressions supervisées ; ancêtre direct de DQN.
- Triade mortelle : $$\text{approximation} + \text{bootstrap} + \text{hors politique} \;\Rightarrow\; \text{divergence possible}$$ Les trois ingrédients réunis peuvent faire diverger les poids, comme dans le contre-exemple de Baird.

### Deep Q-learning

- Perte DQN : $$\mathcal{L}(\theta) = \mathbb{E}_{(s, a, r, s') \sim \mathcal{D}}\left[ \Big( r + \gamma \max_{a'} Q_{\theta^-}(s', a') - Q_\theta(s, a) \Big)^2 \right]$$ Régression sur une cible calculée par un réseau figé θ⁻, avec des transitions tirées d'une mémoire de rejeu.
- Perte de Huber : $$L_\kappa(u) = \begin{cases} \tfrac{1}{2} u^2 & |u| \leq \kappa \\ \kappa \big( |u| - \tfrac{1}{2} \kappa \big) & \text{sinon} \end{cases}$$ Quadratique près de zéro, linéaire au-delà : limite l'effet des grandes erreurs TD sur le gradient.
- Mise à jour douce du réseau cible : $$\theta^- \leftarrow \tau\, \theta + (1 - \tau)\, \theta^-, \qquad \tau \ll 1$$ Moyenne de Polyak : la cible bouge lentement, ce qui stabilise la régression. DQN copie plutôt θ tous les C pas.
- Cible Double DQN : $$y = r + \gamma\, Q_{\theta^-}\Big(s', \arg\max_{a'} Q_\theta(s', a')\Big)$$ Le réseau en ligne choisit l'action, le réseau cible l'évalue ; réduit la surestimation à coût nul.
- Architecture Dueling : $$Q(s, a) = V(s) + A(s, a) - \frac{1}{|\mathcal{A}|} \sum_{a'} A(s, a')$$ Sépare la valeur de l'état de l'avantage des actions ; le centrage rend la décomposition identifiable.
- Rejeu prioritaire : $$P(i) = \frac{p_i^\alpha}{\sum_k p_k^\alpha}, \quad p_i = |\delta_i| + \epsilon, \qquad w_i = \left( \frac{1}{N\, P(i)} \right)^{\beta}$$ Les transitions surprenantes sont rejouées plus souvent ; les poids w_i corrigent le biais d'échantillonnage.
- Cible à n pas : $$y_t = \sum_{k=0}^{n-1} \gamma^k\, r_{t+k+1} + \gamma^n \max_{a'} Q_{\theta^-}(s_{t+n}, a')$$ Propage la récompense plus vite ; légèrement biaisée hors politique, mais très utilisée dans Rainbow.
- Équation de Bellman distributionnelle : $$Z(s, a) \overset{D}{=} R(s, a) + \gamma\, Z(S', A')$$ On apprend la loi entière du retour plutôt que sa moyenne ; l'égalité est en distribution.
- Projection catégorielle de C51 : $$(\Phi \hat{\mathcal{T}} Z)_i = \sum_j \left[ 1 - \frac{\big| [r + \gamma z_j]_{V_{min}}^{V_{max}} - z_i \big|}{\Delta z} \right]_0^1 p_j(s', a^*)$$ Le retour décalé et contracté est reprojeté sur le support fixe z_i, puis appris par entropie croisée.
- Perte quantile de QR-DQN : $$\rho_\tau^\kappa(u) = \big| \tau - \mathbf{1}_{u < 0} \big|\, \frac{L_\kappa(u)}{\kappa}, \qquad \hat{\tau}_i = \frac{2i - 1}{2N}$$ Chaque sortie estime un quantile du retour ; la pénalité asymétrique pousse la sortie vers le bon quantile.
- Couche NoisyNet : $$y = \big( \mu^w + \sigma^w \odot \varepsilon^w \big)\, x + \mu^b + \sigma^b \odot \varepsilon^b$$ Bruit paramétrique appris dans les poids ; remplace l'ε-glouton par une exploration dépendante de l'état.

### Gradients de politique

- Astuce de la vraisemblance : $$\nabla_\theta J(\theta) = \mathbb{E}_{\tau \sim p_\theta}\left[ \Big( \sum_{t} \nabla_\theta \log \pi_\theta(a_t \mid s_t) \Big)\, R(\tau) \right]$$ Le gradient du retour moyen s'estime par simple échantillonnage de trajectoires, sans dériver l'environnement.
- REINFORCE avec reward-to-go : $$\nabla_\theta J(\theta) = \mathbb{E}\left[ \sum_t \nabla_\theta \log \pi_\theta(a_t \mid s_t)\, \big( G_t - b(s_t) \big) \right]$$ Par causalité, une action n'est créditée que des récompenses qui la suivent ; la baseline réduit la variance sans biais.
- Baseline sans biais : $$\mathbb{E}_{a \sim \pi_\theta}\big[ \nabla_\theta \log \pi_\theta(a \mid s)\, b(s) \big] = b(s)\, \nabla_\theta \sum_a \pi_\theta(a \mid s) = 0$$ Soustraire une fonction de l'état seul ne change pas le gradient moyen, car les probabilités somment à 1.
- Théorème du gradient de politique : $$\nabla_\theta J(\theta) = \frac{1}{1 - \gamma}\, \mathbb{E}_{s \sim d^\pi,\, a \sim \pi_\theta}\big[ Q^\pi(s, a)\, \nabla_\theta \log \pi_\theta(a \mid s) \big]$$ Le gradient ne fait pas intervenir la dérivée de la distribution d'états, pourtant dépendante de θ.
- Score d'une politique softmax : $$\pi_\theta(a \mid s) \propto e^{\theta^\top \phi(s, a)} \;\Rightarrow\; \nabla_\theta \log \pi_\theta(a \mid s) = \phi(s, a) - \sum_b \pi_\theta(b \mid s)\, \phi(s, b)$$ Caractéristique de l'action jouée moins la caractéristique moyenne sous la politique.
- Score d'une politique gaussienne : $$a \sim \mathcal{N}\big(\mu_\theta(s), \sigma^2\big) \;\Rightarrow\; \nabla_\theta \log \pi_\theta(a \mid s) = \frac{a - \mu_\theta(s)}{\sigma^2}\, \nabla_\theta \mu_\theta(s)$$ La moyenne est poussée vers les actions qui ont donné un avantage positif.
- Acteur-critique à un pas : $$\delta_t = r_{t+1} + \gamma V_w(s_{t+1}) - V_w(s_t), \qquad w \leftarrow w + \alpha_w\, \delta_t \nabla_w V_w, \qquad \theta \leftarrow \theta + \alpha_\theta\, \delta_t \nabla_\theta \log \pi_\theta(a_t \mid s_t)$$ Le critique apprend V par TD, et son erreur δ sert d'estimation de l'avantage pour l'acteur.
- Perte A2C : $$\mathcal{L} = -\mathbb{E}_t\big[ \log \pi_\theta(a_t \mid s_t)\, \hat{A}_t \big] + c_v\, \mathbb{E}_t\big[ (V_\theta(s_t) - \hat{G}_t)^2 \big] - c_e\, \mathbb{E}_t\big[ \mathcal{H}(\pi_\theta(\cdot \mid s_t)) \big]$$ Terme de politique, régression du critique et bonus d'entropie qui empêche une convergence prématurée.
- GAE, forme récursive : $$\hat{A}_t = \delta_t + \gamma \lambda\, \hat{A}_{t+1}, \qquad \hat{G}_t = \hat{A}_t + V(s_t)$$ Calcul en une passe arrière sur le rollout ; λ règle le compromis biais-variance de l'avantage.
- Gradient naturel : $$\theta \leftarrow \theta + \alpha\, F(\theta)^{-1}\, \nabla_\theta J, \qquad F(\theta) = \mathbb{E}\big[ \nabla_\theta \log \pi_\theta\, \nabla_\theta \log \pi_\theta^\top \big]$$ Le pas est mesuré dans l'espace des lois et non des paramètres ; invariant par reparamétrisation.
- KL au second ordre : $$D_{\mathrm{KL}}\big( \pi_\theta \,\|\, \pi_{\theta + \Delta\theta} \big) \approx \tfrac{1}{2}\, \Delta\theta^\top F(\theta)\, \Delta\theta$$ La matrice de Fisher est la courbure locale de la KL ; c'est ce qui relie gradient naturel et région de confiance.
- Approximation compatible : $$Q_w(s, a) = \nabla_\theta \log \pi_\theta(a \mid s)^\top w \;\Rightarrow\; F(\theta)^{-1} \nabla_\theta J = w$$ Avec un critique linéaire dans le score, le gradient naturel est directement les poids du critique.
- Borne de TRPO : $$J(\tilde{\pi}) \geq L_\pi(\tilde{\pi}) - \frac{4 \varepsilon \gamma}{(1 - \gamma)^2}\, D_{\mathrm{KL}}^{max}(\pi, \tilde{\pi}), \qquad \varepsilon = \max_{s, a} |A^\pi(s, a)|$$ Maximiser le substitut pénalisé par la KL garantit une amélioration monotone.
- Pas de TRPO : $$\theta_{k+1} = \theta_k + \sqrt{\frac{2 \delta}{g^\top F^{-1} g}}\; F^{-1} g$$ Direction du gradient naturel, calculée par gradient conjugué, mise à l'échelle pour atteindre la KL δ, puis recherche linéaire.
- Objectif TRPO : $$\max_\theta\; \mathbb{E}_t\left[ \frac{\pi_\theta(a_t \mid s_t)}{\pi_{\theta_{old}}(a_t \mid s_t)}\, \hat{A}_t \right] \;\;\text{s.c.}\;\; \mathbb{E}_t\Big[ D_{\mathrm{KL}}\big( \pi_{\theta_{old}}(\cdot \mid s_t) \,\|\, \pi_\theta(\cdot \mid s_t) \big) \Big] \leq \delta$$ Le substitut d'échantillonnage préférentiel est maximisé dans une région de confiance.
- Objectif PPO clippé : $$L^{CLIP}(\theta) = \mathbb{E}_t\Big[ \min\big( r_t(\theta)\, \hat{A}_t,\; \operatorname{clip}(r_t(\theta), 1 - \epsilon, 1 + \epsilon)\, \hat{A}_t \big) \Big], \qquad r_t = \frac{\pi_\theta(a_t \mid s_t)}{\pi_{\theta_{old}}(a_t \mid s_t)}$$ Le min forme une borne pessimiste : aucun intérêt à éloigner le ratio de 1 au-delà de ε.
- PPO à pénalité KL adaptative : $$L^{KLPEN}(\theta) = \mathbb{E}_t\big[ r_t(\theta)\, \hat{A}_t - \beta\, D_{\mathrm{KL}}(\pi_{\theta_{old}} \,\|\, \pi_\theta) \big], \qquad \beta \leftarrow \begin{cases} 2\beta & d > 1{,}5\, d_{targ} \\ \beta / 2 & d < d_{targ} / 1{,}5 \end{cases}$$ Variante où la contrainte de TRPO devient une pénalité dont le poids s'ajuste à la KL mesurée d.
- Perte PPO complète : $$L(\theta) = \mathbb{E}_t\Big[ L_t^{CLIP}(\theta) - c_1 \big( V_\theta(s_t) - V_t^{targ} \big)^2 + c_2\, \mathcal{H}\big[ \pi_\theta(\cdot \mid s_t) \big] \Big]$$ Objectif à maximiser quand acteur et critique partagent un réseau.

### Acteur-critique en actions continues

- Gradient de politique déterministe : $$\nabla_\theta J = \mathbb{E}_{s \sim \rho^\mu}\Big[ \nabla_\theta \mu_\theta(s)\; \nabla_a Q(s, a) \big|_{a = \mu_\theta(s)} \Big]$$ L'acteur suit le gradient du critique par rapport à l'action ; pas besoin d'intégrer sur les actions.
- Cible du critique DDPG : $$y = r + \gamma\, Q_{\phi^-}\big( s', \mu_{\theta^-}(s') \big)$$ Q-learning où le max est remplacé par l'acteur cible, qui approxime l'argmax en continu.
- Lissage de la cible TD3 : $$\tilde{a}' = \operatorname{clip}\Big( \mu_{\theta^-}(s') + \operatorname{clip}(\varepsilon, -c, c),\; a_{low},\; a_{high} \Big), \qquad \varepsilon \sim \mathcal{N}(0, \sigma^2)$$ Un bruit borné sur l'action cible empêche l'acteur d'exploiter des pics étroits et erronés du critique.
- Double critique clippé de TD3 : $$y = r + \gamma \min_{j = 1, 2} Q_{\phi_j^-}(s', \tilde{a}')$$ Le minimum de deux critiques indépendants contre la surestimation ; l'acteur est en plus mis à jour moins souvent.
- Objectif SAC à entropie maximale : $$J(\pi) = \sum_t \mathbb{E}_{(s_t, a_t) \sim \rho_\pi}\Big[ r(s_t, a_t) + \alpha\, \mathcal{H}\big( \pi(\cdot \mid s_t) \big) \Big]$$ L'agent est récompensé pour rester aléatoire ; exploration plus robuste et politiques plus stables.
- Cible du critique SAC : $$y = r + \gamma \Big( \min_{j = 1, 2} Q_{\bar{\phi}_j}(s', \tilde{a}') - \alpha \log \pi_\theta(\tilde{a}' \mid s') \Big), \qquad \tilde{a}' \sim \pi_\theta(\cdot \mid s')$$ Bellman doux : la valeur suivante inclut le bonus d'entropie.
- Perte de l'acteur SAC : $$J_\pi(\theta) = \mathbb{E}_{s \sim \mathcal{D},\, \varepsilon \sim \mathcal{N}}\Big[ \alpha \log \pi_\theta\big( f_\theta(\varepsilon; s) \mid s \big) - Q_\phi\big( s, f_\theta(\varepsilon; s) \big) \Big]$$ Reparamétrisation a = f_θ(ε; s) : le gradient traverse le critique, comme dans DDPG.
- Réglage automatique de la température : $$J(\alpha) = \mathbb{E}_{a \sim \pi_\theta}\big[ -\alpha \log \pi_\theta(a \mid s) - \alpha\, \bar{\mathcal{H}} \big]$$ α augmente si l'entropie passe sous la cible H̄, typiquement −dim(A).
- Correction tanh de la log-vraisemblance : $$a = \tanh(u), \;\; u \sim \mathcal{N}(\mu, \sigma^2) \;\Rightarrow\; \log \pi(a \mid s) = \log \mathcal{N}(u; \mu, \sigma^2) - \sum_i \log\big( 1 - \tanh^2(u_i) \big)$$ Changement de variables pour borner les actions ; sans ce terme l'entropie est fausse.

### RL régularisé et entropie maximale

- Bellman doux : $$Q(s, a) = r(s, a) + \gamma\, \mathbb{E}_{s'}\big[ V(s') \big], \qquad V(s) = \mathbb{E}_{a \sim \pi}\big[ Q(s, a) - \alpha \log \pi(a \mid s) \big]$$ La valeur d'un état inclut l'entropie future de la politique.
- Valeur douce optimale : $$V^*(s) = \alpha \log \sum_a \exp\!\left( \frac{Q^*(s, a)}{\alpha} \right)$$ Le max est remplacé par un log-sum-exp ; on retrouve le max quand α → 0.
- Politique douce optimale : $$\pi^*(a \mid s) = \exp\!\left( \frac{Q^*(s, a) - V^*(s)}{\alpha} \right)$$ Politique de Boltzmann sur Q* ; V* joue le rôle de constante de normalisation.
- Amélioration par KL, MPO et REPS : $$q(a \mid s) \propto \pi_{old}(a \mid s)\, \exp\!\left( \frac{Q(s, a)}{\eta} \right)$$ Solution exacte de max E_q[Q] sous contrainte de KL vers l'ancienne politique ; on ajuste ensuite π à q par maximum de vraisemblance.

### RL à base de modèle

- Apprentissage du modèle : $$\min_\psi\; \mathbb{E}_{(s, a, s') \sim \mathcal{D}}\big[ -\log \hat{P}_\psi(s' \mid s, a) \big]$$ Le modèle de dynamique est une régression supervisée sur les transitions ; un ensemble de modèles capture l'incertitude épistémique (PETS, MBPO).
- Lemme de simulation : $$\big\| \hat{P}(\cdot \mid s, a) - P(\cdot \mid s, a) \big\|_1 \leq \varepsilon \;\; \forall (s, a) \;\Rightarrow\; \big| \hat{J}(\pi) - J(\pi) \big| \leq \frac{\gamma\, \varepsilon\, R_{max}}{(1 - \gamma)^2}$$ L'erreur de modèle s'accumule sur l'horizon de façon quadratique ; d'où les rollouts courts de MBPO.
- Commande prédictive : $$a_{t:t+H-1}^* = \arg\max_{a_{t:t+H-1}} \sum_{k=0}^{H-1} \gamma^k\, r(\hat{s}_{t+k}, a_{t+k}), \qquad \hat{s}_{k+1} = \hat{f}(\hat{s}_k, a_k)$$ On optimise une séquence d'actions sur le modèle, on applique la première, puis on replanifie.
- Méthode de l'entropie croisée : $$a^{(i)} \sim \mathcal{N}(\mu, \sigma^2), \qquad \mu \leftarrow \operatorname{moy}\big( a^{(i)}_{elite} \big), \quad \sigma \leftarrow \operatorname{std}\big( a^{(i)}_{elite} \big)$$ Optimiseur sans gradient de MPC : on garde les meilleures séquences et on resserre la gaussienne autour d'elles.
- MPPI : $$a_t \leftarrow \sum_i w_i\, a_t^{(i)}, \qquad w_i = \frac{\exp\big( R^{(i)} / \lambda \big)}{\sum_j \exp\big( R^{(j)} / \lambda \big)}$$ Moyenne des séquences pondérée par l'exponentielle de leur retour ; très utilisé pour la commande de drones.
- Perte du world model de Dreamer : $$\mathcal{L} = \mathbb{E}\Big[ \sum_t -\ln p(x_t \mid h_t, z_t) - \ln p(r_t \mid h_t, z_t) + \beta\, D_{\mathrm{KL}}\big( q(z_t \mid h_t, x_t) \,\|\, p(z_t \mid h_t) \big) \Big]$$ ELBO séquentielle : reconstruire l'observation et la récompense, et rendre l'a priori prédictif proche de l'a posteriori.
- λ-retour de Dreamer en imagination : $$V_t^\lambda = r_t + \gamma \Big[ (1 - \lambda)\, v_\psi(s_{t+1}) + \lambda\, V_{t+1}^\lambda \Big], \qquad V_H^\lambda = v_\psi(s_H)$$ Cible du critique calculée sur des trajectoires rêvées par le modèle latent.
- UCT dans MCTS : $$a = \arg\max_a \left[ Q(s, a) + c \sqrt{\frac{\ln N(s)}{N(s, a)}} \right]$$ UCB appliqué à chaque nœud de l'arbre de recherche.
- PUCT d'AlphaZero : $$a = \arg\max_a \left[ Q(s, a) + c_{puct}\, P(s, a)\, \frac{\sqrt{\sum_b N(s, b)}}{1 + N(s, a)} \right]$$ L'a priori du réseau de politique oriente l'exploration de l'arbre.
- Perte d'AlphaZero : $$\ell = (z - v)^2 - \pi^\top \log p + c\, \|\theta\|^2$$ La valeur apprend le résultat z de la partie, la politique imite les visites π de la recherche.
- Perte de MuZero : $$\ell = \sum_{k=0}^{K} \Big[ \ell^r\big( u_{t+k}, r_t^k \big) + \ell^v\big( z_{t+k}, v_t^k \big) + \ell^p\big( \pi_{t+k}, p_t^k \big) \Big] + c\, \|\theta\|^2$$ Le modèle latent n'est entraîné qu'à prédire récompenses, valeurs et politiques, jamais à reconstruire l'observation.

### Exploration

- Bonus de comptage : $$r^+(s, a) = r(s, a) + \frac{\beta}{\sqrt{N(s, a)}}$$ Récompense les couples peu visités ; base théorique de MBIE-EB, généralisée par les pseudo-comptes.
- Random Network Distillation : $$r^i_t = \big\| \hat{f}_\theta(s_{t+1}) - f(s_{t+1}) \big\|^2$$ Un réseau apprend à imiter un réseau aléatoire figé ; l'erreur reste grande dans les états nouveaux.
- Curiosité ICM : $$r^i_t = \frac{\eta}{2} \big\| \hat{\phi}(s_{t+1}) - \phi(s_{t+1}) \big\|^2, \qquad \hat{\phi}(s_{t+1}) = g\big( \phi(s_t), a_t \big)$$ Erreur de prédiction de la dynamique dans un espace appris par modèle inverse, insensible aux distracteurs incontrôlables.
- Récompense combinée : $$r_t = r_t^e + \beta\, r_t^i$$ La récompense extrinsèque de la tâche est augmentée d'un terme intrinsèque de curiosité.

### Apprentissage hors ligne et par imitation

- Clonage comportemental : $$\min_\theta\; \mathbb{E}_{(s, a) \sim \mathcal{D}_E}\big[ -\log \pi_\theta(a \mid s) \big]$$ Apprentissage supervisé des actions de l'expert.
- Erreurs composées : $$\text{clonage : } J(\pi^*) - J(\hat{\pi}) \leq T^2 \varepsilon, \qquad \text{DAgger : } J(\pi^*) - J(\hat{\pi}) \leq T \varepsilon + O(1)$$ Une erreur ε par pas fait dériver hors de la distribution de l'expert ; DAgger relabellise les états visités par l'apprenti.
- GAIL : $$\min_\pi \max_D\; \mathbb{E}_\pi\big[ \log D(s, a) \big] + \mathbb{E}_{\pi_E}\big[ \log\big( 1 - D(s, a) \big) \big] - \lambda\, \mathcal{H}(\pi)$$ Un discriminateur distingue l'apprenti de l'expert et sert de récompense ; imitation par appariement de mesures d'occupation.
- IRL à entropie maximale : $$p_\psi(\tau) \propto \exp\big( r_\psi(\tau) \big), \qquad \nabla_\psi \mathcal{L} = \mathbb{E}_{\tau \sim \mathcal{D}_E}\big[ \nabla_\psi r_\psi(\tau) \big] - \mathbb{E}_{\tau \sim p_\psi}\big[ \nabla_\psi r_\psi(\tau) \big]$$ On ajuste la récompense pour que les trajectoires de l'expert soient les plus probables.
- Conservative Q-learning : $$\min_Q\; \alpha\, \mathbb{E}_{s \sim \mathcal{D}}\Big[ \log \sum_a \exp Q(s, a) - \mathbb{E}_{a \sim \mathcal{D}} Q(s, a) \Big] + \tfrac{1}{2}\, \mathbb{E}_{\mathcal{D}}\Big[ \big( Q - \hat{\mathcal{T}} Q \big)^2 \Big]$$ Abaisse Q sur les actions absentes des données, pour que la politique n'exploite pas des valeurs inventées.
- Implicit Q-learning : $$\mathcal{L}_V = \mathbb{E}_{\mathcal{D}}\big[ L_2^\tau\big( Q(s, a) - V(s) \big) \big], \qquad L_2^\tau(u) = \big| \tau - \mathbf{1}_{u < 0} \big|\, u^2$$ La régression expectile approche un max sur les actions du jeu de données sans jamais évaluer d'action hors distribution.
- Régression pondérée par l'avantage : $$\max_\theta\; \mathbb{E}_{(s, a) \sim \mathcal{D}}\Big[ \log \pi_\theta(a \mid s)\, \exp\big( A(s, a) / \beta \big) \Big]$$ Clonage où les bonnes actions pèsent plus ; extraction de politique de AWR, AWAC et IQL.
- TD3+BC : $$\max_\pi\; \mathbb{E}_{(s, a) \sim \mathcal{D}}\Big[ \lambda\, Q\big( s, \pi(s) \big) - \big( \pi(s) - a \big)^2 \Big], \qquad \lambda = \frac{\alpha}{\frac{1}{N} \sum_i |Q(s_i, a_i)|}$$ Ajoute un terme de clonage à l'acteur de TD3 ; la normalisation rend α indépendant de l'échelle des récompenses.
- Decision Transformer : $$\hat{R}_t = \sum_{t' = t}^{T} r_{t'}, \qquad \tau = \big( \hat{R}_1, s_1, a_1, \hat{R}_2, s_2, a_2, \dots \big)$$ Le RL devient de la prédiction de séquence : un transformer prédit l'action conditionnée par le retour visé.

### Objectifs, hiérarchie et multi-agent

- Façonnage par potentiel : $$F(s, s') = \gamma\, \Phi(s') - \Phi(s) \;\Rightarrow\; \tilde{Q}^*(s, a) = Q^*(s, a) - \Phi(s)$$ Ajouter cette récompense ne change pas la politique optimale ; seule forme de shaping garantie sans effet de bord.
- Hindsight Experience Replay : $$\big( s_t, a_t, s_{t+1}, g \big) \;\to\; \big( s_t, a_t, r(s_t, a_t, g'), s_{t+1}, g' \big), \quad g' = \text{but atteint plus tard}$$ Un échec pour le but g est un succès pour le but effectivement atteint ; rend apprenables les récompenses éparses.
- Bellman des options : $$Q(s, o) = \mathbb{E}\left[ \sum_{k=0}^{\tau - 1} \gamma^k\, r_{t+k+1} + \gamma^\tau \max_{o'} Q(s_{t+\tau}, o') \right]$$ Une option est une macro-action de durée aléatoire τ ; le problème devient un semi-MDP.
- VDN : $$Q_{tot}(\mathbf{s}, \mathbf{a}) = \sum_{i=1}^{n} Q_i(o_i, a_i)$$ Valeur jointe décomposée en somme de valeurs individuelles, pour un apprentissage centralisé et une exécution décentralisée.
- Monotonie de QMIX : $$\frac{\partial Q_{tot}}{\partial Q_i} \geq 0 \;\; \forall i \;\Rightarrow\; \arg\max_{\mathbf{a}} Q_{tot} = \Big( \arg\max_{a_1} Q_1, \dots, \arg\max_{a_n} Q_n \Big)$$ Un réseau de mélange à poids positifs généralise VDN tout en gardant l'argmax décentralisable.

### Sûreté et sim-to-real

- MDP contraint : $$\max_\pi\; J_R(\pi) \;\;\text{s.c.}\;\; J_C(\pi) = \mathbb{E}_\pi\left[ \sum_t \gamma^t\, c(s_t, a_t) \right] \leq d$$ Le coût cumulé, par exemple les collisions, doit rester sous un budget.
- Relaxation lagrangienne : $$\max_\pi \min_{\lambda \geq 0}\; J_R(\pi) - \lambda \big( J_C(\pi) - d \big), \qquad \lambda \leftarrow \big[ \lambda + \eta\, (J_C - d) \big]_+$$ Le multiplicateur augmente tant que la contrainte est violée ; PPO-Lagrangien.
- Randomisation de domaine : $$\max_\theta\; \mathbb{E}_{\xi \sim p(\xi)}\big[ J_\xi(\pi_\theta) \big]$$ On entraîne sur une loi de paramètres physiques ξ (masses, frottements, latences) pour que le réel soit un tirage parmi d'autres.
- MDP robuste : $$\max_\pi \min_{P \in \mathcal{U}}\; J_P(\pi)$$ Optimise le pire cas sur un ensemble d'incertitude de dynamiques ; plus conservateur que la randomisation.
- Acteur-critique asymétrique : $$\pi_\theta(a \mid o_{1:t}), \qquad Q_\phi(s, a) \text{ avec état privilégié}$$ Le critique, utilisé seulement en simulation, voit l'état complet ; l'acteur déployé ne voit que les observations.
- Distillation professeur-élève : $$\min_\theta\; \mathbb{E}_{s \sim d^{\pi_\theta}}\Big[ \big\| \pi_\theta(o_{t-k:t}) - \pi_{teacher}(s_t) \big\|^2 \Big]$$ Un professeur entraîné avec l'information privilégiée est imité par un élève qui n'a que les capteurs réels, à la manière de DAgger.

### RL pour les LLM

- Modèle de récompense de Bradley-Terry : $$\mathcal{L}_r = -\mathbb{E}_{(x, y_w, y_l)}\Big[ \log \sigma\big( r_\phi(x, y_w) - r_\phi(x, y_l) \big) \Big]$$ La récompense est apprise à partir de comparaisons humaines par paires.
- Objectif RLHF : $$\max_{\pi_\theta}\; \mathbb{E}_{x,\, y \sim \pi_\theta}\big[ r_\phi(x, y) \big] - \beta\, D_{\mathrm{KL}}\big( \pi_\theta(y \mid x) \,\|\, \pi_{ref}(y \mid x) \big)$$ La KL empêche le modèle de s'éloigner du modèle de référence pour exploiter les failles de la récompense.
- Politique optimale du RLHF : $$\pi^*(y \mid x) = \frac{1}{Z(x)}\, \pi_{ref}(y \mid x)\, \exp\!\left( \frac{r(x, y)}{\beta} \right)$$ Solution analytique de l'objectif régularisé ; c'est elle qui permet de dériver DPO.
- Perte DPO : $$\mathcal{L}_{DPO} = -\mathbb{E}\left[ \log \sigma\!\left( \beta \log \frac{\pi_\theta(y_w \mid x)}{\pi_{ref}(y_w \mid x)} - \beta \log \frac{\pi_\theta(y_l \mid x)}{\pi_{ref}(y_l \mid x)} \right) \right]$$ La récompense implicite est le log-ratio des politiques ; plus de modèle de récompense ni de rollouts.
- Avantage de GRPO : $$\hat{A}_i = \frac{r_i - \operatorname{moy}(r_1, \dots, r_G)}{\operatorname{std}(r_1, \dots, r_G)}$$ Pour G réponses à une même question, l'avantage est relatif au groupe ; plus besoin de critique.
- Objectif GRPO : $$J(\theta) = \mathbb{E}\left[ \frac{1}{G} \sum_{i=1}^{G} \frac{1}{|o_i|} \sum_{t=1}^{|o_i|} \min\big( \rho_{i,t}\, \hat{A}_i,\; \operatorname{clip}(\rho_{i,t}, 1 - \epsilon, 1 + \epsilon)\, \hat{A}_i \big) - \beta\, D_{\mathrm{KL}}\big( \pi_\theta \,\|\, \pi_{ref} \big) \right]$$ PPO clippé par jeton avec l'avantage du groupe ; utilisé avec des récompenses vérifiables pour le raisonnement.
- Estimateur k3 de la KL : $$D_{\mathrm{KL}}(\pi_\theta \,\|\, \pi_{ref}) \approx \frac{\pi_{ref}(y \mid x)}{\pi_\theta(y \mid x)} - \log \frac{\pi_{ref}(y \mid x)}{\pi_\theta(y \mid x)} - 1$$ Estimateur sans biais et toujours positif à partir d'un seul échantillon de π_θ.
