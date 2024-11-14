const { expect } = require('@jest/globals');
const supertest = require('supertest');
const app = require('../server');
const results = require("./results.json")

// test('GET /top10movies', async () => {
//   await supertest(app).get('/top10movies')
//     .expect(200)
//     .then((res) => {
//       expect(res.body).toStrictEqual({
//         movieID: expect.any(Number),
//         title: expect.any(String),
//         average_rating: expect.any(Number),
//         n_rating: expect.any(Number),
//     });
// });
// }, 20000);

test('GET /top10bygenre/Comedy', async () => {
  await supertest(app).get('/top10bygenre/Comedy')
    .expect(200)
    .then((res) => {
      expect(res.body).toStrictEqual({
        movieID: expect.any(Number),
        title: expect.any(String),
        genre: expect.any(String),
        average_rating: expect.any(String),
        n_rating: expect.any(Number),
    });
});
}, 20000);

