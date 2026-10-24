## Équations fondamentales de la physique

### Mécanique classique

- Deuxième loi de Newton : $$\vec{F} = \frac{d\vec{p}}{dt} = m\, \vec{a}$$ La somme des forces appliquées à un corps fait varier sa quantité de mouvement ; à masse constante, elle produit une accélération proportionnelle.
- Troisième loi de Newton : $$\vec{F}_{A \to B} = -\vec{F}_{B \to A}$$ Deux corps en interaction exercent l'un sur l'autre des forces opposées et de même intensité.
- Théorème de l'énergie cinétique : $$\Delta\!\left(\tfrac{1}{2} m v^2\right) = \sum W(\vec{F})$$ La variation d'énergie cinétique d'un corps est égale au travail des forces qu'il subit.
- Théorème du moment cinétique : $$\frac{d\vec{L}}{dt} = \vec{\tau} \qquad \vec{L} = \vec{r} \times \vec{p}$$ Un couple fait varier le moment cinétique ; sans couple, il se conserve, ce qui explique la loi des aires et la stabilité d'une toupie.
- Oscillateur harmonique : $$\ddot{x} + \omega_0^2\, x = 0 \qquad \omega_0 = \sqrt{k / m}$$ Mouvement d'un système rappelé vers l'équilibre par une force proportionnelle à l'écart ; modèle de toute petite oscillation.
- Principe de moindre action : $$S = \int_{t_1}^{t_2} L(q, \dot{q}, t)\, dt \qquad \delta S = 0 \qquad L = T - V$$ Parmi tous les chemins possibles, le système suit celui qui rend l'action stationnaire.
- Équations d'Euler-Lagrange : $$\frac{d}{dt} \frac{\partial L}{\partial \dot{q}_i} - \frac{\partial L}{\partial q_i} = 0$$ Équations du mouvement déduites du principe de moindre action, valables dans n'importe quel système de coordonnées.
- Équations de Hamilton : $$\dot{q}_i = \frac{\partial H}{\partial p_i} \qquad \dot{p}_i = -\frac{\partial H}{\partial q_i}$$ Reformulation de la mécanique dans l'espace des phases, où H est en général l'énergie totale ; point de départ de la physique statistique et de la mécanique quantique.
- Théorème de Noether, coordonnée cyclique : $$\frac{\partial L}{\partial q} = 0 \;\Rightarrow\; p = \frac{\partial L}{\partial \dot{q}} = \text{cste}$$ À chaque symétrie continue correspond une quantité conservée : le temps donne l'énergie, la translation la quantité de mouvement, la rotation le moment cinétique.

### Gravitation

- Gravitation universelle de Newton : $$\vec{F} = -G\, \frac{m_1 m_2}{r^2}\, \vec{u}_r$$ Deux masses s'attirent avec une force proportionnelle au produit des masses et inversement proportionnelle au carré de leur distance.
- Équation de Poisson gravitationnelle : $$\nabla^2 \Phi = 4 \pi G \rho \qquad \vec{g} = -\nabla \Phi$$ Le potentiel gravitationnel est créé par la densité de masse ; c'est la forme locale de la loi de Newton.
- Troisième loi de Kepler : $$\frac{T^2}{a^3} = \frac{4 \pi^2}{G M}$$ Le carré de la période orbitale est proportionnel au cube du demi-grand axe ; elle permet de peser un astre à partir de ses satellites.
- Vitesse de libération : $$v_l = \sqrt{\frac{2 G M}{r}}$$ Vitesse minimale pour échapper à l'attraction d'un astre sans propulsion ; 11,2 km/s depuis la surface de la Terre.
- Équations d'Einstein : $$G_{\mu\nu} + \Lambda\, g_{\mu\nu} = \frac{8 \pi G}{c^4}\, T_{\mu\nu}$$ La matière et l'énergie courbent l'espace-temps, et cette courbure dicte leur mouvement ; Λ est la constante cosmologique.
- Équation des géodésiques : $$\frac{d^2 x^\mu}{d\tau^2} + \Gamma^\mu_{\alpha\beta}\, \frac{dx^\alpha}{d\tau} \frac{dx^\beta}{d\tau} = 0$$ Un corps en chute libre suit la trajectoire la plus droite possible dans l'espace-temps courbé ; la gravité n'y est plus une force.
- Rayon de Schwarzschild : $$r_s = \frac{2 G M}{c^2}$$ Rayon en dessous duquel une masse devient un trou noir ; environ 9 mm pour la Terre et 3 km pour le Soleil.

