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
            task.description.toLowerCase().includes(searchLower),
        );
      }

      return res.writeHead(200, { "Content-Type": "application/json" }).end(
        JSON.stringify({
          success: true,
          data: {
            total: tasks.length,
            tasks,
          },
        }),
      );
    },
  },
  {
    method: "GET",
    path: buildRoutePath("/context-tasks"),
    handler: (req, res) => {
      const context = {
        prioridade: [
          { id: 1, nome: "Baixa" },
          { id: 2, nome: "Média" },
          { id: 3, nome: "Alta" },
        ],
        categoria: [
          { id: 1, nome: "Trabalho" },
          { id: 2, nome: "Estudos" },
          { id: 3, nome: "Pessoal" },
        ],
      };

      return res.writeHead(200, { "Content-Type": "application/json" }).end(
        JSON.stringify({
          success: true,
          data: context,
        }),
      );
    },
  },
  {
    method: "POST",
    path: buildRoutePath("/tasks"),
    handler: (req, res) => {
      const { title, description, dueDate, categoriaId, prioridadeId } =
        req.body;

      if (!title || !description) {
        return res.writeHead(400, { "Content-Type": "application/json" }).end(
          JSON.stringify({
            success: false,
            error: "title e description são obrigatórios",
          }),
        );
      }

      const task = {
        id: randomUUID(),
        title,
        description,
        categoriaId: categoriaId ?? null,
        prioridadeId: prioridadeId ?? null,
        dueDate: dueDate ? new Date(dueDate) : null,
        completedAt: null,
        createdAt: new Date(),
        updatedAt: null,
      };

      database.insert("tasks", task);

      return res.writeHead(201, { "Content-Type": "application/json" }).end(
        JSON.stringify({
          success: true,
          data: task,
        }),
      );
    },
  },

  {
    method: "PUT",
    path: buildRoutePath("/tasks/:id"),
    handler: (req, res) => {
      const { id } = req.params;
      const { title, description, dueDate, categoriaId, prioridadeId } =
        req.body;

      const task = database.select("tasks").find((t) => t.id === id);

      if (!task) {
        return res.writeHead(404, { "Content-Type": "application/json" }).end(
          JSON.stringify({
            success: false,
            error: "Tarefa não encontrada",
          }),
        );
      }

      database.update("tasks", id, {
        ...(title && { title }),
        ...(description && { description }),
        ...(dueDate && { dueDate: new Date(dueDate) }),
        ...(categoriaId && { categoriaId }),
        ...(prioridadeId && { prioridadeId }),
        updatedAt: new Date(),
      });

      return res.writeHead(200, { "Content-Type": "application/json" }).end(
        JSON.stringify({
          success: true,
          message: "Tarefa atualizada com sucesso",
        }),
      );
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

      return res.writeHead(200, { "Content-Type": "application/json" }).end(
        JSON.stringify({
          success: true,
          message: "Tarefa removida com sucesso",
        }),
      );
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
        completedAt: task.completedAt ? null : new Date(),
        updatedAt: new Date(),
      });

      return res.writeHead(200).end(
        JSON.stringify({
          success: true,
          data: {
            ...task,
            completedAt: task.completedAt ? null : new Date(),
            updatedAt: new Date(),
          },
          message: "Status da tarefa atualizado",
        }),
      );
    },
  },
];
