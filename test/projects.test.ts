import { describe, it, before, after } from 'mocha'
import { expect } from 'chai'
import request from 'supertest'
import { createApp } from '../src/app.js'

const app = createApp()

describe('Projects API', () => {
  describe('GET /api/projects', () => {
    it('should return all projects', async () => {
      const res = await request(app)
        .get('/api/projects')
        .expect(200)

      expect(res.body).to.be.an('array')
    })

    it('should filter by funding status', async () => {
      const res = await request(app)
        .get('/api/projects?funding=true')
        .expect(200)

      expect(res.body).to.be.an('array')
      if (res.body.length > 0) {
        expect(res.body[0]).to.have.property('got_funding')
      }
    })

    it('should filter by startup status', async () => {
      const res = await request(app)
        .get('/api/projects?startup=true')
        .expect(200)

      expect(res.body).to.be.an('array')
      if (res.body.length > 0) {
        expect(res.body[0]).to.have.property('became_startup')
      }
    })
  })

  describe('GET /api/projects/:id', () => {
    it('should return 400 for invalid UUID', async () => {
      await request(app)
        .get('/api/projects/invalid-id')
        .expect(400)
    })

    it('should return 404 for non-existent project', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000'
      await request(app)
        .get(`/api/projects/${fakeId}`)
        .expect(404)
    })
  })

  describe('GET /api/projects/leaderboard', () => {
    it('should return leaderboard projects', async () => {
      const res = await request(app)
        .get('/api/projects/leaderboard')
        .expect(200)

      expect(res.body).to.be.an('array')
    })

    it('should accept limit parameter', async () => {
      const res = await request(app)
        .get('/api/projects/leaderboard?limit=10')
        .expect(200)

      expect(res.body).to.be.an('array')
      expect(res.body.length).to.be.at.most(10)
    })

    it('should reject invalid limit', async () => {
      await request(app)
        .get('/api/projects/leaderboard?limit=invalid')
        .expect(400)
    })

    it('should reject limit > 100', async () => {
      await request(app)
        .get('/api/projects/leaderboard?limit=101')
        .expect(400)
    })
  })

  describe('GET /api/projects/success-stories', () => {
    it('should return success stories', async () => {
      const res = await request(app)
        .get('/api/projects/success-stories')
        .expect(200)

      expect(res.body).to.be.an('array')
    })
  })
})

