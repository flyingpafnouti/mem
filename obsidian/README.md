# Memorizer — Plugin Obsidian

Masque des mots dans tes notes Markdown pour t'aider à mémoriser. Le slider de difficulté contrôle la proportion et l'intensité des blancs.

## Installation manuelle

1. Copie ce dossier (`obsidian/`) dans le répertoire des plugins de ton vault :

   ```
   <vault>/.obsidian/plugins/memorizer/
   ```

   Le dossier doit contenir ces 3 fichiers :
   ```
   manifest.json
   main.js
   styles.css
   ```

2. Dans Obsidian, va dans **Paramètres → Plugins communautaires** et active **Memorizer**.

3. Recharge Obsidian si nécessaire (`Ctrl+P` → *Reload app without saving*).

## Utilisation

- Clique sur l'icône **🧠** dans la barre latérale gauche pour ouvrir le panneau Memorize.
- Ou `Ctrl+P` → **Ouvrir la vue Memorize**.
- Ouvre n'importe quelle note `.md` — le contenu s'affiche automatiquement dans le panneau avec les mots masqués.
- Ajuste le **slider de difficulté** :
  - `0.00` → aucun blanc
  - `0.00 → 1.00` → de 0 % à 100 % des mots masqués (lettres intérieures)
  - `1.00 → 2.00` → mode **hardcore** : la première lettre est aussi masquée

## Fonctionnement

Les blancs sont **déterministes** : le même texte produit toujours les mêmes blancs, quelle que soit la session. Les mots les plus longs (donc les plus complexes) sont masqués en premier.
