## Équations clés en IA et en contrôle

### Probabilités et information

- Règle de Bayes : $$p(\theta \mid \mathcal{D}) = \frac{p(\mathcal{D} \mid \theta)\, p(\theta)}{p(\mathcal{D})}$$
- Densité gaussienne multivariée : $$\mathcal{N}(x;\, \mu, \Sigma) = \frac{1}{(2\pi)^{n/2} |\Sigma|^{1/2}} \exp\!\left(-\tfrac{1}{2}(x-\mu)^\top \Sigma^{-1} (x-\mu)\right)$$
- Entropie de Shannon : $$H(p) = -\sum_i p_i \log p_i$$
- Divergence de Kullback-Leibler : $$D_{\mathrm{KL}}(p \,\|\, q) = \sum_i p_i \log \frac{p_i}{q_i}$$
- KL d'une gaussienne diagonale vers $\mathcal{N}(0, I)$ : $$D_{\mathrm{KL}} = \frac{1}{2} \sum_j \left(\mu_j^2 + \sigma_j^2 - \log \sigma_j^2 - 1\right)$$

### Filtre de Kalman

- Prédiction de l'état : $$\hat{x}_{k|k-1} = F_k\, \hat{x}_{k-1|k-1} + B_k\, u_k$$
- Prédiction de la covariance : $$P_{k|k-1} = F_k\, P_{k-1|k-1}\, F_k^\top + Q_k$$
- Innovation : $$y_k = z_k - H_k\, \hat{x}_{k|k-1}$$
- Covariance de l'innovation : $$S_k = H_k\, P_{k|k-1}\, H_k^\top + R_k$$
- Gain de Kalman : $$K_k = P_{k|k-1}\, H_k^\top\, S_k^{-1}$$
- Mise à jour de l'état : $$\hat{x}_{k|k} = \hat{x}_{k|k-1} + K_k\, y_k$$
- Mise à jour de la covariance : $$P_{k|k} = (I - K_k H_k)\, P_{k|k-1}$$
- Forme de Joseph, numériquement plus stable : $$P_{k|k} = (I - K_k H_k)\, P_{k|k-1}\, (I - K_k H_k)^\top + K_k R_k K_k^\top$$
- Filtre de Kalman étendu, jacobiens de la dynamique et de l'observation : $$F_k = \left.\frac{\partial f}{\partial x}\right|_{\hat{x}_{k-1|k-1},\, u_k} \qquad H_k = \left.\frac{\partial h}{\partial x}\right|_{\hat{x}_{k|k-1}}$$

### Guidage et interception

- Position et vitesse relatives de la cible : $$\mathbf{r} = \mathbf{p}_T - \mathbf{p}_M \qquad \mathbf{v} = \mathbf{v}_T - \mathbf{v}_M$$
- Vitesse de rapprochement : $$V_c = -\dot{R} = -\frac{\mathbf{r}^\top \mathbf{v}}{\|\mathbf{r}\|}$$
- Vitesse de rotation de la ligne de visée : $$\mathbf{\Omega} = \frac{\mathbf{r} \times \mathbf{v}}{\|\mathbf{r}\|^2}$$
- Navigation proportionnelle, forme scalaire : $$a_c = N\, V_c\, \dot{\lambda} \qquad N \in [3, 5]$$
- Navigation proportionnelle vraie, forme vectorielle : $$\mathbf{a}_c = N\, V_c\, \mathbf{\Omega} \times \frac{\mathbf{r}}{\|\mathbf{r}\|}$$
- Navigation proportionnelle augmentée, compensation de l'accélération cible : $$a_c = N\, V_c\, \dot{\lambda} + \frac{N}{2}\, a_{T\perp}$$
- Temps avant impact : $$t_{go} = \frac{R}{V_c}$$
- Distance de passage prédite (zero-effort miss) : $$\mathbf{ZEM} = \mathbf{r} + \mathbf{v}\, t_{go} \qquad \mathbf{a}_c = \frac{N}{t_{go}^2}\, \mathbf{ZEM}_\perp$$

### Systèmes linéaires et commande

