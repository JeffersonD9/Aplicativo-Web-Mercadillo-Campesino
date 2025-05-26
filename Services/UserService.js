import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import { Roles } from "../Helpers/ValidationRoles/Roles.js";
import { EncryptPassword, ValidatePassword } from "../Helpers/EncriptedPassword/EncriptPassword.js";

/**
 * Clase de servicios para operaciones relacionadas con usuarios
 */
export class UserServices {

    constructor() {
        this.prisma = prisma;
        // this.roles = Roles;
    }
    async CreateDTOUser(req, creation = true) {
        const newUserDTO = {};
        console.log(typeof (req.body.Puesto), " ************");
        if (req.body.Nombres !== undefined) newUserDTO.Nombres = req.body.Nombres;
        if (req.body.Apellidos !== undefined) newUserDTO.Apellidos = req.body.Apellidos;
        if (req.body.Email !== undefined) newUserDTO.Email = req.body.Email;
        if (req.body.Id_Mercadillo !== undefined) newUserDTO.Id_Mercadillo = Number(req.body.Id_Mercadillo);
        if (req.body.Password !== undefined) {
            const passwordHash = await EncryptPassword(req.body.Password)
            newUserDTO.Password = passwordHash;
        }

        if (req.body.Celular !== undefined) newUserDTO.Celular = req.body.Celular;
        if (req.body.Estado !== undefined) newUserDTO.Estado = req.body.Estado;
        if (req.body.Cedula !== undefined) newUserDTO.Cedula = req.body.Cedula;
        if (creation) {
            if (req.body.Puesto !== undefined) newUserDTO.Puesto = req.body.Puesto;
            newUserDTO.Roles = Roles.VENDEDOR
        }
        console.log(newUserDTO, " DTO User");
        return newUserDTO;
    }

    //#region Metodos para admin y Vendedor

    /**
     * Valida el login de un usuario comparando email, rol y contraseña
     * @param {string} email - Email del usuario
     * @param {int} role - Rol del usuario
     * @param {string} passwordIngresada - Contraseña ingresada sin encriptar
     * @returns {Promise<Object|null>} - Usuario si la autenticación es válida, si no null
     */
    async validateUserLogin(email, role, passwordIngresada) {
        try {
            const user = await this.findUser(email, role);
            if (user == null) return null;

            const passwordCorrecta = await ValidatePassword(passwordIngresada, user.Password);
            console.log(passwordCorrecta)
            return passwordCorrecta ? user : null;
        } catch (error) {
            console.error(`Error al validar login: ${error.message}`);
            return null;
        }
    }

    /**
     * Busca un usuario por email y rol
     * @param {string} email - Email del usuario
     * @param {int} roles - Rol del usuario
     * @returns {Promise<Object|null>} - Usuario encontrado o null
     */
    async findUser(email, roles) {
        try {
            const userFound = await this.prisma.usuario.findUnique({
                where: {
                    Email: email,
                    Roles: roles
                },
            });
            return userFound;
        } catch (error) {
            console.error(`Error al buscar usuario: ${error.message}`);
            return null;
        }
    }

    /**
     * Obtiene todos los usuarios con rol de vendedor
     * @returns {Promise<Array|null>} - Lista de usuarios o null en caso de error
     */
    async getAllUsers() {
        try {
            const usersFound = await this.prisma.usuario.findMany({
                where: {
                    Roles: Roles.VENDEDOR
                },
                include: {
                    mercadillo: {
                        select: {
                            Nombre: true
                        }
                    }
                }
            });
            return usersFound;
        } catch (error) {
            console.error(`Error obtener usuarios: ${error.message}`);
            return null;
        }
    }

    /**
     * Cambia la contraseña de un usuario
     * @param {string} email - Email del usuario
     * @param {int} role - Rol del usuario
     * @param {string} newPassword - Nueva contraseña sin encriptar
     * @returns {Promise<boolean>} - true si se actualizó correctamente, false si hubo error
     */
    async changePassword(email, role, newPassword) {
        try {
            const hashedPassword = await EncryptPassword(newPassword);

            await this.prisma.usuario.update({
                where: {
                    Email: email,
                    Roles: role
                },
                data: {
                    Password: hashedPassword,
                }
            });

            console.log(`Contraseña actualizada para el usuario ${email}`);
            return true;
        } catch (error) {
            console.error(`Error al cambiar contraseña: ${error.message}`);
            return false;
        }
    }

