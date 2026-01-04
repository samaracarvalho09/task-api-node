import fs from 'node:fs/promises'

const databasePath = new URL('../db.json', import.meta.url)

export class Database {
  #database = {}

  constructor() {
    fs.readFile(databasePath, 'utf8')
      .then(data => {
        this.#database = JSON.parse(data)
      })
      .catch(() => {
        this.#persist()
      })
  }

  #persist() {
    fs.writeFile(databasePath, JSON.stringify(this.#database))
  }

  select(table, search) {
    let data = this.#database[table] ?? []

    if (search) {
      data = data.filter(row => {
        return Object.entries(search).some(([key, value]) => {
          return row[key].toLowerCase().includes(value.toLowerCase())
        })
      })
    }

    return data
  }

  insert(table, data) {
    if (Array.isArray(this.#database[table])) {
      this.#database[table].push(data)
    } else {
      this.#database[table] = [data]
    }

    this.#persist()

    return data
  }

update(table, id, data) {
  debugger
  // 1 Encontra o índice do registro pelo id
  const rowIndex = this.#database[table].findIndex(
    row => row.id === id
  )

  console.log(rowIndex, 'rowIndex')

  // 2️ Se não encontrou o registro, não faz nada
  // (a rota pode tratar isso e retornar 404)
  if (rowIndex === -1) {
    return false
  }

  // 3️ Recupera o registro antigo do banco
  // Aqui estão TODOS os campos:
  // id, title, description, created_at, updated_at, completed_at
  const oldRow = this.#database[table][rowIndex]

  // 4️ Atualiza o registro fazendo MERGE dos dados
  // - Mantém todos os campos antigos
  // - Sobrescreve apenas os campos enviados (PUT ou PATCH)
  this.#database[table][rowIndex] = {
    ...oldRow, // mantém title, description, created_at, etc
    ...data,   // atualiza somente o que veio na requisição
  }

  // 5️ Persiste o banco em disco (JSON)
  this.#persist()

  // 6️ Retorna true indicando sucesso
  return true
}

  delete(table, id) {
    const rowIndex = this.#database[table].findIndex(row => row.id === id)

    if (rowIndex > -1) {
      this.#database[table].splice(rowIndex, 1)
      this.#persist()
    }
  }
}
