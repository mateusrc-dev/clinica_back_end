exports.up = knex => knex.schema.createTable("horáriosSábado", table => {
  table.increments("id")
  table.integer("duração")
  table.integer("horário")
  table.text("disponibilidade")
  table.integer("id_profissional").references("id").inTable("profissionais")
})

exports.down = knex => knex.schema.dropTable("horáriosSábado")