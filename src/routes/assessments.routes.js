const { Router } = require("express")
const assessmentsRoutes = Router()
const AssessmentsController = require("../Controllers/AssessmentsController")
const assessmentsController = new AssessmentsController()
const ensureAuthenticated = require("../middlewares/ensureAuthenticated")

assessmentsRoutes.post("/", ensureAuthenticated, assessmentsController.create)
assessmentsRoutes.put("/", ensureAuthenticated, assessmentsController.update)
assessmentsRoutes.put("/:id_user", ensureAuthenticated, assessmentsController.updateTwo)
assessmentsRoutes.get("/:id_professional", ensureAuthenticated, assessmentsController.show)
assessmentsRoutes.get("/", assessmentsController.index)
assessmentsRoutes.delete("/", ensureAuthenticated, assessmentsController.delete)

module.exports = assessmentsRoutes