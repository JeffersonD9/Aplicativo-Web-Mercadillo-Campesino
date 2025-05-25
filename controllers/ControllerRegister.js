import { CreateAccesToken } from "../Services/CreateToken.js";
import { UserServices } from "../Services/UserService.js";
const service = new UserServices();

async function Register(req, res) {
  const { Email } = req.body;

  try {

    const newUser = await service.Create(req);
  
    if (newUser == null)
      return res.status(400).json({ message: "Error al crear el usuario" });
    console.log(newUser);
    res.status(201).json({
            success: true,
            message: "Campesino Creado Correctamente",
            newUser
        });

    // const token = await CreateAccesToken({ id: newUser.Id, UserName: nameToken, });

    // res.cookie("token", token);
    // res.status(201).send({ nameToken, Email, redirect: "Usuario", });
  } catch (error) {
    if (
      error.code == "P2002" &&
      error.meta.target.includes("Usuario_Email_key")
    ) {
      res.status(409).json({
        error: {
          message: `El correo ingresado ${Email} ya esta existe`,
          code: "CONFLICT",
          details: error.meta.target,
        },
      });
    } else {
      res.status(500).send("Algo salio mal");
      console.log(error);
    }
  }
}

export { Register };