### Relativité restreinte

- Facteur de Lorentz : $$\gamma = \frac{1}{\sqrt{1 - v^2 / c^2}}$$ Mesure l'écart à la mécanique classique ; il vaut 1 au repos et tend vers l'infini quand v approche c.
- Transformation de Lorentz : $$x' = \gamma\, (x - v t) \qquad t' = \gamma \left(t - \frac{v x}{c^2}\right)$$ Passage d'un référentiel inertiel à un autre qui conserve la vitesse de la lumière pour tous les observateurs.
- Dilatation du temps : $$\Delta t = \gamma\, \Delta \tau$$ Une horloge en mouvement bat plus lentement que l'horloge au repos ; l'effet est corrigé en permanence dans les satellites GPS.
- Contraction des longueurs : $$L = \frac{L_0}{\gamma}$$ Un objet en mouvement est plus court dans la direction de son déplacement.
- Équivalence masse-énergie : $$E = m c^2$$ Une masse au repos contient une énergie considérable ; c'est la source de l'énergie nucléaire.
- Relation énergie-impulsion : $$E^2 = (p c)^2 + (m c^2)^2$$ Généralise E = mc² aux particules en mouvement ; pour un photon, de masse nulle, E = pc.

### Électromagnétisme

- Loi de Coulomb : $$\vec{F} = \frac{1}{4 \pi \varepsilon_0}\, \frac{q_1 q_2}{r^2}\, \vec{u}_r$$ Deux charges s'attirent ou se repoussent selon leurs signes, avec la même loi en 1/r² que la gravitation.
- Force de Lorentz : $$\vec{F} = q \left(\vec{E} + \vec{v} \times \vec{B}\right)$$ Force subie par une charge en mouvement ; la partie magnétique, perpendiculaire à la vitesse, courbe la trajectoire sans changer l'énergie.
- Maxwell-Gauss : $$\nabla \cdot \vec{E} = \frac{\rho}{\varepsilon_0}$$ Les charges électriques sont les sources du champ électrique.
- Maxwell-Thomson, conservation du flux magnétique : $$\nabla \cdot \vec{B} = 0$$ Il n'existe pas de charge magnétique isolée : les lignes de champ magnétique se referment sur elles-mêmes.
- Maxwell-Faraday : $$\nabla \times \vec{E} = -\frac{\partial \vec{B}}{\partial t}$$ Un champ magnétique variable crée un champ électrique ; c'est le principe des alternateurs et des transformateurs.
- Maxwell-Ampère : $$\nabla \times \vec{B} = \mu_0\, \vec{j} + \mu_0 \varepsilon_0\, \frac{\partial \vec{E}}{\partial t}$$ Les courants et les champs électriques variables créent un champ magnétique.
- Conservation de la charge : $$\frac{\partial \rho}{\partial t} + \nabla \cdot \vec{j} = 0$$ La charge ne se crée ni ne se détruit ; elle ne fait que se déplacer sous forme de courant.
- Équation d'onde électromagnétique : $$\nabla^2 \vec{E} = \frac{1}{c^2}\, \frac{\partial^2 \vec{E}}{\partial t^2} \qquad c = \frac{1}{\sqrt{\mu_0 \varepsilon_0}}$$ Déduite des équations de Maxwell dans le vide, elle montre que la lumière est une onde électromagnétique qui se propage à la vitesse c.
- Vecteur de Poynting : $$\vec{\Pi} = \frac{\vec{E} \times \vec{B}}{\mu_0}$$ Puissance transportée par une onde électromagnétique par unité de surface, en W/m².
- Loi d'Ohm : $$\vec{j} = \sigma\, \vec{E} \qquad U = R\, I$$ Dans un conducteur, le courant est proportionnel au champ électrique qui le met en mouvement.

