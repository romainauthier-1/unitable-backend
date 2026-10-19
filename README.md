# 🏢 UniTable — Backend

API REST d'UniTable, une solution de gestion du personnel pour la restauration : établissements, employés, services, équipes et plannings, avec une application web pour les managers et une application mobile pour les employés.

Réalisé en équipe de 3, en sprint de 10 jours.

| Repo | Rôle |
| ---- | ---- |
| **unitable-backend** (ce repo) | API REST |
| [unitable-frontend-desktop](https://github.com/romainauthier-1/unitable-frontend-desktop) | back-office web des managers · [démo](https://unitable-frontend-desktop.vercel.app) |
| [unitable-frontend-mobile](https://github.com/romainauthier-1/unitable-frontend-mobile) | application mobile des employés · [démo](https://unitable-mobile.vercel.app) |

![Node.js](https://img.shields.io/badge/Node.js-Express_4-339933?logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose_9-47A248?logo=mongodb&logoColor=white)
![Jest](https://img.shields.io/badge/Tests-Jest_+_Supertest-C21325?logo=jest&logoColor=white)

---

## Fonctionnalités

- **Comptes** : inscription et connexion du manager, mots de passe hachés avec bcrypt. Le hash n'est jamais renvoyé par l'API.
- **Établissements** : création d'un restaurant à partir de son **SIRET**, avec pré-remplissage de la raison sociale et de l'adresse via l'**API SIRENE de l'INSEE**.
- **Employés** : création d'une fiche complète (contrat, volume horaire, contact d'urgence…) avec génération d'un mot de passe temporaire, modification et suppression.
- **Services et équipes** : services (midi, soir…) par jour de la semaine, équipes et rôles avec effectif minimum requis.
- **Plannings** : créneaux de travail par employé (date, horaires, pause, rôle), consultables par établissement, par employé ou par rôle.
- **E-mails transactionnels** via l'API **Brevo** : bienvenue, invitation d'un employé et réinitialisation du mot de passe, avec liens signés en **JWT** à durée limitée.

### Accès et rôles

Le contrôle d'accès par rôle est appliqué côté interface : le back-office desktop n'accepte que les comptes administrateurs (managers), et les employés utilisent l'application mobile. L'API ne vérifie pas encore le token ni le rôle sur ses routes. Un middleware d'authentification serait la prochaine étape pour un usage en production.

## Stack technique

Node.js, Express 4, MongoDB (Atlas) avec Mongoose 9, bcrypt, jsonwebtoken, Day.js, Axios (appels Brevo), Jest et Supertest pour les tests.

## Routes principales

| Domaine | Méthode et route | Description |
| ------- | ---------------- | ----------- |
| Comptes | `POST /users/signup` · `POST /users/signin` | inscription, connexion |
| | `GET /users/search/by/:email` | profil d'un utilisateur |
| | `PUT /users/password` | nouveau mot de passe (lien signé reçu par e-mail) |
| | `PUT /users/organization` | rattacher un utilisateur à son établissement |
| Établissements | `GET /organizations/:siret` | informations INSEE d'un établissement |
| | `POST /organizations` | création d'un établissement |
| | `GET /organizations/search/by/:id` | détail d'un établissement |
| | `PATCH /organizations/addReferenceTeams/:id` | équipes de référence |
| Employés | `GET /employee/:organizationId` | employés d'un établissement |
| | `POST /employee` · `PUT /employee/:id` · `DELETE /employee/:id` | création, modification, suppression |
| Services | `GET /services/:id` · `GET /services/teams/:id` | services d'un établissement et leurs équipes |
| | `POST /services` · `PUT /services/:id` · `DELETE /services/:id` | gestion des services |
| | `DELETE /services/:id/teams/:teamName` | retirer une équipe d'un service |
| Équipes | `POST /teams/addteams` · `GET /teams/:organizationId` | création, liste |
| Plannings | `GET /planning/all/:idRestaurant` | créneaux d'un établissement |
| | `GET /planning/user/:userId` · `GET /planning/role/:restaurantId/:roleName` | par employé, par rôle |
| | `POST /planning/create` · `PUT /planning/update/:idCT` · `DELETE /planning/delete/:idCT` | gestion des créneaux |
| E-mails | `POST /emails/welcome` · `POST /emails/invitation` · `POST /emails/resetpassword` | e-mails transactionnels |

## Installation

Prérequis : Node.js 20+, [corepack](https://nodejs.org/api/corepack.html) (active la bonne version de Yarn), une base MongoDB (Atlas ou locale).

```bash
git clone https://github.com/romainauthier-1/unitable-backend.git
cd unitable-backend
corepack enable
yarn install
cp .env.example .env    # renseigner les variables ci-dessous
yarn dev                # http://localhost:3000
```

| Variable | Rôle |
| -------- | ---- |
| `CONNECTION_STRING` | chaîne de connexion MongoDB |
| `JWT_SECRET` | secret de signature des liens envoyés par e-mail |
| `URL_FRONTEND` | URL du back-office, utilisée dans les liens des e-mails |
| `SIRENE_API_KEY` | clé de l'API SIRENE (INSEE) |
| `BREVO_API_KEY` · `BREVO_SENDER_NAME` · `BREVO_SENDER_EMAIL` | envoi des e-mails via Brevo |

## Tests

Tests d'intégration Jest + Supertest (`app.test.js`, `users.test.js`, à la racine du projet). Ils s'exécutent sur la base définie dans `CONNECTION_STRING`, créent leurs propres données et les suppriment à la fin.

```bash
yarn test
```

## Structure

```
app.js            configuration Express, routes
bin/www           démarrage du serveur HTTP
models/           connexion MongoDB, schémas User, Organization, Service, Team, CT (créneau de travail)
routes/           users, organizations, employee, services, teams, planning, emails
modules/          checkBody (validation des champs requis)
*.test.js         tests d'intégration
```

---

## 👤 Auteurs

| 📌 **Romain Authier** </br> 📧 [dankysten](https://github.com/dankysten) | 📌 **Fabien D.** </br> 📧 [tunguskha](https://github.com/tunguskha) | 📌 **Yécine H.** </br> 📧 [yecinepro-dot](https://github.com/yecinepro-dot) |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------- | --------------------------------------------------------------------------- |
