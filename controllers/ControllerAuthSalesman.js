import { CreateAccesToken } from "../Services/CreateToken.js";
import { enviar_email } from "../templateCorreo/envioPassword.js";
import { UserServices } from "../Services/UserService.js";
import { Roles } from "../Helpers/ValidationRoles/Roles.js";

const service = new UserServices();
const role = Roles.VENDEDOR;

export async function LoginSalesman(req, res) {

  const { Email, Password } = req.body;

  try {

    const nameToken = Email.split('@')[0];
    const userValidate = await service.validateUserLogin(Email, role, Password);

    if (userValidate == null)
      return res.status(400).json({ message: "Invalidate Credentials" });

    const token = await CreateAccesToken({
      id: userValidate.Id,
      role: role,
      Name: nameToken,
    });

    res.cookie("token", token);
    res.status(201).send({
      UserName: nameToken,
      redirect: "Usuario",
    });
  } catch (error) {
    res.status(500).json({ message: error });
  }
}

export async function ProfileSalesman(req, res) {

  try {

    if (!req.user.Name || !req.user || !req.user.role) {
      return res.status(400).json({ message: "Datos incompletos o inválidos" });
    }

    const userFound = await service.validateSession(req.user);
    console.log(userFound)
    if (userFound == null) {
      return res.status(401).json({ message: "Usuario no encontrado" });
    }

    return res.render("Campesino/campesino", {
      UserName: userFound.Nombres,
      index: "Usuario",
      body: "campesino",
      userFound,
    });

  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Internal error" });
  }
}

//Enviar contraseña al correo

export async function EnviarCorreo(req, res) {
  try {
    const Email = req.body.Email;
    const nameToken = Email;
    

    const userFound = await service.findUser(Email, role);
    console.log(userFound);
    if (userFound == null) {
      return res.status(400).json({ message: `Solicitud rechazada` });
    }

    const token = await CreateAccesToken({
      id: userFound.Id,
      userName: nameToken,
    });

    enviar_email(Email, token);
    res.status(200).json({ message: "Correo Enviado" });
  } catch (error) {
    res.status(500).json({ message: error });
  }
}

//form
export async function FromCambiarPassword(req, res) {

  return res.render("Email/enviarTokenEmail");

}

export async function RestablecerPassword(req, res) {
  return res.render("Email/cambiarPassword");
}

export async function ActualizarPassword(req, res) {

  try {

    const { Email, Password } = req.body;
    console.log(req.body);

    const userFound = await service.findUser(Email, role, Password);

    if (userFound == null)
      return res.status(400).json({ message: "Invalidate Credentials" });

    const usuarioActualizado = await service.changePassword(Email, role, Password);
    console.log(usuarioActualizado);

    if (!usuarioActualizado) {
      return res
        .status(400)
        .json({ message: "Error al actualizar el usuario" });
    }
    return res.status(200).send({ redirect: "/MercadilloBucaramanga/Login" });
  } catch (error) {
    res.status(500).json({ message: error });
  }
}

export async function UpdateVendedor(req, res) {
  try {
    const data = req.body;

    const id_vendedor = parseInt(req.params.id_vendedor, 10);
    
    if (isNaN(id_vendedor)) {
      return res.status(400).json({ message: "ID de vendedor inválido" });
    }

    // if (!data || Object.keys(data).length === 0) {
    //   return res.status(400).json({ message: "Datos de actualización vacíos" });
    // }

    const userfound = await service.ActualizarVendedor(id_vendedor, req);

    if (userfound == null) {
      return res.status(400).json({ message: "Error al actualizar el vendedor" });
    }


    return res.status(200).json({ message: "Vendedor actualizado correctamente"});

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
}
