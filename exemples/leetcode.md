## LeetCode — 100 problèmes classiques et leur méthode de résolution

### Tableaux et hachage

- Two Sum (n° 1, facile) — trouver deux indices dont les valeurs ont pour somme la cible — table de hachage valeur → indice ; pour chaque x, chercher cible − x dans la table avant d'y insérer x. O(n) en temps et en mémoire.
- Contains Duplicate (n° 217, facile) — dire si une valeur apparaît au moins deux fois — ensemble des valeurs déjà vues ; renvoyer vrai dès qu'une valeur y figure déjà. O(n).
- Valid Anagram (n° 242, facile) — dire si deux chaînes sont des anagrammes — compter les lettres de la première, les décompter avec la seconde, vérifier que tous les compteurs sont nuls. O(n).
- Group Anagrams (n° 49, moyen) — regrouper les mots qui sont anagrammes les uns des autres — table de hachage dont la clé est une signature du mot : ses lettres triées, ou le vecteur de ses 26 compteurs. O(n·k log k) ou O(n·k).
- Top K Frequent Elements (n° 347, moyen) — renvoyer les k valeurs les plus fréquentes — compter les fréquences, puis tri par paquets où la case f contient les valeurs de fréquence f ; parcourir les cases de la plus haute à la plus basse. O(n). Variante : tas min de taille k, O(n log k).
- Product of Array Except Self (n° 238, moyen) — pour chaque i, produit de tous les autres éléments, sans division — produits préfixes dans un premier passage, multipliés par les produits suffixes dans un passage en sens inverse. O(n), mémoire O(1) hors sortie.
- Longest Consecutive Sequence (n° 128, moyen) — longueur de la plus longue suite d'entiers consécutifs, en O(n) — mettre les valeurs dans un ensemble ; ne démarrer un comptage qu'à partir d'un x dont x − 1 est absent, puis avancer tant que x + 1 est présent. Chaque valeur est visitée au plus deux fois. O(n).
- Valid Sudoku (n° 36, moyen) — vérifier qu'une grille partiellement remplie respecte les règles — un ensemble par ligne, par colonne et par bloc 3×3, le bloc étant repéré par (i // 3, j // 3). Une seule passe sur les 81 cases.
- Majority Element (n° 169, facile) — trouver la valeur présente plus de n/2 fois — vote de Boyer-Moore : un candidat et un compteur, +1 si la valeur est égale au candidat, −1 sinon, changer de candidat quand le compteur tombe à 0. O(n), mémoire O(1).
- Subarray Sum Equals K (n° 560, moyen) — compter les sous-tableaux de somme k — sommes préfixes : le sous-tableau (i, j] a pour somme Sⱼ − Sᵢ ; table de hachage des effectifs de chaque somme préfixe, et pour chaque Sⱼ ajouter le nombre de Sᵢ égaux à Sⱼ − k. O(n). Les valeurs négatives interdisent la fenêtre glissante.

### Deux pointeurs

- Valid Palindrome (n° 125, facile) — dire si une chaîne est un palindrome en ignorant la casse et les caractères non alphanumériques — un pointeur à chaque extrémité, sauter les caractères ignorés, comparer en minuscules et rapprocher les pointeurs. O(n).
- 3Sum (n° 15, moyen) — trouver tous les triplets distincts de somme nulle — trier, fixer le premier élément i, puis chercher les deux autres par deux pointeurs sur la partie à droite de i ; sauter les doublons pour i et pour les pointeurs. O(n²).
- Container With Most Water (n° 11, moyen) — choisir deux lignes qui forment avec l'axe le récipient de plus grande aire — pointeurs aux deux extrémités ; l'aire est limitée par la ligne la plus basse, donc déplacer ce pointeur-là, car garder la ligne basse en rétrécissant ne peut que réduire l'aire. O(n).
- Trapping Rain Water (n° 42, difficile) — volume d'eau retenu entre des barres de hauteurs données — l'eau au-dessus de la barre i vaut min(maximum à gauche, maximum à droite) − hᵢ ; deux pointeurs avec les maxima courants, avancer le côté dont le maximum est le plus petit car c'est lui qui limite. O(n), mémoire O(1).
- Sort Colors (n° 75, moyen) — trier un tableau de 0, 1 et 2 en une seule passe — drapeau hollandais de Dijkstra : trois pointeurs bas, milieu et haut ; un 0 est échangé vers bas, un 2 vers haut sans avancer milieu, un 1 fait seulement avancer milieu. O(n), mémoire O(1).

