import express from "express"
import mysql2 from "mysql2"
import cors from "cors"

const app = express()
app.use(express.json())
app.use(cors())

// Pool de conexão precisa existir ANTES das rotas que o usam
const sql = mysql2.createPool({
    host: "benserverplex.ddns.net",
    user: "alunos",
    password: "senhaAlunos",
    database: "alunos_filmes03TA"
})

// Rota raiz — evita o "Cannot GET /" ao acessar o domínio direto
app.get("/", (request, response) => {
    response.json({
        message: "API de filmes rodando com sucesso!",
        rotas: [
            "GET /all-movies",
            "POST /create-movie",
            "PUT /edit-movie/:id",
            "DELETE /delete-movie/:id"
        ]
    })
})

app.get("/all-movies", (request, response) => {
    const selectCommand = "SELECT * FROM filmes_nathallylucas"

    sql.query(selectCommand, (error, data) => {
        if (error) {
            console.log(error)
            response.status(500).json({ message: "Erro ao buscar filmes." })
            return
        }

        response.json(data)
    })
})

app.post("/create-movie", (request, response) => {
    const { title, age, gender, ageLimit, duration } = request.body

    if (!title || !gender) {
        response.status(400).json({ message: "Título e gênero são obrigatórios." })
        return
    }

    const insertCommand = "INSERT INTO filmes_nathallylucas (title, age, gender, ageLimit, duration) VALUES (?, ?, ?, ?, ?)"

    sql.query(insertCommand, [title, age, gender, ageLimit, duration], (error) => {
        if (error) {
            console.log(error)
            response.status(500).json({ message: "Erro ao criar filme." })
            return
        }

        response.status(201).json({
            message: "Filme criado com sucesso!"
        })
    })
})

app.delete("/delete-movie/:id", (request, response) => {
    const { id } = request.params

    const deleteCommand = "DELETE FROM filmes_nathallylucas WHERE id=?"

    sql.query(deleteCommand, [id], (error) => {
        if (error) {
            console.log(error)
            response.status(500).json({ message: "Erro ao apagar filme." })
            return
        }

        response.json({
            message: "Filme apagado com sucesso!"
        })
    })
})

app.put("/edit-movie/:id", (request, response) => {
    const { id } = request.params
    const { title, age, gender, ageLimit, duration } = request.body

    const updateCommand = "UPDATE filmes_nathallylucas SET title = ?, age = ?, gender = ?, ageLimit = ?, duration = ? WHERE id = ?"

    sql.query(updateCommand, [title, age, gender, ageLimit, duration, id], (error) => {
        if (error) {
            console.log(error)
            response.status(500).json({ message: "Erro ao editar filme." })
            return
        }

        response.json({
            message: "Filme alterado com sucesso!"
        })
    })
})

// Na Vercel o app roda como função serverless (sem listen);
// localmente (npm run dev / node server.js) continua ouvindo a porta 3000.
if (!process.env.VERCEL) {
    app.listen(3000, () => {
        console.log("Servidor rodando na porta 3000!")
    })
}

export default app