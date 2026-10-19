const request = require("supertest");
const app = require("./app");
const connectionPromise = require("./models/connection");
const mongoose = require("mongoose");
const User = require("./models/users");

const email = "testunitable@gmail.com";

beforeAll(async () => {
  await connectionPromise;
  // Utilisateur de test (créé s'il n'existe pas déjà)
  await request(app).post("/users/signup").send({
    email,
    password: "test-password",
    firstName: "Test",
    lastName: "Unitable",
  });
});

afterAll(async () => {
  await User.deleteOne({ email });
  await mongoose.connection.close();
});

it("GET /users by Email", async () => {
  const res = await request(app).get(`/users/search/by/${email}`);

  expect(res.statusCode).toBe(200);
  expect(res.body.user).toEqual(
    expect.objectContaining({
      _id: expect.any(String),
      lastName: expect.any(String),
      firstName: expect.any(String),
      email,
      token: expect.any(String),
    }),
  );
  // le hash du mot de passe ne doit jamais être renvoyé
  expect(res.body.user.password).toBeUndefined();
});
