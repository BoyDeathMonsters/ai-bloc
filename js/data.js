// Données statiques de l'app (coachs, exercices, cotations)

export const GRADES = ['3', '4a', '4b', '4c', '5a', '5b', '5c', '6a', '6a+', '6b', '6b+', '6c', '6c+', '7a', '7a+', '7b', '7b+', '7c', '7c+', '8a', '8a+', '8b', '8b+', '8c'];

const V = { '3': 'VB', '4a': 'V0', '4b': 'V0', '4c': 'V0', '5a': 'V1', '5b': 'V1', '5c': 'V2', '6a': 'V3', '6a+': 'V3', '6b': 'V4', '6b+': 'V4', '6c': 'V5', '6c+': 'V5', '7a': 'V6', '7a+': 'V7', '7b': 'V8', '7b+': 'V8', '7c': 'V9', '7c+': 'V10', '8a': 'V11', '8a+': 'V12', '8b': 'V13', '8b+': 'V14', '8c': 'V15' };
export const toV = g => V[g] || g;

export const PLANS = [
  { id: 'free', name: 'Free', price: '0 €', per: '', perks: ['Suivi de progression', '3 analyses vidéo par mois', 'Exercices de base'] },
  { id: 'premium', name: 'Premium', price: '9,99 €', per: '/mois', perks: ['Analyses vidéo illimitées', 'Suivi personnalisé', 'Tous les exercices coachs'] },
  { id: 'premiumplus', name: 'Premium+', price: '49,57 €', per: '/mois', perks: ['Tout Premium', '1 cours par mois avec un coach inclus', 'Débrief vidéo prioritaire'] },
];

export const COACHES = [
  { id: 'ines', name: 'Inès Martin', initials: 'IM', color: '#D9A88A', specialty: 'Bloc · lecture de voie', title: 'Coach bloc', gym: 'Salle Verticale', rating: 4.9, reviews: 28, km: 2, tags: ['bloc'], days: [2, 4, 6], slots: ['17:00', '18:00', '19:00'], bio: "Diplômée d'État, Inès aide à décoder un bloc avant de le toucher : placement, lecture, choix des pieds." },
  { id: 'sam', name: 'Sam Leclerc', initials: 'SL', color: '#BBD3B6', specialty: 'Technique · débutant', title: 'Coach technique', gym: 'Bloc Garonne', rating: 4.8, reviews: 41, km: 4, tags: ['debutant'], days: [3, 5, 6], slots: ['17:30', '18:30', '19:30'], bio: 'Sam accompagne les grimpeurs qui débutent : bases solides, gestes sûrs, progression sans blessure.' },
  { id: 'alex', name: 'Alex Bernard', initials: 'AB', color: '#B8C5E8', specialty: 'Dévers · performance', title: 'Coach performance', gym: 'La Dalle Rose', rating: 5.0, reviews: 17, km: 5, tags: ['bloc'], days: [4, 6, 7], slots: ['19:00', '20:00'], bio: "Ancien compétiteur, Alex travaille l'engagement en dévers et la gestion de l'effort sur les blocs durs." },
  { id: 'nora', name: 'Nora Haddad', initials: 'NH', color: '#E7C8E0', specialty: 'Mobilité · prévention', title: 'Coach & préparatrice physique', gym: 'Salle Verticale', rating: 4.7, reviews: 22, km: 3.5, tags: ['debutant'], days: [1, 3, 5], slots: ['12:30', '18:00', '19:00'], bio: 'Préparatrice physique, Nora construit des routines de mobilité et de renforcement adaptées à la grimpe.' },
  { id: 'theo', name: 'Théo Garcia', initials: 'TG', color: '#F2D59E', specialty: 'Bloc · force & gainage', title: 'Coach bloc', gym: 'Bloc Garonne', rating: 4.9, reviews: 35, km: 6.2, tags: ['bloc'], days: [1, 2, 7], slots: ['10:00', '18:30', '20:00'], bio: 'Théo prépare les grimpeurs qui veulent franchir le cap du 6c : gainage, force spécifique et tactique.' },
];

export const SESSION_TYPES = [
  { id: 'solo', label: 'Séance individuelle', detail: '45 min · à la salle', price: 35 },
  { id: 'duo', label: 'Séance à deux', detail: '60 min · à la salle', price: 25, per: '/pers.' },
  { id: 'remote', label: 'Débrief vidéo à distance', detail: '20 min · en visio', price: 15 },
];

export const CATEGORIES = ['Tout', 'Pieds', 'Placement', 'Gainage', 'Échauffement', 'Force'];