    /**
     * Valida si un administrador tiene una sesión válida
     * @param {Request} req - Objeto de solicitud 
     * @returns {Promise<Object|null>} - Admin encontrado o null
     */
    async validateSession(userId) {
        try {

            const userFound = await this.prisma.usuario.findUnique({
                where: {
                    Id: userId.id,
                },
                include: {
                    mercadillo: true // Esto incluye los datos del mercadillo relacionado
                }
            });


            return userFound;
        } catch (error) {
            console.error(`Error al validar sesión: ${error.message}`);
            return null;
        }
    }

    //#endregion

    /**
     * Actualiza los datos de un usuario con rol de vendedor
     * @param {int} idUsuario - ID del usuario
     * @param {object} data - Objeto con los nuevos datos del usuario
     * @returns {Promise<object>} - Usuario actualizado
     */
    async ActualizarVendedor(idUsuario, req) {
        const role = Roles.VENDEDOR;

        const userDTO = await this.CreateDTOUser(req);

        console.log("Data ", userDTO);

        const userFound = await prisma.usuario.update({
            where: {
                Id: idUsuario,
                Roles: role
            },
            data: userDTO
        });

        return userFound;
    }

    /**
     * Elimina un usuario por su ID
     * @param {int} id_usuario - ID del usuario a eliminar
     * @returns {Promise<Object>} - Resultado de la eliminación
     * @throws {Error} - Si el usuario no existe o hay un error al eliminar
     */
    async deleteUser(id_usuario) {
        try {    
            const userId = parseInt(id_usuario);
            if (isNaN(userId) || userId <= 0) {
                throw new Error('ID de usuario inválido');
            }
        
            const usuarioExiste = await prisma.usuario.findUnique({
                where: {
                    Id: userId
                },
                include: {
                    productospersonalizados: true
                }
            });

            if (!usuarioExiste) {
                throw new Error(`Usuario con ID ${userId} no encontrado`);
            }

            const resultado = await prisma.$transaction(async (tx) => {
                if (usuarioExiste.productospersonalizados.length > 0) {
                    await tx.productospersonalizados.deleteMany({
                        where: {
                            Id_Usuario: userId
                        }
                    });
                }
        
                const usuarioEliminado = await tx.usuario.delete({
                    where: {
                        Id: userId
                    }
                });

                return usuarioEliminado;
            });

            return {
                success: true,
                message: `Usuario con ID ${userId} eliminado correctamente`,
                data: resultado
            };

        } catch (error) {
            console.error(`Error al eliminar usuario: ${error.message}`);
            
            if (error.code === 'P2003') {
                throw new Error('No se puede eliminar el usuario debido a restricciones de integridad referencial');
            }

            if (error.code === 'P2025') {
                throw new Error('El usuario no existe o ya fue eliminado');
            }

            throw new Error(`Error al eliminar usuario: ${error.message}`);
        }
    }

    /**
     * Obtiene el rol de un usuario dado su email
     * @param {string} Email - Email del usuario
     * @returns {Promise<int|null>} - Rol del usuario o null si hay error
     */
    async findRole(Email) {
        try {

            const userFound = await this.prisma.usuario.findUnique({
                where: {
                    Email: Email,
                },
            });

            if (userFound == undefined)
                return null;

            return userFound.Roles;
        } catch (error) {
            console.error(`Error al buscar usuario: ${error.message}`);
            return null;
        }
    }

    async Create(req) {
        try {

            const userDTO = await this.CreateDTOUser(req, true);
            if (userDTO.Password == null || userDTO == null)
                return null;

            const newUser = await prisma.usuario.create({
                data: userDTO
            });

            return newUser;
        } catch (error) {
            console.log(error)
            return null;

        }
    }
}