### Fenêtre glissante

- Best Time to Buy and Sell Stock (n° 121, facile) — meilleur gain avec un achat suivi d'une vente — parcourir les prix en gardant le minimum vu jusqu'ici ; le gain candidat du jour est prix − minimum. O(n).
- Longest Substring Without Repeating Characters (n° 3, moyen) — plus longue sous-chaîne sans caractère répété — fenêtre [g, d] et table caractère → dernière position ; si le caractère courant est déjà dans la fenêtre, déplacer g juste après sa dernière occurrence. O(n).
- Longest Repeating Character Replacement (n° 424, moyen) — plus longue sous-chaîne rendue uniforme avec au plus k remplacements — la fenêtre est valide tant que longueur − fréquence maximale ≤ k ; l'agrandir à droite, la réduire à gauche quand la condition casse. La fréquence maximale peut rester périmée sans fausser le résultat. O(n).
- Permutation in String (n° 567, moyen) — dire si s2 contient une permutation de s1 — fenêtre de taille fixe |s1| qui glisse sur s2, comparer les compteurs des 26 lettres ; tenir à jour en O(1) le nombre de lettres dont les compteurs coïncident. O(n).
- Minimum Window Substring (n° 76, difficile) — plus petite fenêtre de s contenant toutes les lettres de t avec leurs multiplicités — compteurs des besoins et nombre de lettres satisfaites ; étendre à droite jusqu'à couvrir t, puis réduire à gauche tant que la fenêtre reste valide, en notant le minimum. O(|s| + |t|).
- Sliding Window Maximum (n° 239, difficile) — maximum de chaque fenêtre de taille k — file à double entrée d'indices dont les valeurs décroissent : retirer à l'arrière les valeurs plus petites que la nouvelle, retirer à l'avant l'indice sorti de la fenêtre ; l'avant donne le maximum. O(n).

### Pile

- Valid Parentheses (n° 20, facile) — vérifier qu'une chaîne de parenthèses, crochets et accolades est bien formée — empiler les ouvrantes ; chaque fermante doit correspondre au sommet, qu'on dépile ; la pile doit être vide à la fin. O(n).
- Min Stack (n° 155, moyen) — pile qui donne son minimum en O(1) — empiler avec chaque valeur le minimum courant, dans une seconde pile ou sous forme de paires (valeur, minimum). O(1) par opération.
- Evaluate Reverse Polish Notation (n° 150, moyen) — évaluer une expression en notation polonaise inverse — empiler les nombres ; sur un opérateur, dépiler b puis a et empiler a op b ; la division est tronquée vers zéro. O(n).
- Daily Temperatures (n° 739, moyen) — pour chaque jour, nombre de jours à attendre une température plus haute — pile monotone d'indices aux températures décroissantes ; un jour plus chaud dépile et résout tous les jours plus froids en attente. O(n).
- Largest Rectangle in Histogram (n° 84, difficile) — plus grand rectangle sous un histogramme — pile d'indices aux hauteurs croissantes ; quand une barre plus basse arrive, dépiler : la barre dépilée donne la hauteur, et la largeur va du nouveau sommet exclu jusqu'à i exclu. Ajouter une barre de hauteur 0 à la fin pour tout vider. O(n).

### Recherche binaire