- Représentation d'état : $$\dot{x} = A x + B u \qquad y = C x + D u$$
- Discrétisation exacte avec bloqueur d'ordre zéro : $$A_d = e^{A T_s} \qquad B_d = \int_0^{T_s} e^{A \tau}\, d\tau\; B$$
- Correcteur PID : $$u(t) = K_p\, e(t) + K_i \int_0^t e(\tau)\, d\tau + K_d\, \frac{de}{dt}$$
- Critère de commandabilité de Kalman : $$\operatorname{rang}\begin{bmatrix} B & AB & \cdots & A^{n-1}B \end{bmatrix} = n$$
- Critère d'observabilité : $$\operatorname{rang}\begin{bmatrix} C \\ CA \\ \vdots \\ CA^{n-1} \end{bmatrix} = n$$
- Coût LQR : $$J = \int_0^\infty \left(x^\top Q x + u^\top R u\right) dt$$
- Équation de Riccati algébrique continue : $$A^\top P + P A - P B R^{-1} B^\top P + Q = 0$$
- Gain LQR : $$u = -K x \qquad K = R^{-1} B^\top P$$
- Riccati discrète : $$P = A^\top P A - A^\top P B \left(R + B^\top P B\right)^{-1} B^\top P A + Q$$
- Commande prédictive (MPC) : $$\min_{u_0, \dots, u_{N-1}} \sum_{k=0}^{N-1} \left(x_k^\top Q x_k + u_k^\top R u_k\right) + x_N^\top P_f\, x_N \quad \text{s.c.} \quad x_{k+1} = A x_k + B u_k,\; x_k \in \mathcal{X},\; u_k \in \mathcal{U}$$

### Stabilité et sûreté

- Fonction de Lyapunov, stabilité asymptotique : $$V(0) = 0, \quad V(x) > 0 \;\text{ et }\; \dot{V}(x) = \nabla V(x)^\top f(x) < 0 \quad \forall x \neq 0$$
- Équation de Lyapunov pour un système linéaire : $$A^\top P + P A = -Q, \qquad Q \succ 0 \;\Rightarrow\; P \succ 0$$
- Fonction barrière de contrôle, invariance de l'ensemble sûr $\{x : h(x) \geq 0\}$ : $$\sup_u \left[\nabla h(x)^\top \left(f(x) + g(x)\, u\right)\right] \geq -\alpha\big(h(x)\big)$$

### Méthodes ensemblistes

- Zonotope : $$\mathcal{Z} = \langle c, G \rangle = \left\{ c + G \xi \;:\; \|\xi\|_\infty \leq 1 \right\}$$
- Image par une application linéaire : $$M \mathcal{Z} = \langle M c,\; M G \rangle$$
- Somme de Minkowski : $$\mathcal{Z}_1 \oplus \mathcal{Z}_2 = \left\langle c_1 + c_2,\; \begin{bmatrix} G_1 & G_2 \end{bmatrix} \right\rangle$$
- Propagation d'un ensemble par une dynamique linéaire discrète : $$\mathcal{X}_{k+1} = A\, \mathcal{X}_k \oplus B\, \mathcal{U}_k \oplus \mathcal{W}$$
- Boîte englobante d'un zonotope : $$\left[\, c - |G|\, \mathbf{1},\; c + |G|\, \mathbf{1} \,\right]$$

### Attitude et dynamique du drone

- Formule de Rodrigues, rotation d'angle $\theta$ autour de l'axe unitaire $k$ : $$R = I + \sin\theta\, [k]_\times + (1 - \cos\theta)\, [k]_\times^2$$
- Rotation d'un vecteur par un quaternion unitaire : $$\begin{bmatrix} 0 \\ v' \end{bmatrix} = q \otimes \begin{bmatrix} 0 \\ v \end{bmatrix} \otimes q^{*}$$
- Cinématique du quaternion, vitesse angulaire en repère corps : $$\dot{q} = \frac{1}{2}\, q \otimes \begin{bmatrix} 0 \\ \omega \end{bmatrix}$$
- Équation d'Euler du solide en rotation : $$J \dot{\omega} + \omega \times J \omega = \tau$$
- Translation d'un multirotor, axe $z$ vers le haut : $$m \dot{\mathbf{v}} = -m g\, \mathbf{e}_3 + T\, R\, \mathbf{e}_3$$
- Dérivée dans un repère tournant : $$\left.\frac{d\mathbf{r}}{dt}\right|_{I} = \left.\frac{d\mathbf{r}}{dt}\right|_{B} + \omega \times \mathbf{r}$$

### Réseaux de neurones