### Ondes et optique

- Équation de d'Alembert : $$\frac{\partial^2 u}{\partial t^2} = c^2\, \nabla^2 u$$ Propagation d'une perturbation à la vitesse c sans déformation ; elle décrit le son, les cordes vibrantes et la lumière.
- Loi de Snell-Descartes : $$n_1 \sin \theta_1 = n_2 \sin \theta_2$$ Un rayon lumineux change de direction en passant d'un milieu à un autre ; elle explique les lentilles et la réflexion totale.
- Effet Doppler : $$f' = f\, \frac{c + v_r}{c - v_s}$$ La fréquence perçue augmente quand la source et le récepteur se rapprochent ; utilisé par les radars et en astronomie.

### Mécanique des fluides

- Équation de continuité : $$\frac{\partial \rho}{\partial t} + \nabla \cdot (\rho\, \vec{v}) = 0$$ La masse du fluide se conserve : ce qui entre dans un volume et n'en sort pas s'y accumule.
- Équations de Navier-Stokes, fluide incompressible : $$\rho \left(\frac{\partial \vec{v}}{\partial t} + (\vec{v} \cdot \nabla)\, \vec{v}\right) = -\nabla p + \mu\, \nabla^2 \vec{v} + \rho\, \vec{g}$$ Deuxième loi de Newton appliquée à une particule de fluide visqueux ; l'existence de solutions régulières en 3D est un des problèmes du prix du millénaire.
- Relation de Bernoulli : $$p + \tfrac{1}{2} \rho v^2 + \rho g z = \text{cste}$$ Le long d'une ligne de courant d'un fluide parfait, la pression baisse quand la vitesse augmente.
- Poussée d'Archimède : $$\vec{F}_A = -\rho_f\, V\, \vec{g}$$ Un corps immergé subit une poussée verticale égale au poids du fluide qu'il déplace.

### Thermodynamique

- Loi des gaz parfaits : $$p V = n R T$$ Relie pression, volume et température d'un gaz dilué, dont les molécules sont vues comme des points sans interaction.
- Premier principe : $$\Delta U = W + Q$$ L'énergie se conserve : la variation d'énergie interne est égale au travail et à la chaleur reçus.
- Deuxième principe : $$dS = \frac{\delta Q}{T_{ext}} + \delta S_c \qquad \delta S_c \geq 0$$ L'entropie d'un système isolé ne peut que croître ; elle fixe le sens des transformations et la flèche du temps.
- Troisième principe : $$\lim_{T \to 0} S = 0$$ L'entropie d'un cristal parfait s'annule au zéro absolu, qu'on ne peut pas atteindre en un nombre fini d'étapes.
- Identité thermodynamique : $$dU = T\, dS - p\, dV$$ Combine les deux premiers principes pour une transformation réversible ; point de départ des relations entre grandeurs d'état.
- Enthalpie libre : $$G = H - T S \qquad H = U + p V$$ À température et pression fixées, un système évolue vers le minimum de G ; c'est le critère de spontanéité des réactions chimiques.
- Rendement de Carnot : $$\eta_{max} = 1 - \frac{T_f}{T_c}$$ Rendement maximal d'un moteur thermique fonctionnant entre une source froide et une source chaude ; aucun moteur réel ne peut le dépasser.
- Loi de Fourier : $$\vec{q} = -\lambda\, \nabla T$$ La chaleur s'écoule du chaud vers le froid, avec un flux proportionnel au gradient de température.
- Équation de la chaleur : $$\frac{\partial T}{\partial t} = D\, \nabla^2 T$$ La température diffuse dans un milieu en lissant ses écarts ; même forme que la diffusion de particules.

### Physique statistique et rayonnement

