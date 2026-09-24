const API_URL = "https://filmes-nathallylucas.vercel.app"

const form = document.getElementById("movie-form")
const inputId = document.getElementById("movie-id")
const inputTitle = document.getElementById("title")
const inputAge = document.getElementById("age")
const inputGender = document.getElementById("gender")
const inputAgeLimit = document.getElementById("ageLimit")
const inputDuration = document.getElementById("duration")
const submitBtn = document.getElementById("submit-btn")
const cancelBtn = document.getElementById("cancel-btn")
const sectionFilmes = document.querySelector(".filmes")

async function buscarFilmes() {
    // acessar a rota GET do backend, trazer os filmes e inserir os filmes no HTML
    const resposta = await fetch(`${API_URL}/all-movies`)
    const filmes = await resposta.json()

    sectionFilmes.innerHTML = ""

    if (!Array.isArray(filmes) || filmes.length === 0) {
        sectionFilmes.innerHTML = "<p class='vazio'>Nenhum filme cadastrado ainda.</p>"
        return
    }

    filmes.forEach((filme) => {
        const card = document.createElement("div")
        card.innerHTML = `
            <h2>${filme.title}</h2>
            <p><strong>Ano:</strong> ${filme.age ?? "-"}</p>
            <p><strong>Gênero:</strong> ${filme.gender}</p>
            <p><strong>Duração:</strong> ${filme.duration} minutos</p>
            <p><strong>Classificação:</strong> ${filme.ageLimit > 0 ? filme.ageLimit + " anos" : "Livre"}</p>
            <div class="card-actions">
                <button class="editar" type="button">Editar</button>
                <button class="apagar" type="button">Apagar</button>
            </div>
        `

        card.querySelector(".editar").addEventListener("click", () => preencherFormularioParaEdicao(filme))
        card.querySelector(".apagar").addEventListener("click", () => apagarFilme(filme.id))

        sectionFilmes.appendChild(card)
    })
}

function preencherFormularioParaEdicao(filme) {
    inputId.value = filme.id
    inputTitle.value = filme.title
    inputAge.value = filme.age ?? ""
    inputGender.value = filme.gender
    inputAgeLimit.value = filme.ageLimit ?? 0
    inputDuration.value = filme.duration ?? ""

    submitBtn.textContent = "Salvar Alterações"
    cancelBtn.hidden = false

    form.scrollIntoView({ behavior: "smooth", block: "start" })
}

function limparFormulario() {
    form.reset()
    inputId.value = ""
    submitBtn.textContent = "Cadastrar Filme"
    cancelBtn.hidden = true
}

async function salvarFilme(event) {
    event.preventDefault()

    const dadosFilme = {
        title: inputTitle.value.trim(),
        age: inputAge.value ? Number(inputAge.value) : null,
        gender: inputGender.value.trim(),
        ageLimit: inputAgeLimit.value ? Number(inputAgeLimit.value) : 0,
        duration: inputDuration.value ? Number(inputDuration.value) : null
    }

    const idEmEdicao = inputId.value

    try {
        submitBtn.disabled = true

        if (idEmEdicao) {
            // Editar filme existente
            await fetch(`${API_URL}/edit-movie/${idEmEdicao}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(dadosFilme)
            })
        } else {
            // Cadastrar filme novo
            await fetch(`${API_URL}/create-movie`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(dadosFilme)
            })
        }

        limparFormulario()
        await buscarFilmes()
    } catch (erro) {
        console.error(erro)
        alert("Não foi possível salvar o filme. Tente novamente.")
    } finally {
        submitBtn.disabled = false
    }
}

async function apagarFilme(id) {
    const confirmar = confirm("Tem certeza que deseja apagar esse filme?")
    if (!confirmar) return

    try {
        await fetch(`${API_URL}/delete-movie/${id}`, { method: "DELETE" })
        await buscarFilmes()
    } catch (erro) {
        console.error(erro)
        alert("Não foi possível apagar o filme. Tente novamente.")
    }
}

form.addEventListener("submit", salvarFilme)
cancelBtn.addEventListener("click", limparFormulario)

buscarFilmes()