- Binary Search (n° 704, facile) — position d'une cible dans un tableau trié — intervalle [g, d], milieu m = g + (d − g) // 2, éliminer la moitié qui ne peut pas contenir la cible ; arrêt quand g > d. O(log n).
- Koko Eating Bananas (n° 875, moyen) — plus petite vitesse k qui permet de manger tous les tas en h heures — recherche binaire sur la réponse : le temps Σ ⌈pᵢ / k⌉ décroît avec k, chercher le plus petit k entre 1 et max pᵢ qui tient en h heures. O(n log max pᵢ).
- Find Minimum in Rotated Sorted Array (n° 153, moyen) — minimum d'un tableau trié puis décalé circulairement — comparer nums[m] à nums[d] : s'il est plus grand, le minimum est à droite de m, sinon il est en m ou à sa gauche. O(log n).
- Search in Rotated Sorted Array (n° 33, moyen) — chercher une cible dans un tableau trié décalé circulairement — à chaque étape, l'une des deux moitiés est triée ; regarder si la cible tombe dans les bornes de cette moitié pour choisir où continuer. O(log n).
- Median of Two Sorted Arrays (n° 4, difficile) — médiane de deux tableaux triés en temps logarithmique — recherche binaire sur la coupure i du plus petit tableau, dont on déduit la coupure j de l'autre pour que la partie gauche contienne la moitié des éléments ; la coupure est bonne quand le maximum des gauches est ≤ au minimum des droites. O(log min(m, n)).

### Listes chaînées

- Reverse Linked List (n° 206, facile) — inverser une liste chaînée — trois pointeurs précédent, courant et suivant ; à chaque pas, faire pointer le courant vers le précédent puis avancer. O(n), mémoire O(1).
- Merge Two Sorted Lists (n° 21, facile) — fusionner deux listes triées — nœud sentinelle, puis brancher à chaque pas la plus petite des deux têtes ; raccrocher le reste à la fin. O(n + m).
- Linked List Cycle (n° 141, facile) — détecter un cycle — lièvre et tortue de Floyd : un pointeur avance d'un pas, l'autre de deux ; ils se rencontrent si et seulement si la liste a un cycle. O(n), mémoire O(1).
- Remove Nth Node From End of List (n° 19, moyen) — supprimer le n-ième nœud en partant de la fin, en une passe — deux pointeurs partant d'une sentinelle, le premier avec n + 1 pas d'avance ; quand il atteint la fin, le second est juste avant le nœud à supprimer. O(n).
- Copy List with Random Pointer (n° 138, moyen) — copier une liste dont chaque nœud a aussi un pointeur vers un nœud quelconque — table original → copie en deux passes : créer les copies, puis relier les pointeurs suivant et aléatoire. Variante en mémoire O(1) : intercaler chaque copie juste après son original. O(n).
- Add Two Numbers (n° 2, moyen) — additionner deux nombres stockés chiffre par chiffre à l'envers — parcourir les deux listes ensemble avec une retenue, comme une addition posée ; continuer tant qu'il reste un chiffre ou une retenue. O(max(n, m)).
- Find the Duplicate Number (n° 287, moyen) — trouver le doublon parmi n + 1 valeurs de [1, n], sans modifier le tableau et en mémoire O(1) — voir i → nums[i] comme une liste chaînée dont le doublon est l'entrée du cycle ; Floyd pour trouver une rencontre, puis repartir de 0 avec un pointeur et avancer les deux d'un pas jusqu'à ce qu'ils se rejoignent. O(n).
- LRU Cache (n° 146, moyen) — cache de capacité fixe qui évince l'élément utilisé il y a le plus longtemps, avec get et put en O(1) — table de hachage clé → nœud et liste doublement chaînée ordonnée par date d'usage ; chaque accès remet le nœud en tête, l'éviction retire la queue. O(1).
- Merge k Sorted Lists (n° 23, difficile) — fusionner k listes triées — tas min contenant la tête de chaque liste ; extraire le minimum, l'ajouter au résultat et pousser son successeur. O(N log k) pour N nœuds au total. Variante : fusions deux à deux en arbre.

### Arbres

