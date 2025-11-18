import { describe, it } from 'mocha'
import { expect } from 'chai'
import request from 'supertest'
import { createApp } from '../src/app.js'

const app = createApp()

describe('Stats API', () => {
  describe('GET /api/stats', () => {
    it('should return stats object', async () => {
      const res = await request(app)
        .get('/api/stats')
        .expect(200)

      expect(res.body).to.have.property('total_projects')
      expect(res.body).to.have.property('got_funding')
      expect(res.body).to.have.property('became_startups')
      expect(res.body).to.have.property('has_users')

      expect(res.body.total_projects).to.be.a('number')
      expect(res.body.got_funding).to.be.a('number')
      expect(res.body.became_startups).to.be.a('number')
      expect(res.body.has_users).to.be.a('number')
    })
  })
})

