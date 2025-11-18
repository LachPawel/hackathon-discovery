// Mock Supabase client for tests
// This prevents tests from writing to the real database

export const createMockSupabaseClient = () => {
  const mockData: Record<string, any[]> = {
    projects: [],
    founders: [],
    project_founders: []
  }

  const createMockQuery = (table: string) => {
    const queryState: any = {
      _table: table,
      _select: '*',
      _filters: [],
      _order: null,
      _limit: null,
      _single: false,
      _maybeSingle: false,
      _insert: null,
      _update: null,
      _upsert: null,
      _or: null
    }

    const query: any = {
      select: (columns: string = '*') => {
        queryState._select = columns
        return query
      },
      from: (tableName: string) => {
        queryState._table = tableName
        return query
      },
      eq: (column: string, value: any) => {
        queryState._filters = queryState._filters || []
        queryState._filters.push({ type: 'eq', column, value })
        return query
      },
      neq: (column: string, value: any) => {
        queryState._filters = queryState._filters || []
        queryState._filters.push({ type: 'neq', column, value })
        return query
      },
      not: (column: string, operator: string, value: any) => {
        queryState._filters = queryState._filters || []
        queryState._filters.push({ type: 'not', column, operator, value })
        return query
      },
      or: (condition: string) => {
        queryState._or = condition
        return query
      },
      order: (column: string, options?: { ascending?: boolean; nullsFirst?: boolean }) => {
        queryState._order = { column, ...options }
        return query
      },
      limit: (count: number) => {
        queryState._limit = count
        return query
      },
      single: () => {
        queryState._single = true
        return query
      },
      maybeSingle: () => {
        queryState._maybeSingle = true
        return query
      },
      insert: (data: any[]) => {
        queryState._insert = data
        return query
      },
      update: (data: any) => {
        queryState._update = data
        return query
      },
      upsert: (data: any[], options?: any) => {
        queryState._upsert = { data, options }
        return query
      },
      is: (column: string, value: any) => {
        queryState._filters = queryState._filters || []
        queryState._filters.push({ type: 'is', column, value })
        return query
      },
      ilike: (column: string, pattern: string) => {
        queryState._filters = queryState._filters || []
        queryState._filters.push({ type: 'ilike', column, pattern })
        return query
      }
    }

    // Execute the query and return a Promise
    const executeQuery = async () => {
      // Start with all data from the table
      let results = [...(mockData[queryState._table] || [])]

      // Apply filters BEFORE any other operations
      if (queryState._filters && queryState._filters.length > 0) {
        for (const filter of queryState._filters) {
          if (filter.type === 'eq') {
            results = results.filter((r: any) => {
              const match = r[filter.column] === filter.value
              return match
            })
          } else if (filter.type === 'neq') {
            results = results.filter((r: any) => r[filter.column] !== filter.value)
          } else if (filter.type === 'is') {
            if (filter.value === null) {
              results = results.filter((r: any) => r[filter.column] === null || r[filter.column] === undefined)
            }
          } else if (filter.type === 'not') {
            if (filter.operator === 'is' && filter.value === null) {
              results = results.filter((r: any) => r[filter.column] !== null && r[filter.column] !== undefined)
            }
          } else if (filter.type === 'ilike') {
            const pattern = filter.pattern.replace(/%/g, '.*')
            const regex = new RegExp(pattern, 'i')
            results = results.filter((r: any) => regex.test(r[filter.column] || ''))
          }
        }
      }

      // Apply OR conditions
      if (queryState._or) {
        const orParts = queryState._or.split(',')
        results = results.filter((r: any) => {
          return orParts.some((part: string) => {
            const trimmed = part.trim()
            if (trimmed.includes('got_funding.eq.true')) {
              return r.got_funding === true
            }
            if (trimmed.includes('became_startup.eq.true')) {
              return r.became_startup === true
            }
            return false
          })
        })
      }

      // Apply ordering
      if (queryState._order) {
        results.sort((a: any, b: any) => {
          const aVal = a[queryState._order.column]
          const bVal = b[queryState._order.column]
          if (aVal === null || aVal === undefined) return queryState._order.nullsFirst === false ? 1 : -1
          if (bVal === null || bVal === undefined) return queryState._order.nullsFirst === false ? -1 : 1
          const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0
          return queryState._order.ascending === false ? -comparison : comparison
        })
      }

      // Handle insert/update/upsert
      if (queryState._insert) {
        const newItems = queryState._insert.map((item: any) => ({
          id: item.id || `mock-${Date.now()}-${Math.random()}`,
          ...item,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }))
        mockData[queryState._table].push(...newItems)
        return { data: queryState._single ? newItems[0] : newItems, error: null }
      }

      if (queryState._update) {
        // For update, we need to find the items first (they should be filtered already)
        const updated = results.map((item: any) => ({ ...item, ...queryState._update }))
        // Update in the original array
        updated.forEach((updatedItem: any) => {
          const index = mockData[queryState._table].findIndex((item: any) => item.id === updatedItem.id)
          if (index >= 0) {
            mockData[queryState._table][index] = updatedItem
          }
        })
        return { data: queryState._single ? updated[0] : updated, error: null }
      }

      if (queryState._upsert) {
        const upsertData = queryState._upsert.data[0]
        const conflictKey = queryState._upsert.options?.onConflict || 'id'
        const existingIndex = mockData[queryState._table].findIndex(
          (item: any) => item[conflictKey] === upsertData[conflictKey]
        )
        if (existingIndex >= 0) {
          mockData[queryState._table][existingIndex] = {
            ...mockData[queryState._table][existingIndex],
            ...upsertData,
            updated_at: new Date().toISOString()
          }
          return { data: mockData[queryState._table][existingIndex], error: null }
        } else {
          const newItem = {
            id: upsertData.id || `mock-${Date.now()}-${Math.random()}`,
            ...upsertData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
          mockData[queryState._table].push(newItem)
          return { data: newItem, error: null }
        }
      }

      // Apply limit
      if (queryState._limit) {
        results = results.slice(0, queryState._limit)
      }

      // Handle single/maybeSingle - must be checked BEFORE returning results
      if (queryState._single) {
        if (results.length === 0) {
          return {
            data: null,
            error: { code: 'PGRST116', message: 'No rows found' }
          }
        }
        return { data: results[0], error: null }
      }

      if (queryState._maybeSingle) {
        if (results.length === 0) {
          return { data: null, error: null }
        }
        return { data: results[0], error: null }
      }

      return { data: results, error: null }
    }

    // Make it a Promise-like object that can be awaited
    // Create the promise immediately but don't execute until awaited
    const promise = Promise.resolve().then(() => executeQuery())
    
    // Bind Promise methods to make it awaitable
    query.then = promise.then.bind(promise)
    query.catch = promise.catch.bind(promise)
    query.finally = promise.finally.bind(promise)
    
    // Also make it directly awaitable
    Object.setPrototypeOf(query, Promise.prototype)
    
    return query
  }

  return {
    from: (table: string) => createMockQuery(table),
    // Expose mockData for test setup
    _mockData: mockData
  }
}