- Invert Binary Tree (n° 226, facile) — échanger les sous-arbres gauche et droit à tous les niveaux — récursion : échanger les deux enfants, puis inverser chacun d'eux. O(n).
- Maximum Depth of Binary Tree (n° 104, facile) — profondeur maximale d'un arbre — 1 + maximum des profondeurs des deux sous-arbres, 0 pour un arbre vide ; ou parcours en largeur en comptant les niveaux. O(n).
- Diameter of Binary Tree (n° 543, facile) — plus long chemin entre deux nœuds, compté en arêtes — parcours en profondeur qui renvoie la hauteur de chaque sous-arbre et met à jour au passage le maximum de hauteur gauche + hauteur droite. O(n).
- Same Tree (n° 100, facile) — dire si deux arbres sont identiques — récursion simultanée : deux arbres vides sont égaux, sinon comparer les valeurs puis les enfants gauches et les enfants droits. O(n).
- Lowest Common Ancestor of a Binary Search Tree (n° 235, moyen) — plus proche ancêtre commun de deux nœuds d'un arbre binaire de recherche — partir de la racine ; si p et q sont tous deux plus petits que le nœud, descendre à gauche, s'ils sont tous deux plus grands, à droite, sinon le nœud courant est la réponse. O(h).
- Binary Tree Level Order Traversal (n° 102, moyen) — valeurs de l'arbre niveau par niveau — parcours en largeur avec une file ; traiter à chaque tour exactement les nœuds présents dans la file au début du tour. O(n).
- Binary Tree Right Side View (n° 199, moyen) — nœuds visibles depuis la droite de l'arbre — parcours en largeur en gardant le dernier nœud de chaque niveau, ou parcours en profondeur côté droit d'abord en gardant le premier nœud vu à chaque profondeur. O(n).
- Validate Binary Search Tree (n° 98, moyen) — vérifier qu'un arbre est un arbre binaire de recherche — descendre en transmettant un intervalle (min, max) que chaque valeur doit respecter ; comparer seulement au parent ne suffit pas. Variante : le parcours infixe doit être strictement croissant. O(n).
- Kth Smallest Element in a BST (n° 230, moyen) — k-ième plus petite valeur d'un arbre binaire de recherche — parcours infixe itératif avec une pile, arrêté au k-ième nœud visité. O(h + k).
- Construct Binary Tree from Preorder and Inorder Traversal (n° 105, moyen) — reconstruire un arbre à partir de ses parcours préfixe et infixe — le premier élément du préfixe est la racine ; sa position dans l'infixe sépare les sous-arbres gauche et droit ; une table valeur → indice la donne en O(1). O(n).
- Binary Tree Maximum Path Sum (n° 124, difficile) — chemin de somme maximale, pouvant commencer et finir n'importe où — parcours en profondeur qui renvoie le meilleur gain descendant depuis chaque nœud, sa valeur plus max(0, gain gauche, gain droit) ; mettre à jour le maximum global avec valeur + max(0, gain gauche) + max(0, gain droit). O(n).
- Serialize and Deserialize Binary Tree (n° 297, difficile) — convertir un arbre en chaîne et inversement — parcours préfixe en écrivant un marqueur pour chaque enfant vide ; la désérialisation relit les jetons dans le même ordre, récursivement. O(n).

### Tas

- Kth Largest Element in an Array (n° 215, moyen) — k-ième plus grande valeur d'un tableau — tas min de taille k dont le sommet est la réponse, O(n log k) ; ou sélection rapide de Hoare, O(n) en moyenne.
- Task Scheduler (n° 621, moyen) — durée minimale pour exécuter des tâches avec n unités de repos entre deux tâches identiques — la tâche la plus fréquente, de fréquence f, impose f − 1 blocs de n + 1 cases plus un dernier bloc contenant les m tâches de fréquence f ; réponse max(nombre de tâches, (f − 1)(n + 1) + m). O(n).
- Find Median from Data Stream (n° 295, difficile) — médiane d'un flux de nombres — tas max pour la moitié basse, tas min pour la moitié haute, rééquilibrés pour que leurs tailles diffèrent d'au plus 1 ; la médiane se lit sur les sommets. O(log n) par insertion, O(1) par lecture.

