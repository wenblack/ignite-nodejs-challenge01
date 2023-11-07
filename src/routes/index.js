import { randomUUID } from 'node:crypto'
import { Database } from '../database.js'
import { buildRoutePath } from '../utils/build-route-path.js'
import fs from 'fs';
import { parse } from 'csv-parse';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));


const database = new Database()
const processFile = async () => {
  const records = [];
  const parser = fs
    .createReadStream(`${__dirname}/test.csv`)
    .pipe(parse({

    }));
  for await (const record of parser) {
    // Work with each record
    records.push(record);
  }
  return records;
}

export const routes = [
  {
    method: 'GET',
    path: buildRoutePath('/tasks'),
    handler: (req, res) => {
      const { search } = req.query
      const tasks = database.select('tasks', search ? {
        title: search,
        description: search
      } : null)

      return res.end(JSON.stringify(tasks))
    }
  },
  {
    method: 'PATCH',
    path: buildRoutePath('/tasks/:id'),
    handler: (req, res) => {
      const { id } = req.params
      const d = new Date()
      let dataFormatted = `${d.getDate()}/${d.getMonth() + 1}  ${d.getHours()}:${d.getMinutes()}`
      const created_at_date = database.select('tasks', id ? { id } : null)
      let date = created_at_date[0].created_at
      let title = created_at_date[0].title
      let description = created_at_date[0].description
      let update = created_at_date[0].created_at

      if (created_at_date[0].completed_at === null) {
        database.update('tasks', id, {
          title: title,
          description: description,
          completed_at: dataFormatted,
          created_at: date,
          updated_at: dataFormatted
        })
      } else {
        database.update('tasks', id, {
          title: title,
          description: description,
          completed_at: null,
          created_at: date,
          updated_at: dataFormatted
        })
      }

      return res.writeHead(204).end()
    }
  },
  {
    method: 'POST',
    path: buildRoutePath('/tasks'),
    handler: (req, res) => {
      const d = new Date()
      let dataFormatted = `${d.getDate()}/${d.getMonth() + 1}  ${d.getHours()}:${d.getMinutes()}`
      const { title, description } = req.body

      const task = {
        id: randomUUID(),
        title,
        description,
        completed_at: null,
        created_at: dataFormatted,
        updated_at: dataFormatted
      }

      database.insert('tasks', task)

      return res.writeHead(201).end()
    }
  },
  {
    method: 'PUT',
    path: buildRoutePath('/tasks/:id'),
    handler: (req, res) => {
      const { id } = req.params
      const { title, description } = req.body
      const d = new Date()
      let dataFormatted = `${d.getDate()}/${d.getMonth() + 1}  ${d.getHours()}:${d.getMinutes()}`


      const created_at_date = database.select('tasks', id ? { id } : null)
      let date = created_at_date[0].created_at
      database.update('tasks', id, {
        title,
        description,
        completed_at: null,
        created_at: date,
        updated_at: dataFormatted
      })

      return res.writeHead(204).end()
    }
  },
  {
    method: 'DELETE',
    path: buildRoutePath('/tasks/:id'),
    handler: (req, res) => {
      const { id } = req.params
      database.delete('tasks', id)
      return res.writeHead(204).end()
    }
  },
  {
    method: 'POST',
    path: buildRoutePath('/upload'),
    handler: (req, res) => {
      (async () => {
        const records = await processFile();
        records.map((item) => {
          const d = new Date()
          let dataFormatted = `${d.getDate()}/${d.getMonth() + 1}  ${d.getHours()}:${d.getMinutes()}`
          let title = item[0]
          let description = item[1]

          const task = {
            id: randomUUID(),
            title: title,
            description: description,
            completed_at: null,
            created_at: dataFormatted,
            updated_at: dataFormatted
          }
          database.insert('tasks', task)
        })
        console.log(database.select('tasks'))
      })()
      return res.writeHead(204).end()
    }
  }
]