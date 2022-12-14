const { hash, compare } = require("bcrypt")
const AppError = require("../utils/AppError")
const sqliteConnection = require("../database/sqlite")

class UsersController {
  async create(request, response) {
    const { name, email, password } = request.body
    const database = await sqliteConnection()
    const checkUserExists = await database.get("SELECT * FROM users WHERE email = (?)", [email])
    if (checkUserExists) {
      throw new AppError("Este E-mail está em uso!")
    }
    if (!name) {
      throw new AppError("Nome é obrigatório")
    }
    const hashedPassword = await hash(password, 8)
    await database.run("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", [name, email, hashedPassword])

    return response.status(201).json()
  }

  async update(request, response) { //funcionalidade de atualização do usuário
    const { name, email, queixas, password, old_password } = request.body //pegando o corpo da requisição
    const user_id = request.user.id; //acessando a propriedade que foi criada no middleware que contem o id do usuário que foi extraído do token
    //const { id } = request.params; //o id está sendo pego do caminho, pois ele foi colocado como parâmetro
    const database = await sqliteConnection() //fazendo conexão com o banco de dados
    const user = await database.get("SELECT * FROM users WHERE id = (?)", [user_id]) //selecionando todos as colunas da linha que tem o respectivo id
    if (!user) { //caso o usuário não exista vai entrar nas chaves
      throw new AppError("Usuário não encontrado!")
    }
    const userWithUpdatedEmail = await database.get("SELECT * FROM users WHERE email = (?)", [email]) //selecionando todas as colunas da linha que tem o respectivo email
    if (userWithUpdatedEmail && userWithUpdatedEmail.id !== user.id) { //verificando se a pessoa está tentando mudar um email pra outro que é usado por outra pessoa
      throw new AppError("Este e-mail já está em uso!")
    }
    user.name = name ?? user.name //atualizando o nome do user que foi pego através do id - a interrogação significa que se não existir conteúdo dentro de name então vai ser utilizado o user.name - as interrogações é um null operator
    user.email = email ?? user.email //atualizando o email do user
    user.queixas = queixas ?? user.queixas

    if (password && !old_password) {
      throw new AppError("Você precisa informar a senha antiga para definir a nova senha!")
    }

    if (password && old_password) {
      const checkOldPassword = await compare(old_password, user.password) //comparando se a senha antiga inserida pelo usuário (old_password) é igual a que está no banco de dados (user.password) - compare é uma funcionalidade de bcrypt que serve para comparar senhas, é possível comparar a senha que está criptografada no banco de dados (user.password) com a senha que não está que foi inserida pelo usuário (old_password)
      if (!checkOldPassword) { //se caso a senha digitada pelo usuário não for igual a do banco de dados, vai entrar nas chaves
        throw new AppError("A senha antiga não confere!")
      }
      user.password = await hash(password, 8) //atualizando a senha caso passe por todas as verificações e criptografando ela com a função hash
    }

    await database.run(`
    UPDATE users SET 
    name = ?, 
    email = ?,
    password = ?, 
    queixas = ?,
    update_at = DATETIME('now')
    WHERE id = ?`,
      [user.name, user.email, user.password, user.queixas, user_id]); //aqui está sendo atualizado o banco de dados, são comandos SQL (UPDATE users SET) pra atualizar o banco de dados - WHERE é pra identificar a linha específica que será modificado o valor das colunas - DATETIME() é uma função do banco de dados que pega o momento atual (data e hora), estamos fazendo isso porque a função Date() do JS tem um padrão de escrever a data e hora diferente da função do banco de dados
    return response.json()
  }
}
module.exports = UsersController;