### Retour sur trace

- Subsets (n° 78, moyen) — tous les sous-ensembles d'un ensemble — retour sur trace : à chaque indice, prendre ou ne pas prendre l'élément ; ou partir de l'ensemble vide et ajouter chaque élément à toutes les parties déjà construites. O(n·2ⁿ).
- Combination Sum (n° 39, moyen) — combinaisons dont la somme vaut la cible, chaque nombre réutilisable — retour sur trace avec un indice de départ pour ne pas produire deux fois la même combinaison dans un autre ordre ; rester sur le même indice après un choix pour autoriser la réutilisation ; couper dès que la somme dépasse la cible.
- Permutations (n° 46, moyen) — toutes les permutations d'un tableau — retour sur trace en marquant les éléments déjà utilisés, ou par échanges successifs en place. O(n·n!).
- Generate Parentheses (n° 22, moyen) — toutes les chaînes bien formées de n paires de parenthèses — retour sur trace : ajouter une ouvrante tant qu'il en reste, ajouter une fermante seulement si elle referme une ouvrante. Le nombre de solutions est le nombre de Catalan.
- Word Search (n° 79, moyen) — dire si un mot se lit dans une grille en passant par des cases adjacentes — parcours en profondeur depuis chaque case, en marquant temporairement la case visitée et en la libérant au retour. O(m·n·4ᴸ).
- Letter Combinations of a Phone Number (n° 17, moyen) — toutes les chaînes que peuvent produire des touches de téléphone — retour sur trace sur les chiffres, une branche par lettre de la touche. O(n·4ⁿ).
- N-Queens (n° 51, difficile) — placer n dames sur un échiquier n × n sans qu'elles se menacent — une dame par ligne ; ensembles des colonnes, des diagonales r − c et des antidiagonales r + c déjà occupées, pour tester chaque case en O(1).

### Trie

- Implement Trie (n° 208, moyen) — arbre préfixe avec insert, search et startsWith — chaque nœud a une table de ses enfants par caractère et un drapeau de fin de mot. O(L) par opération pour un mot de longueur L.
- Word Search II (n° 212, difficile) — trouver tous les mots d'une liste dans une grille — insérer les mots dans un trie, puis parcours en profondeur depuis chaque case en descendant en même temps dans le trie ; élaguer dès que le préfixe n'existe pas, retirer les mots déjà trouvés.

### Graphes

- Number of Islands (n° 200, moyen) — compter les îles de « 1 » dans une grille — pour chaque case de terre non visitée, incrémenter le compteur et marquer toute l'île par parcours en profondeur ou en largeur. O(m·n).
- Clone Graph (n° 133, moyen) — copie profonde d'un graphe — parcours avec une table original → clone remplie à la première visite, ce qui évite de boucler sur les cycles. O(V + E).
- Pacific Atlantic Water Flow (n° 417, moyen) — cases d'où l'eau peut couler vers les deux océans — inverser le sens : remonter depuis les bords de chaque océan vers les cases de hauteur supérieure ou égale ; la réponse est l'intersection des deux ensembles atteints. O(m·n).
- Rotting Oranges (n° 994, moyen) — temps pour que toutes les oranges pourrissent — parcours en largeur multi-source, partant de toutes les oranges pourries à la fois ; chaque niveau compte une minute ; −1 s'il reste une orange saine à la fin. O(m·n).
- Course Schedule (n° 207, moyen) — dire si on peut suivre tous les cours compte tenu des prérequis — détecter un cycle dans le graphe orienté : algorithme de Kahn avec une file des nœuds de degré entrant nul ; possible si tous les nœuds finissent retirés. Ou parcours en profondeur à trois couleurs. O(V + E).
- Course Schedule II (n° 210, moyen) — donner un ordre valide pour suivre les cours — même algorithme de Kahn, l'ordre de sortie de la file est un tri topologique ; liste vide en cas de cycle. O(V + E).
- Redundant Connection (n° 684, moyen) — arête à retirer pour qu'un graphe redevienne un arbre — union-find avec compression de chemins ; la première arête dont les deux extrémités ont déjà le même représentant ferme un cycle. O(n·α(n)).
- Word Ladder (n° 127, difficile) — plus courte suite de mots qui passe d'un mot à l'autre en changeant une lettre à la fois — parcours en largeur sur les mots ; les voisins s'obtiennent en remplaçant chaque position par un joker, avec une table motif → mots. O(n·L²).
- Network Delay Time (n° 743, moyen) — temps pour qu'un signal parti d'un nœud atteigne tous les autres — Dijkstra depuis la source avec un tas min ; la réponse est la plus grande distance, −1 si un nœud est inaccessible. O(E log V).
- Cheapest Flights Within K Stops (n° 787, moyen) — trajet le moins cher avec au plus k escales — Bellman-Ford limité à k + 1 tours de relaxation, chaque tour partant d'une copie des distances du tour précédent. O(k·E).
- Min Cost to Connect All Points (n° 1584, moyen) — coût minimal pour relier tous les points en distance de Manhattan — arbre couvrant minimal : Prim sur le graphe complet en O(n²) avec un tableau des distances à l'arbre, ou Kruskal avec union-find.