- Couche dense : $$y = \sigma(W x + b)$$
- Softmax : $$\operatorname{softmax}(z)_i = \frac{e^{z_i}}{\sum_j e^{z_j}}$$
- Entropie croisée : $$\mathcal{L} = -\sum_i y_i \log \hat{y}_i$$
- Rétropropagation, erreur de la couche $l$ : $$\delta_l = \left(W_{l+1}^\top \delta_{l+1}\right) \odot \sigma'(z_l) \qquad \frac{\partial \mathcal{L}}{\partial W_l} = \delta_l\, a_{l-1}^\top$$
- Bloc résiduel : $$y = x + F(x)$$
- Normalisation par couche : $$y = \gamma \odot \frac{x - \mu}{\sqrt{\sigma^2 + \epsilon}} + \beta$$
- GELU : $$\operatorname{GELU}(x) = x\, \Phi(x)$$
- Attention : $$\operatorname{Attention}(Q, K, V) = \operatorname{softmax}\!\left(\frac{Q K^\top}{\sqrt{d_k}}\right) V$$
- Attention multi-têtes : $$\operatorname{MultiHead}(Q, K, V) = \operatorname{Concat}(\text{head}_1, \dots, \text{head}_h)\, W^O \qquad \text{head}_i = \operatorname{Attention}(Q W_i^Q, K W_i^K, V W_i^V)$$
- Encodage positionnel sinusoïdal : $$PE_{(pos,\, 2i)} = \sin\!\left(\frac{pos}{10000^{2i/d}}\right) \qquad PE_{(pos,\, 2i+1)} = \cos\!\left(\frac{pos}{10000^{2i/d}}\right)$$

### Optimiseurs

- Descente de gradient stochastique avec moment : $$v_t = \beta\, v_{t-1} + g_t \qquad \theta_t = \theta_{t-1} - \eta\, v_t$$
- Adam, moments d'ordre 1 et 2 : $$m_t = \beta_1 m_{t-1} + (1 - \beta_1)\, g_t \qquad v_t = \beta_2 v_{t-1} + (1 - \beta_2)\, g_t^2$$
- Adam, correction du biais : $$\hat{m}_t = \frac{m_t}{1 - \beta_1^t} \qquad \hat{v}_t = \frac{v_t}{1 - \beta_2^t}$$
- Adam, mise à jour : $$\theta_t = \theta_{t-1} - \eta\, \frac{\hat{m}_t}{\sqrt{\hat{v}_t} + \epsilon}$$
- AdamW, décroissance des poids découplée : $$\theta_t = \theta_{t-1} - \eta \left(\frac{\hat{m}_t}{\sqrt{\hat{v}_t} + \epsilon} + \lambda\, \theta_{t-1}\right)$$

### Apprentissage par renforcement