// steps : [intitulé, secondes, conseil]
export const EXERCISES = [
  {
    id: 'pieds-dalle', title: 'Trouver ses pieds en dalle', coach: 'Inès', cat: 'Pieds', level: 'Tous niveaux', goal: 'pousser', featured: true,
    summary: "En dalle, tout passe par les pieds. On apprend à poser précisément et à faire confiance à l'adhérence.",
    tip: 'Regarde ton pied jusqu’à ce qu’il soit posé, puis seulement ta prochaine main.',
    steps: [['Traversée regard sur les pieds', 90, 'Pose chaque pied sans bruit, regarde-le jusqu’au contact.'], ['Talons bas, poids sur les pointes', 60, 'Descends les talons pour plus d’adhérence.'], ['Montée mains basses', 90, 'Grimpe une dalle facile en gardant les mains sous les épaules.'], ['Repos', 30, 'Secoue les bras, respire.'], ['Montée « sans mains »', 90, 'Sur une dalle très facile, pousse uniquement sur les jambes.']],
  },
  {
    id: 'echauffement', title: 'Échauffement articulaire', coach: 'Sam', cat: 'Échauffement', level: 'Tous niveaux', goal: 'equilibre',
    summary: 'La routine de 8 minutes à faire avant chaque séance de bloc pour préparer les articulations.',
    tip: 'Monte progressivement : l’échauffement ne doit jamais faire mal.',
    steps: [['Rotations des poignets', 45, '10 dans chaque sens, doigts ouverts puis fermés.'], ['Cercles d’épaules', 60, 'Grands cercles lents, bras tendus.'], ['Ouverture de hanches', 60, 'Genou levé, ouvre vers l’extérieur, alterne.'], ['Chevilles & mollets', 45, 'Sur la pointe des pieds, monte et descends.'], ['Montées de genoux', 60, 'Rythme modéré pour monter le cardio.'], ['Traversée très facile', 150, 'Grimpe en traversée sur des grosses prises, sans forcer.'], ['Suspensions passives', 60, '3 × 10 s sur prises larges, pieds au sol si besoin.']],
  },
  {
    id: 'doigts', title: 'Échauffement doigts', coach: 'Sam', cat: 'Force', level: 'Intermédiaire', goal: 'pousser',
    summary: 'Préparer progressivement les poulies avant de tirer sur des petites prises.',
    tip: 'Jamais de petites réglettes à froid. Si ça tire dans un doigt, on arrête.',
    steps: [['Ouverture / fermeture des mains', 40, 'Rapide, 20 répétitions.'], ['Suspension prises larges', 60, '3 × 10 s, pieds au sol pour alléger.'], ['Suspension prises moyennes', 60, '3 × 8 s, toujours pieds au sol.'], ['Repos', 40, 'Masse tes avant-bras.'], ['Blocs faciles sur réglettes', 60, '2 blocs très en dessous de ton niveau.']],
  },
  {
    id: 'devers', title: 'Départ en dévers', coach: 'Inès', cat: 'Placement', level: 'Intermédiaire', goal: 'equilibre',
    summary: 'Décoller du sol en dévers sans tout faire avec les bras : pieds actifs et hanches proches du mur.',
    tip: 'Tire avec les pieds : crochète-les comme si tu voulais ramener le mur vers toi.',
    steps: [['Assis-départ, pieds posés', 60, 'Pose les deux pieds avant de décoller.'], ['Hanche contre le mur', 90, 'Tourne une hanche vers le mur à chaque mouvement.'], ['Repos', 30, 'Respire, secoue.'], ['Bras tendus', 90, 'Garde les bras longs, ce sont les jambes qui montent.'], ['Répète ton départ projet', 120, 'Trois essais concentrés, repos entre chaque.']],
  },
  {
    id: 'pieds-silencieux', title: 'Pieds silencieux', coach: 'Alex', cat: 'Pieds', level: 'Débutant', goal: 'pousser',
    summary: 'Le meilleur exercice pour la précision : aucun bruit quand le chausson touche la prise.',
    tip: 'Si tu entends ton pied, recommence le mouvement.',
    steps: [['Traversée silencieuse', 120, 'Aucun bruit à la pose du pied.'], ['Repos', 30, ''], ['Montée silencieuse', 90, 'Un bloc facile, pieds précis.'], ['Pied – pause – main', 90, 'Marque une pause d’une seconde après chaque pied.']],
  },
  {
    id: 'hanches', title: 'Hanches au mur', coach: 'Inès', cat: 'Placement', level: 'Tous niveaux', goal: 'equilibre',
    summary: 'Rapprocher le centre de gravité du mur pour soulager les bras et gagner en allonge.',
    tip: 'Pense « nombril vers le mur » à chaque prise.',
    steps: [['Lolottes en traversée', 120, 'Genou vers l’intérieur, hanche au mur.'], ['Repos', 30, ''], ['Face / profil', 90, 'Alterne grimpe de face et de profil sur le même bloc.'], ['Drapeaux', 90, 'Jambe libre en contre-poids pour éviter la porte.']],
  },
  {
    id: 'gainage-devers', title: 'Gainage spécial dévers', coach: 'Théo', cat: 'Gainage', level: 'Intermédiaire', goal: 'pousser',
    summary: 'Garder les pieds sur les prises en dévers demande un tronc solide. Circuit court et efficace.',
    tip: 'Dos plat, respiration continue : qualité avant quantité.',
    steps: [['Planche', 45, 'Corps aligné, fesses serrées.'], ['Repos', 15, ''], ['Hollow body', 30, 'Bas du dos plaqué au sol.'], ['Repos', 15, ''], ['Planche latérale gauche', 30, ''], ['Planche latérale droite', 30, ''], ['Repos', 30, ''], ['Relevés de genoux suspendu', 40, 'Lentement, sans balancer.'], ['Repos', 20, ''], ['Planche', 45, 'Dernier effort !']],
  },
  {
    id: 'hollow', title: 'Planche & hollow body', coach: 'Nora', cat: 'Gainage', level: 'Débutant', goal: 'equilibre',
    summary: 'Les deux positions de base du gainage, version accessible.',
    tip: 'Si le bas du dos décolle, plie les genoux.',
    steps: [['Planche sur genoux', 40, ''], ['Repos', 20, ''], ['Hollow genoux pliés', 30, ''], ['Repos', 20, ''], ['Planche', 40, ''], ['Repos', 20, ''], ['Hollow bras tendus', 30, '']],
  },
  {
    id: 'pousser', title: 'Bras tendus, jambes qui poussent', coach: 'Alex', cat: 'Pieds', level: 'Tous niveaux', goal: 'pousser',
    summary: 'Arrêter de tirer avec les bras : on apprend à monter en poussant sur les jambes.',
    tip: 'Si ton bras est fléchi au repos, tu gaspilles de l’énergie.',
    steps: [['Traversée bras tendus', 120, 'Les bras restent longs, ce sont les jambes qui déplacent.'], ['Repos', 30, ''], ['Squats au mur', 60, 'Pieds sur prises, descends et pousse.'], ['Bloc facile bras tendus', 90, '']],
  },
  {
    id: 'lecture', title: 'Lecture de bloc au sol', coach: 'Inès', cat: 'Placement', level: 'Tous niveaux', goal: 'equilibre',
    summary: 'Avant de toucher le bloc, mimer la séquence pour gagner des essais.',
    tip: 'Repère d’abord les pieds, puis les mains.',
    steps: [['Observe le bloc', 60, 'Repère départ, sortie et prises clés.'], ['Mime la séquence', 60, 'Avec les mains, et annonce chaque pied.'], ['Premier essai', 90, 'Sans forcer, valide ta lecture.'], ['Corrige', 30, 'Qu’est-ce qui ne collait pas ?']],
  },
  {
    id: 'retour-calme', title: 'Retour au calme & étirements', coach: 'Nora', cat: 'Échauffement', level: 'Tous niveaux', goal: 'equilibre',
    summary: 'Étirements doux de fin de séance pour récupérer plus vite.',
    tip: 'Étirements doux, jamais dans la douleur.',
    steps: [['Avant-bras (fléchisseurs)', 60, 'Bras tendu, paume vers l’avant, tire doucement les doigts.'], ['Avant-bras (extenseurs)', 60, ''], ['Épaules', 60, 'Bras croisé devant la poitrine.'], ['Dos – posture de l’enfant', 60, ''], ['Hanches – pigeon', 90, '45 s par côté.'], ['Respiration', 60, 'Expire lentement.']],
  },
];

export const exerciseMinutes = ex => Math.max(1, Math.round(ex.steps.reduce((s, x) => s + x[1], 0) / 60));
export const exById = id => EXERCISES.find(e => e.id === id);
export const coachById = id => COACHES.find(c => c.id === id);

export const BLOC_NAMES = ['Le surplomb orange', 'La dalle bleue', 'Le toit jaune', 'Réglettes vertes', 'La traversée rose', 'Le dièdre', 'L’arête noire', 'Bidoigts violets', 'La proue', 'Le jeté rouge', 'La fissure', 'Plats blancs', 'Le petit dévers', 'Les bacs verts', 'Compression', 'La vague'];
