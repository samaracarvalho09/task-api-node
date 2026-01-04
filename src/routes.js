import { randomUUID } from "node:crypto";

import { Database } from "./database.js";
import { buildRoutePath } from "./utils/build-route-path.js";

const database = new Database();

export const routes = [
  {
    method: "GET",
    path: buildRoutePath("/tasks"),
    handler: (req, res) => {
      const { search } = req.query;

      let tasks = database.select("tasks");

      if (search) {
        const searchLower = search.toLowerCase();

        tasks = tasks.filter(
          (task) =>
            task.title.toLowerCase().includes(searchLower) ||
            task.description.toLowerCase().includes(searchLower)
        );
      }

      return res.end(JSON.stringify(tasks));
    },
  },
  {
    method: "POST",
    path: buildRoutePath("/tasks"),
    handler: (req, res) => {
      const { title, description } = req.body;

      if (!title || !description) {
        return res
          .writeHead(400)
          .end(
            JSON.stringify({ error: "title e description são obrigatórios" })
          );
      }

      console.log('POST BODY:', req.body);


      const task = {
        id: randomUUID(),
        title,
        description,
        completed_at: null,
        created_at: new Date(),
        updated_at: null,
      };

      database.insert("tasks", task);
      console.log('POST BODY:', req.body);
      return res.writeHead(204).end();
    },
  },
  {
    method: "PUT",
    path: buildRoutePath("/tasks/:id"),
    handler: (req, res) => {
      const { id } = req.params;
      const { title, description } = req.body;

      const task = database.select("tasks").find((t) => t.id === id);

      if (!task) {
        return res
          .writeHead(404)
          .end(JSON.stringify({ error: "Tarefa não encontrada" }));
      }

      database.update("tasks", id, {
        ...(title && { title }),
        ...(description && { description }),
        updated_at: new Date(),
      });

      return res.writeHead(204).end();
    },
  },
  {
    method: "DELETE",
    path: buildRoutePath("/tasks/:id"),
    handler: (req, res) => {
      const { id } = req.params;

      const task = database.select("tasks").find((t) => t.id === id);

      if (!task) {
        return res
          .writeHead(404)
          .end(JSON.stringify({ error: "Tarefa não encontrada" }));
      }

      database.delete("tasks", id);

      return res.writeHead(204).end();
    },
  },
  {
    method: "PATCH",
    path: buildRoutePath("/tasks/:id/complete"),
    handler: (req, res) => {
      const { id } = req.params;

      const task = database.select("tasks").find((t) => t.id === id);

      if (!task) {
        return res
          .writeHead(404)
          .end(JSON.stringify({ error: "Tarefa não encontrada" }));
      }

      database.update("tasks", id, {
        completed_at: task.completed_at ? null : new Date(),
        updated_at: new Date(),
      });

      return res.writeHead(204).end();
    },
  },
];