- Retour actualisé : $$G_t = \sum_{k=0}^{\infty} \gamma^k\, r_{t+k+1}$$
- Équation de Bellman pour $V^\pi$ : $$V^\pi(s) = \sum_a \pi(a \mid s) \sum_{s',\, r} p(s', r \mid s, a) \left[ r + \gamma V^\pi(s') \right]$$
- Équation d'optimalité de Bellman : $$Q^*(s, a) = \mathbb{E}\left[ r + \gamma \max_{a'} Q^*(s', a') \right]$$
- Avantage : $$A^\pi(s, a) = Q^\pi(s, a) - V^\pi(s)$$
- Erreur de différence temporelle : $$\delta_t = r_t + \gamma V(s_{t+1}) - V(s_t)$$
- Q-learning : $$Q(s, a) \leftarrow Q(s, a) + \alpha \left[ r + \gamma \max_{a'} Q(s', a') - Q(s, a) \right]$$
- Perte DQN avec réseau cible : $$\mathcal{L}(\theta) = \mathbb{E}\left[ \left( r + \gamma \max_{a'} Q_{\theta^-}(s', a') - Q_\theta(s, a) \right)^2 \right]$$
- Théorème du gradient de politique : $$\nabla_\theta J(\theta) = \mathbb{E}_{\pi_\theta}\left[ \nabla_\theta \log \pi_\theta(a \mid s)\, A^{\pi}(s, a) \right]$$
- Estimateur d'avantage généralisé (GAE) : $$\hat{A}_t = \sum_{l=0}^{\infty} (\gamma \lambda)^l\, \delta_{t+l}$$
- TRPO : $$\max_\theta\; \mathbb{E}_t\left[ \frac{\pi_\theta(a_t \mid s_t)}{\pi_{\theta_{old}}(a_t \mid s_t)}\, \hat{A}_t \right] \quad \text{s.c.} \quad \mathbb{E}_t\left[ D_{\mathrm{KL}}\big(\pi_{\theta_{old}}(\cdot \mid s_t) \,\|\, \pi_\theta(\cdot \mid s_t)\big) \right] \leq \delta$$
- Ratio de probabilité PPO : $$r_t(\theta) = \frac{\pi_\theta(a_t \mid s_t)}{\pi_{\theta_{old}}(a_t \mid s_t)}$$
- Objectif PPO clippé : $$L^{CLIP}(\theta) = \mathbb{E}_t\left[ \min\!\left( r_t(\theta)\, \hat{A}_t,\; \operatorname{clip}\big(r_t(\theta), 1 - \epsilon, 1 + \epsilon\big)\, \hat{A}_t \right) \right]$$
- Objectif PPO complet, à maximiser : $$L(\theta) = \mathbb{E}_t\left[ L^{CLIP}_t(\theta) - c_1 \big(V_\theta(s_t) - V_t^{targ}\big)^2 + c_2\, \mathcal{H}\big[\pi_\theta(\cdot \mid s_t)\big] \right]$$
- Gradient de l'acteur DDPG : $$\nabla_\theta J \approx \mathbb{E}\left[ \nabla_a Q(s, a)\big|_{a = \mu_\theta(s)}\, \nabla_\theta \mu_\theta(s) \right]$$
- Objectif SAC, entropie maximale : $$J(\pi) = \sum_t \mathbb{E}\left[ r(s_t, a_t) + \alpha\, \mathcal{H}\big(\pi(\cdot \mid s_t)\big) \right]$$
- Cible du critique SAC, double Q : $$y = r + \gamma \left( \min_{j=1,2} Q_{\bar{\phi}_j}(s', \tilde{a}') - \alpha \log \pi(\tilde{a}' \mid s') \right), \qquad \tilde{a}' \sim \pi(\cdot \mid s')$$

### Modèles génératifs

- Borne inférieure variationnelle (ELBO) : $$\log p(x) \geq \mathbb{E}_{q(z \mid x)}\left[ \log p(x \mid z) \right] - D_{\mathrm{KL}}\big(q(z \mid x) \,\|\, p(z)\big)$$
- Astuce de reparamétrisation : $$z = \mu + \sigma \odot \varepsilon, \qquad \varepsilon \sim \mathcal{N}(0, I)$$
- Objectif GAN : $$\min_G \max_D\; \mathbb{E}_{x}\left[ \log D(x) \right] + \mathbb{E}_{z}\left[ \log\big(1 - D(G(z))\big) \right]$$
- Diffusion, bruitage direct : $$q(x_t \mid x_0) = \mathcal{N}\!\left(x_t;\, \sqrt{\bar{\alpha}_t}\, x_0,\, (1 - \bar{\alpha}_t) I\right), \qquad \bar{\alpha}_t = \prod_{s=1}^{t} (1 - \beta_s)$$
- Perte de débruitage DDPM : $$\mathcal{L} = \mathbb{E}_{t, x_0, \varepsilon}\left[ \left\| \varepsilon - \varepsilon_\theta\!\left( \sqrt{\bar{\alpha}_t}\, x_0 + \sqrt{1 - \bar{\alpha}_t}\, \varepsilon,\; t \right) \right\|^2 \right]$$

### Auto-supervisé et world models

- Perte contrastive InfoNCE : $$\mathcal{L} = -\log \frac{\exp\big(\operatorname{sim}(z, z^+) / \tau\big)}{\sum_j \exp\big(\operatorname{sim}(z, z_j) / \tau\big)}$$
- JEPA, prédiction dans l'espace latent avec encodeur cible figé : $$\mathcal{L} = \left\| g_\phi\big(f_\theta(x),\, z\big) - \operatorname{sg}\big(f_{\bar{\theta}}(y)\big) \right\|_2^2$$
- Mise à jour par moyenne mobile exponentielle de l'encodeur cible : $$\bar{\theta} \leftarrow \tau\, \bar{\theta} + (1 - \tau)\, \theta$$
- Modèle RSSM de Dreamer : $$h_t = f_\phi(h_{t-1}, z_{t-1}, a_{t-1}) \qquad z_t \sim q_\phi(z_t \mid h_t, x_t) \qquad \hat{z}_t \sim p_\phi(\hat{z}_t \mid h_t)$$

### Alignement des LLM

- Objectif RLHF avec pénalité KL : $$\max_{\pi_\theta}\; \mathbb{E}_{x,\, y \sim \pi_\theta}\left[ r_\phi(x, y) \right] - \beta\, D_{\mathrm{KL}}\big(\pi_\theta(y \mid x) \,\|\, \pi_{ref}(y \mid x)\big)$$
- Perte DPO : $$\mathcal{L}_{DPO} = -\mathbb{E}\left[ \log \sigma\!\left( \beta \log \frac{\pi_\theta(y_w \mid x)}{\pi_{ref}(y_w \mid x)} - \beta \log \frac{\pi_\theta(y_l \mid x)}{\pi_{ref}(y_l \mid x)} \right) \right]$$
- Loi d'échelle de Chinchilla : $$L(N, D) = E + \frac{A}{N^\alpha} + \frac{B}{D^\beta}$$
