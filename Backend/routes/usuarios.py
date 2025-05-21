from flask import Blueprint, request, jsonify
from database import get_db_connection

usuarios_bp = Blueprint("usuarios", __name__)


@usuarios_bp.route("/creacion", methods=["POST"])
def crear_usuario():
    try:
        data = request.get_json()
        usuario = data.get("usuario")
        nombres = data.get("nombres")
        apellidos = data.get("apellidos")
        telefono = data.get("telefono")
        correo = data.get("correo")
        # entidad = data.get("entidad")
        rol = data.get("rol")
        contrasena = data.get("contrasena")

        if not all([usuario, nombres, apellidos, telefono, correo, rol, contrasena]):
            return jsonify({"success": False, "message": "Faltan campos requeridos"}), 400

        conn = get_db_connection()
        cursor = conn.cursor()

        query = """
            INSERT INTO usuarios (nombres, apellidos, correo, telefono, nombre_usuario, contraseña, rol)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """
        cursor.execute(query, (nombres, apellidos, correo,
                       telefono, usuario, contrasena, rol))
        conn.commit()

        cursor.close()
        conn.close()

        return jsonify({"success": True, "message": "Usuario creado correctamente"}), 201

    except Exception as e:
        print("Error al crear usuario:", e)
        return jsonify({"success": False, "message": "Error interno del servidor"}), 500


@usuarios_bp.route("/actualizacion/<int:usuario_id>", methods=["PUT"])
def actualizar_usuario(usuario_id):
    try:
        data = request.get_json()
        usuario = data.get("usuario")
        nombres = data.get("nombres")
        apellidos = data.get("apellidos")
        telefono = data.get("telefono")
        correo = data.get("correo")
        entidad = data.get("entidad")
        rol = data.get("rol")
        contrasena = data.get("contrasena")

        if not all([usuario, nombres, apellidos, telefono, correo, entidad, rol]):
            return jsonify({"success": False, "message": "Faltan campos requeridos"}), 400

        conn = get_db_connection()
        cursor = conn.cursor()

        if contrasena:
            query = """
                UPDATE usuarios
                SET nombres = %s, apellidos = %s, correo = %s, telefono = %s,
                    nombre_usuario = %s, contraseña = %s, rol = %s
                WHERE id_usuario = %s
            """
            params = (nombres, apellidos, correo, telefono,
                      usuario, contrasena, rol, usuario_id)
        else:
            query = """
                UPDATE usuarios
                SET nombres = %s, apellidos = %s, correo = %s, telefono = %s,
                    nombre_usuario = %s, rol = %s
                WHERE id_usuario = %s
            """
            params = (nombres, apellidos, correo,
                      telefono, usuario, rol, usuario_id)

        cursor.execute(query, params)
        conn.commit()

        if cursor.rowcount == 0:
            return jsonify({"success": False, "message": "Usuario no encontrado"}), 404

        cursor.close()
        conn.close()

        return jsonify({"success": True, "message": "Usuario actualizado correctamente"}), 200

    except Exception as e:
        print("Error al actualizar usuario:", e)
        return jsonify({"success": False, "message": "Error interno del servidor"}), 500


@usuarios_bp.route("/obtener", methods=["GET"])
def obtener_usuarios():
    try:
        conn = get_db_connection()
        # Usa cursor tipo diccionario
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM usuarios")
        usuarios = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(usuarios)
    except Exception as e:
        print("Error al obtener usuarios:", e)
        return jsonify({"success": False, "message": "Error al obtener usuarios"}), 500


@usuarios_bp.route("/eliminar/<int:usuario_id>", methods=["DELETE"])
def eliminar_usuario(usuario_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "DELETE FROM usuarios WHERE id_usuario = %s", (usuario_id,))
        conn.commit()
        return jsonify({"success": True, "message": "Usuario eliminado correctamente"}), 200
    except Exception as e:
        print("Error al eliminar usuario:", e)
        return jsonify({"success": False, "message": "Error al eliminar el usuario"}), 500
    finally:
        cursor.close()
        conn.close()


@usuarios_bp.route("/obtenerEntidades", methods=["GET"])
def obtener_entidades():
    try:
        conn = get_db_connection()
        # Usa cursor tipo diccionario
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM entidades")
        usuarios = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(usuarios)
    except Exception as e:
        print("Error al obtener usuarios:", e)
        return jsonify({"success": False, "message": "Error al obtener usuarios"}), 500


@usuarios_bp.route("/obtenerCategorias", methods=["GET"])
def obtener_categorias():
    try:
        conn = get_db_connection()
        # Usa cursor tipo diccionario
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM categorias")
        usuarios = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(usuarios)
    except Exception as e:
        print("Error al obtener usuarios:", e)
        return jsonify({"success": False, "message": "Error al obtener usuarios"}), 500


@usuarios_bp.route("/tickets", methods=["POST"])
def crear_ticket():
    try:
        prioridad = request.form.get("prioridad")
        titulo = request.form.get("titulo")
        descripcion = request.form.get("descripcion")
        ubicacion = request.form.get("origen")
        #adjunto = request.files.get("archivo")

        if not all([prioridad, titulo, descripcion, ubicacion]):
            return jsonify({"success": False, "message": "Faltan campos requeridos"}), 400
        conn = get_db_connection()
        cursor = conn.cursor()

        query = """
            INSERT INTO tickets (prioridad, titulo, descripcion, ubicacion)
            VALUES (%s, %s, %s, %s)
        """
        cursor.execute(query, (prioridad, titulo, descripcion,
                           ubicacion))
        conn.commit()

        cursor.close()
        conn.close()

        return jsonify({"success": True, "message": "Ticket creado correctamente"}), 201

    except Exception as e:
        print("Error al crear ticket:", e)
        return jsonify({"success": False, "message": "Error interno del servidor"}), 500
