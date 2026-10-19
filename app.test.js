const request = require("supertest");
const app = require("./app");
const mongoose = require("mongoose");
const User = require("./models/users");

it("POST /employee | Ajout employé.e en BDD", async () => {
  const michelle = {
    firstName: "Michelle",
    lastName: "Obama",
    birthDate: new Date(1964, 0, 17),
    email: "m.obama@usa.us",
    phoneNumber: "0612345678",
    address: {
      street: "12 rue de Washington",
      zipCode: "75001",
      city: "Paris",
    },
    dateContract: new Date(2026, 2, 1),
    typeContract: "CDI",
    position: "Chef.fe de cuisine",
    profil: "user",
  };

  const beyonce = {
    firstName: "Beyonce",
    lastName: "Knowles",
    birthDate: new Date(1981, 9, 4),
    email: "queenB@usa.us",
    phoneNumber: "0612345678",
    address: {
      street: "18 avenue des Stars",
      zipCode: "13007",
      city: "Marseille",
    },
    dateContract: new Date(2026, 2, 6),
    typeContract: "Interim",
    position: "Runner",
    profil: "user",
  };

  const jennifer = {
    firstName: "Jennifer",
    lastName: "Lopez",
    birthDate: new Date(1969, 6, 24),
    phoneNumber: "0612345678",
    address: {
      street: "156 boulevard de la chanson",
      zipCode: "33000",
      city: "Bordeaux",
    },
    dateContract: new Date(2026, 2, 4),
    typeContract: "CDD",
    position: "Direction",
    profil: "admin",
  };

  const res1 = await request(app).post("/employee").send(michelle);
  const res2 = await request(app).post("/employee").send(beyonce);
  const res3 = await request(app).post("/employee").send(jennifer);
  // console.log("Retour backend: ", res.body);

  // Retour ajout normal (sans secuNumber)
  expect(res1.statusCode).toBe(201);
  expect(res1.body.result).toBe(true);

  // Retour deuxième ajout sans secuNumber pour vérifier qu'on peut avoir 2 fois ce champ vide
  expect(res2.statusCode).toBe(201);
  expect(res2.body.result).toBe(true);

  // Il manque le champ e-mail : refus d'enregister en BDD
  expect(res3.statusCode).toBe(400);
  expect(res3.body.result).toBe(false);
}, 10000);

afterAll(async () => {
  // nettoyage des employés créés par le test
  await User.deleteMany({ email: { $in: ["m.obama@usa.us", "queenB@usa.us"] } });
  await mongoose.connection.close();
});
