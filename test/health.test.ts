import { describe, it } from 'mocha'
import { expect } from 'chai'
import request from 'supertest'
import { createApp } from '../src/app.js'

const app = createApp()

describe('Health Check', () => {
  it('should return health status', async () => {
    const res = await request(app)
      .get('/health')
      .expect(200)

    expect(res.body).to.have.property('status', 'ok')
  })
})

