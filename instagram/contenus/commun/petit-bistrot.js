/* ==========================================================================
   La carte fictive « Le Petit Bistrot » (la même que dans le film du site).
   Sert de données aux visuels « editeur », « carte », « partout », « codes ».

   - Chaque plat a un `id` (utilisé dans les fichiers de contenu), un `code`
     (lettre de la rubrique + numéro : c'est ce que le client montre au
     serveur quand il lit la carte dans une autre langue) et un prix en euros.
   - Les quatre langues affichées au client : fr, en, es, ru.
   - Tout est inventé : aucun vrai restaurant, aucun vrai client.
   Pour une autre carte fictive, copier ce fichier, changer la clé
   ('petit-bistrot') et la citer dans le visuel :  carte: 'ma-carte'.
   ========================================================================== */
window.VL = window.VL || {};
VL.cartes = VL.cartes || {};
VL.cartes['petit-bistrot'] = {
  nom: 'Le Petit Bistrot',
  sousTitre: { fr: 'la carte du midi', en: 'lunch menu', es: 'la carta del mediodía', ru: 'обеденное меню' },
  jour: { fr: 'À jour · à l\'instant', en: 'Up to date · just now', es: 'Actualizada · ahora mismo', ru: 'Обновлено · только что' },
  rubriques: [
    {
      titre: { fr: 'Plats', en: 'Mains', es: 'Platos', ru: 'Горячие блюда' },
      plats: [
        { id: 'burrata', code: 'P1', prix: '14',
          nom: { fr: 'Burrata di Puglia', en: 'Burrata di Puglia', es: 'Burrata di Puglia', ru: 'Буррата ди Пулья' },
          desc: { fr: 'Tomates anciennes, basilic', en: 'Heirloom tomatoes, basil', es: 'Tomates antiguos, albahaca', ru: 'Томаты, базилик' } },
        { id: 'tartare', code: 'P2', prix: '14',
          nom: { fr: 'Tartare de saumon', en: 'Salmon tartare', es: 'Tartar de salmón', ru: 'Тартар из лосося' },
          desc: { fr: 'Avocat, citron vert', en: 'Avocado, lime', es: 'Aguacate, lima', ru: 'Авокадо, лайм' } },
        { id: 'risotto', code: 'P3', prix: '13',
          nom: { fr: 'Risotto aux cèpes', en: 'Porcini risotto', es: 'Risotto de boletus', ru: 'Ризотто с грибами' },
          desc: { fr: 'Parmesan affiné 18 mois', en: 'Parmesan aged 18 months', es: 'Parmesano curado 18 meses', ru: 'Пармезан, 18 месяцев' } },
        { id: 'bavette', code: 'P4', prix: '19',
          nom: { fr: 'Bavette à l\'échalote', en: 'Steak with shallots', es: 'Bavette con chalotas', ru: 'Стейк с шалотом' },
          desc: { fr: 'Frites maison', en: 'Homemade fries', es: 'Patatas fritas caseras', ru: 'Домашний картофель фри' } },
      ],
    },
    {
      titre: { fr: 'Desserts', en: 'Desserts', es: 'Postres', ru: 'Десерты' },
      plats: [
        { id: 'tarte', code: 'D1', prix: '7',
          nom: { fr: 'Tarte au citron', en: 'Lemon tart', es: 'Tarta de limón', ru: 'Лимонный тарт' },
          desc: { fr: 'Meringue flambée', en: 'Torched meringue', es: 'Merengue flambeado', ru: 'Обожжённая меренга' } },
        { id: 'cafe', code: 'D2', prix: '9',
          nom: { fr: 'Café gourmand', en: 'Coffee & mini desserts', es: 'Café con dulces', ru: 'Кофе с десертами' },
          desc: { fr: 'Trois mignardises', en: 'Three petits fours', es: 'Tres dulces pequeños', ru: 'Три мини-десерта' } },
      ],
    },
  ],
};