- Formule de Boltzmann : $$S = k_B \ln \Omega$$ L'entropie compte le nombre de micro-états compatibles avec l'état macroscopique ; elle est gravée sur la tombe de Boltzmann.
- Distribution de Boltzmann : $$p_i = \frac{e^{-E_i / k_B T}}{Z} \qquad Z = \sum_j e^{-E_j / k_B T}$$ À l'équilibre thermique, la probabilité d'un état décroît exponentiellement avec son énergie ; la fonction de partition Z contient toute la thermodynamique du système.
- Théorème d'équipartition : $$\langle E \rangle = \frac{f}{2}\, k_B T$$ Chaque degré de liberté quadratique reçoit en moyenne ½ k_B T ; un gaz monoatomique, avec f = 3, a une énergie de 3/2 k_B T par atome.
- Loi de Planck : $$B_\nu(T) = \frac{2 h \nu^3}{c^2}\, \frac{1}{e^{h \nu / k_B T} - 1}$$ Spectre de la lumière émise par un corps noir à la température T ; son explication a fait naître la mécanique quantique.
- Loi de Stefan-Boltzmann : $$P = \sigma\, T^4$$ Puissance rayonnée par unité de surface d'un corps noir ; doubler la température multiplie le rayonnement par 16.
- Loi de Wien : $$\lambda_{max}\, T \approx 2{,}898 \times 10^{-3}\ \text{m} \cdot \text{K}$$ Plus un corps est chaud, plus son pic d'émission est à courte longueur d'onde : vers 500 nm pour le Soleil, vers 10 µm pour le corps humain.

### Mécanique quantique

- Relation de Planck-Einstein : $$E = h \nu = \hbar\, \omega$$ La lumière échange son énergie par paquets, les photons, d'énergie proportionnelle à la fréquence.
- Effet photoélectrique : $$E_c = h \nu - W$$ Un photon n'arrache un électron à un métal que si son énergie dépasse le travail de sortie W, quelle que soit l'intensité lumineuse.
- Relation de de Broglie : $$\lambda = \frac{h}{p}$$ Toute particule matérielle se comporte aussi comme une onde ; c'est le principe du microscope électronique.
- Équation de Schrödinger : $$i \hbar\, \frac{\partial \psi}{\partial t} = \hat{H} \psi \qquad \hat{H} = -\frac{\hbar^2}{2 m} \nabla^2 + V$$ Décrit l'évolution dans le temps de la fonction d'onde d'un système quantique non relativiste.
- Équation de Schrödinger stationnaire : $$\hat{H} \psi = E\, \psi$$ Les états d'énergie bien définie sont les vecteurs propres du hamiltonien ; leur spectre discret explique les niveaux d'énergie des atomes.
- Règle de Born : $$dP = |\psi(x)|^2\, dx$$ Le carré du module de la fonction d'onde donne la densité de probabilité de trouver la particule en x.
- Commutateur canonique : $$[\hat{x}, \hat{p}] = \hat{x} \hat{p} - \hat{p} \hat{x} = i \hbar$$ Position et impulsion sont des opérateurs qui ne commutent pas ; c'est l'origine du principe d'incertitude.
- Principe d'incertitude de Heisenberg : $$\Delta x\, \Delta p \geq \frac{\hbar}{2}$$ La position et l'impulsion d'une particule ne peuvent pas être connues simultanément avec une précision arbitraire.
- Niveaux d'énergie de l'hydrogène : $$E_n = -\frac{13{,}6\ \text{eV}}{n^2}$$ Énergies permises de l'électron de l'atome d'hydrogène ; les sauts entre niveaux produisent les raies spectrales.
- Équation de Dirac : $$\left(i \hbar\, \gamma^\mu \partial_\mu - m c\right) \psi = 0$$ Version relativiste de l'équation de Schrödinger pour l'électron ; elle prédit le spin et l'existence de l'antimatière.

### Physique nucléaire

- Décroissance radioactive : $$N(t) = N_0\, e^{-\lambda t} \qquad t_{1/2} = \frac{\ln 2}{\lambda}$$ Le nombre de noyaux instables décroît exponentiellement ; la demi-vie ne dépend ni de l'âge ni de la quantité de l'échantillon.
- Énergie de liaison du noyau : $$E_l = \left(Z m_p + N m_n - m_{noyau}\right) c^2$$ Un noyau pèse moins que ses nucléons séparés ; ce défaut de masse est l'énergie libérée par la fission et la fusion.
