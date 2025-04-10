
MovieBooker est un projet visant à développer un système de réservation de films permettant aux utilisateurs de se connecter, de visualiser les films disponibles et de réserver des créneaux horaires spécifiques pour chaque film. L'application utilise JWT pour l'authentification des utilisateurs avec des rôles admin/user et se connecte à l'API TMDB pour récupérer les informations sur les films.

Les fonctionnalités principales incluent l'authentification des utilisateurs avec JWT pour sécuriser l'accès à l'application et la gestion des rôles utilisateur (user et admin). L'application se connecte à l'API TMDB pour afficher les films disponibles, avec des fonctionnalités de pagination et de recherche. Un système de réservation avec créneaux horaires permet aux utilisateurs de réserver des films à une date et heure spécifiques, tout en empêchant les réservations qui se chevauchent dans un intervalle de 2 heures. La pagination et le filtrage des films sont également disponibles, ainsi que la sécurisation des endpoints avec JWT et la gestion des rôles. Une documentation automatique des API est disponible via Swagger pour faciliter les tests et l'intégration. Enfin, l'interface utilisateur est simple et légère, réalisée avec React et TailwindCSS, et propose des pages de connexion/inscription, d'affichage des films, de réservation, de gestion des réservations et de déconnexion.

Avant de démarrer le projet, assurez-vous d'avoir les outils suivants installés sur votre machine : Node.js, PostgreSQL, et Docker (facultatif pour la gestion de la base de données).

Pour installer le projet, commencez par cloner le repository avec la commande suivante :


git clone https://github.com/fatat701/MovieBooker.git ->branche main


Allez ensuite dans le répertoire du backend et installez les dépendances :


cd backend
npm install
npm run start:dev


Si vous préférez utiliser la version déployée, vous pouvez accéder au backend via le lien suivant :  
[Backend en ligne sur Render] : https://moviebooker-4us1.onrender.com/api

Pour le frontend, allez dans le répertoire du frontend, installez les dépendances et lancez le serveur frontend en mode développement :


cd front
npm install
npm run dev


Le backend exposera une API REST sécurisée avec JWT pour gérer l'authentification, la récupération des films via l'API TMDB, et la gestion des réservations. L'interface frontend, réalisée avec React, permettra aux utilisateurs de se connecter, visualiser les films, effectuer une réservation et consulter leurs réservations passées.

Le projet peut être déployé localement ou dans un environnement cloud à l'aide de Docker ou d'autres outils de déploiement. Les étapes de déploiement peuvent varier en fonction de l'infrastructure choisie.

La documentation complète des API est disponible via Swagger. Une fois le backend lancé, rendez-vous à l'URL suivante pour accéder à la documentation :  

http://localhost:3000/api