### Programmation dynamique à une dimension

- Climbing Stairs (n° 70, facile) — nombre de façons de monter n marches par pas de 1 ou 2 — f(n) = f(n − 1) + f(n − 2), la suite de Fibonacci ; deux variables suffisent. O(n), mémoire O(1).
- House Robber (n° 198, moyen) — somme maximale sans prendre deux maisons voisines — dp[i] = max(dp[i − 1], dp[i − 2] + nums[i]), c'est-à-dire sauter la maison i ou la prendre. O(n), mémoire O(1).
- Longest Palindromic Substring (n° 5, moyen) — plus longue sous-chaîne palindrome — étendre autour de chacun des 2n − 1 centres possibles, un caractère ou l'espace entre deux caractères, tant que les extrémités coïncident. O(n²), mémoire O(1). L'algorithme de Manacher atteint O(n).
- Decode Ways (n° 91, moyen) — nombre de décodages d'une chaîne de chiffres avec A = 1, …, Z = 26 — dp[i] reçoit dp[i − 1] si le chiffre i est non nul, plus dp[i − 2] si les deux derniers chiffres forment un nombre entre 10 et 26. O(n).
- Coin Change (n° 322, moyen) — nombre minimal de pièces pour former un montant — dp[a] = 1 + min sur les pièces c de dp[a − c], avec dp[0] = 0 et l'infini pour un montant impossible. O(montant × nombre de pièces).
- Maximum Product Subarray (n° 152, moyen) — sous-tableau contigu de produit maximal — garder le produit maximal et le produit minimal finissant en i, car un nombre négatif les échange ; chaque nouvelle valeur est prise seule ou multipliée par l'un d'eux. O(n).
- Word Break (n° 139, moyen) — dire si une chaîne se découpe en mots d'un dictionnaire — dp[i] est vrai s'il existe j < i avec dp[j] vrai et s[j:i] dans le dictionnaire, stocké en ensemble. O(n²) tests, ou moins en ne testant que les longueurs de mots existantes.
- Longest Increasing Subsequence (n° 300, moyen) — plus longue sous-suite strictement croissante — tableau tails où tails[l] est la plus petite fin possible d'une sous-suite de longueur l + 1 ; chaque valeur remplace, par recherche binaire, le premier élément ≥ à elle. O(n log n). La version dp simple est en O(n²).
- Partition Equal Subset Sum (n° 416, moyen) — couper un tableau en deux parties de même somme — sac à dos 0/1 vers la cible S/2, impossible si S est impair ; tableau de booléens des sommes atteignables, mis à jour de droite à gauche pour chaque nombre. O(n·S).

### Programmation dynamique à deux dimensions

