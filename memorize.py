#!/usr/bin/env python3
"""memorize — affiche un texte avec des blancs pour aider la mémorisation."""

import sys
import re
import random
import hashlib


def word_complexity(word: str) -> int:
    """Complexité d'un mot = nombre de lettres (les mots longs sont plus difficiles)."""
    return len(re.sub(r"[^a-zA-ZÀ-ÿ]", "", word))


def blank_word(word: str, difficulty: float, rng: random.Random) -> str:
    """Remplace une proportion de lettres par des '_', en gardant la première."""
    chars = list(word)
    # Positions des lettres (hors première lettre — garde un ancrage visuel)
    blankable = [i for i, c in enumerate(chars) if c.isalpha() and i > 0]
    if not blankable:
        return word

    n_blank = max(1, round(len(blankable) * difficulty))
    n_blank = min(n_blank, len(blankable))

    for i in rng.sample(blankable, n_blank):
        chars[i] = "_"

    return "".join(chars)


def memorize(text: str, difficulty: float) -> str:
    if difficulty == 0:
        return text

    # Seed déterministe : même fichier → mêmes blancs à chaque run
    seed = int(hashlib.md5(text.encode()).hexdigest(), 16) % (2**32)
    rng = random.Random(seed)

    # Tokenisation : mots vs non-mots (ponctuation, espaces, retours)
    tokens = re.findall(r"[a-zA-ZÀ-ÿ']+|[^a-zA-ZÀ-ÿ']+", text)

    word_tokens = [t for t in tokens if t[0].isalpha() or ord(t[0]) > 127]

    if not word_tokens:
        return text

    # Classement des mots uniques par complexité croissante
    unique_words = sorted(
        set(w.lower() for w in word_tokens),
        key=word_complexity,
    )

    # Les `difficulty * 100 %` mots les plus complexes reçoivent des blancs
    n_to_blank = max(0, round(len(unique_words) * difficulty))
    words_to_blank = set(unique_words[-n_to_blank:]) if n_to_blank else set()

    result = []
    for token in tokens:
        if token[0].isalpha() and token.lower() in words_to_blank:
            result.append(blank_word(token, difficulty, rng))
        else:
            result.append(token)

    return "".join(result)


def main() -> None:
    if len(sys.argv) != 3:
        print(f"Usage: {sys.argv[0]} <fichier.txt> <difficulté 0-1>")
        sys.exit(1)

    path = sys.argv[1]

    try:
        difficulty = float(sys.argv[2])
        if not 0.0 <= difficulty <= 1.0:
            raise ValueError
    except ValueError:
        print("Erreur : la difficulté doit être un nombre entre 0 et 1.")
        sys.exit(1)

    try:
        with open(path, encoding="utf-8") as f:
            text = f.read()
    except FileNotFoundError:
        print(f"Erreur : fichier '{path}' introuvable.")
        sys.exit(1)
    except OSError as e:
        print(f"Erreur : {e}")
        sys.exit(1)

    print(memorize(text, difficulty))


if __name__ == "__main__":
    main()
