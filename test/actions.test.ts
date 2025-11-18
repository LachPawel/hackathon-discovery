import { describe, it } from 'mocha'
import { expect } from 'chai'
import request from 'supertest'
import { createApp } from '../src/app.js'

const app = createApp()

describe('Actions API', () => {
  describe('POST /api/scrape', () => {
    it('should require URL in body', async () => {
      await request(app)
        .post('/api/scrape')
        .send({})
        .expect(400)
    })

    it('should reject invalid URL', async () => {
      await request(app)
        .post('/api/scrape')
        .send({ url: 'not-a-url' })
        .expect(400)
    })

    it('should accept valid URL', async () => {
      const res = await request(app)
        .post('/api/scrape')
        .send({ url: 'https://example.com/hackathon' })
        .expect(200)

      expect(res.body).to.have.property('message')
      expect(res.body).to.have.property('url')
    })
  })

  describe('POST /api/research/:id', () => {
    it('should return 400 for invalid UUID', async () => {
      await request(app)
        .post('/api/research/invalid-id')
        .expect(400)
    })

    it('should return 404 for non-existent project', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000'
      await request(app)
        .post(`/api/research/${fakeId}`)
        .expect(404)
    })
  })
})