- Unique Paths (n° 62, moyen) — nombre de chemins dans une grille en n'allant qu'à droite ou en bas — dp[i][j] = dp[i − 1][j] + dp[i][j − 1], une seule ligne suffit ; ou directement le coefficient binomial C(m + n − 2, m − 1). O(m·n).
- Longest Common Subsequence (n° 1143, moyen) — longueur de la plus longue sous-suite commune à deux chaînes — si aᵢ = bⱼ, dp[i][j] = dp[i − 1][j − 1] + 1, sinon max(dp[i − 1][j], dp[i][j − 1]). O(m·n).
- Edit Distance (n° 72, difficile) — nombre minimal d'insertions, suppressions et remplacements pour passer d'un mot à l'autre — distance de Levenshtein : si les lettres sont égales, dp[i][j] = dp[i − 1][j − 1], sinon 1 + minimum des trois voisins ; initialiser dp[i][0] = i et dp[0][j] = j. O(m·n).
- Target Sum (n° 494, moyen) — nombre de façons de mettre + ou − devant chaque nombre pour atteindre la cible — si P est la somme des termes positifs, P = (S + cible) / 2 ; compter les sous-ensembles de somme P par un sac à dos de comptage. O(n·S).

### Glouton et intervalles

- Maximum Subarray (n° 53, moyen) — sous-tableau contigu de somme maximale — algorithme de Kadane : la meilleure somme finissant en i vaut max(xᵢ, meilleure précédente + xᵢ) ; garder le maximum global. O(n).
- Jump Game (n° 55, moyen) — dire si on atteint la dernière case, chaque case donnant la longueur maximale du saut — garder la portée maximale atteignable ; échec dès que l'indice courant la dépasse. O(n).
- Gas Station (n° 134, moyen) — station de départ qui permet de faire le tour du circuit — impossible si l'essence totale est inférieure au coût total ; sinon, parcourir avec un réservoir et repartir de la station suivante dès qu'il devient négatif. O(n).
- Merge Intervals (n° 56, moyen) — fusionner les intervalles qui se chevauchent — trier par début, puis étendre le dernier intervalle fusionné tant que le début courant est ≤ à sa fin. O(n log n).
- Insert Interval (n° 57, moyen) — insérer un intervalle dans une liste triée d'intervalles disjoints — trois phases : copier ceux qui finissent avant, fusionner ceux qui chevauchent en prenant le minimum des débuts et le maximum des fins, copier le reste. O(n).
- Non-overlapping Intervals (n° 435, moyen) — nombre minimal d'intervalles à retirer pour supprimer tout chevauchement — glouton par fin croissante : garder un intervalle s'il commence après la fin du dernier gardé, compter les autres. O(n log n).
- Meeting Rooms II (n° 253, moyen) — nombre minimal de salles pour un ensemble de réunions — trier séparément les débuts et les fins, les balayer avec deux pointeurs, +1 à chaque début et −1 à chaque fin, garder le maximum ; ou tas min des fins des réunions en cours. O(n log n).

### Bits, maths et matrices

- Single Number (n° 136, facile) — seul élément présent une fois, tous les autres l'étant deux fois — XOR de tous les éléments, car x ⊕ x = 0 et x ⊕ 0 = x. O(n), mémoire O(1).
- Missing Number (n° 268, facile) — nombre manquant parmi 0 à n — n(n + 1)/2 moins la somme du tableau, ou XOR de tous les indices et de toutes les valeurs. O(n), mémoire O(1).
- Rotate Image (n° 48, moyen) — tourner une matrice carrée de 90° en place — transposer, puis inverser chaque ligne. O(n²), mémoire O(1).
- Spiral Matrix (n° 54, moyen) — parcourir une matrice en spirale — quatre bornes haut, bas, gauche et droite ; parcourir un côté, resserrer la borne correspondante, s'arrêter quand les bornes se croisent. O(m·n).
- Pow(x, n) (n° 50, moyen) — calculer xⁿ — exponentiation rapide : x²ᵏ = (xᵏ)², avec un facteur x de plus si l'exposant est impair ; pour n < 0, calculer 1 / x⁻ⁿ. O(log n).
