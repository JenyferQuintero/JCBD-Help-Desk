from flask import Blueprint, request, jsonify
from database import get_db_connection

usuarios_bp = Blueprint("usuarios", __name__)

@usuarios_bp.route("/creacion", methods=["POST"])
def crear_usuario():
    try:
        data = request.get_json()
        nombre_usuario = data.get("nombre_usuario")
        nombre_completo = data.get("nombre_completo")
        telefono = data.get("telefono")
        correo = data.get("correo")
        id_entidad = data.get("id_entidad")
        rol = data.get("rol")
        contrasena = data.get("contrasena")
        estado = data.get("estado", "activo")  # Valor por defecto "activo"

        # Validar campos requeridos
        campos_requeridos = [
            nombre_usuario, 
            nombre_completo, 
            telefono, 
            correo, 
            rol, 
            contrasena
        ]
        
        if not all(campos_requeridos):
            return jsonify({
                "success": False, 
                "message": "Faltan campos requeridos"
            }), 400

        conn = get_db_connection()
        cursor = conn.cursor()

        # Verificar si el nombre de usuario ya existe
        cursor.execute("SELECT id_usuario FROM usuarios WHERE nombre_usuario = %s", (nombre_usuario,))
        if cursor.fetchone():
            return jsonify({
                "success": False, 
                "message": "El nombre de usuario ya existe"
            }), 400

        # Verificar si el correo ya existe
        cursor.execute("SELECT id_usuario FROM usuarios WHERE correo = %s", (correo,))
        if cursor.fetchone():
            return jsonify({
                "success": False, 
                "message": "El correo ya está registrado"
            }), 400

        query = """
            INSERT INTO usuarios (
                nombre_usuario, 
                nombre_completo, 
                correo, 
                telefono, 
                contraseña, 
                rol, 
                estado, 
                id_entidad1
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """
        cursor.execute(query, (
            nombre_usuario, 
            nombre_completo, 
            correo, 
            telefono, 
            contrasena, 
            rol, 
            estado, 
            id_entidad
        ))
        conn.commit()

        nuevo_id = cursor.lastrowid

        cursor.close()
        conn.close()

        return jsonify({
            "success": True, 
            "message": "Usuario creado correctamente",
            "id_usuario": nuevo_id
        }), 201

    except Exception as e:
        print("Error al crear usuario:", e)
        return jsonify({
            "success": False, 
            "message": "Error interno del servidor"
        }), 500

@usuarios_bp.route("/actualizacion/<int:usuario_id>", methods=["PUT"])
def actualizar_usuario(usuario_id):
    try:
        data = request.get_json()
        nombre_usuario = data.get("nombre_usuario")
        nombre_completo = data.get("nombre_completo")
        telefono = data.get("telefono")
        correo = data.get("correo")
        id_entidad = data.get("id_entidad")
        rol = data.get("rol")
        contrasena = data.get("contrasena")
        estado = data.get("estado", "activo")

        # Validar campos requeridos
        campos_requeridos = [
            nombre_usuario, 
            nombre_completo, 
            telefono, 
            correo, 
            rol
        ]
        
        if not all(campos_requeridos):
            return jsonify({
                "success": False, 
                "message": "Faltan campos requeridos"
            }), 400

        conn = get_db_connection()
        cursor = conn.cursor()

        # Verificar si el usuario existe
        cursor.execute("SELECT id_usuario FROM usuarios WHERE id_usuario = %s", (usuario_id,))
        if not cursor.fetchone():
            return jsonify({
                "success": False, 
                "message": "Usuario no encontrado"
            }), 404

        # Verificar si el nuevo nombre de usuario ya existe (excluyendo el actual)
        cursor.execute(
            "SELECT id_usuario FROM usuarios WHERE nombre_usuario = %s AND id_usuario != %s", 
            (nombre_usuario, usuario_id)
        )
        if cursor.fetchone():
            return jsonify({
                "success": False, 
                "message": "El nombre de usuario ya está en uso"
            }), 400

        # Verificar si el nuevo correo ya existe (excluyendo el actual)
        cursor.execute(
            "SELECT id_usuario FROM usuarios WHERE correo = %s AND id_usuario != %s", 
            (correo, usuario_id)
        )
        if cursor.fetchone():
            return jsonify({
                "success": False, 
                "message": "El correo ya está registrado"
            }), 400

        # Construir la consulta según si se actualiza contraseña o no
        if contrasena:
            query = """
                UPDATE usuarios
                SET nombre_usuario = %s, 
                    nombre_completo = %s, 
                    correo = %s, 
                    telefono = %s, 
                    contraseña = %s, 
                    rol = %s, 
                    estado = %s, 
                    id_entidad1 = %s
                WHERE id_usuario = %s
            """
            params = (
                nombre_usuario, 
                nombre_completo, 
                correo, 
                telefono,
                contrasena, 
                rol, 
                estado, 
                id_entidad, 
                usuario_id
            )
        else:
            query = """
                UPDATE usuarios
                SET nombre_usuario = %s, 
                    nombre_completo = %s, 
                    correo = %s, 
                    telefono = %s, 
                    rol = %s, 
                    estado = %s, 
                    id_entidad1 = %s
                WHERE id_usuario = %s
            """
            params = (
                nombre_usuario, 
                nombre_completo, 
                correo,
                telefono, 
                rol, 
                estado, 
                id_entidad, 
                usuario_id
            )

        cursor.execute(query, params)
        conn.commit()

        if cursor.rowcount == 0:
            return jsonify({
                "success": False, 
                "message": "No se realizaron cambios"
            }), 400

        cursor.close()
        conn.close()

        return jsonify({
            "success": True, 
            "message": "Usuario actualizado correctamente"
        }), 200

    except Exception as e:
        print("Error al actualizar usuario:", e)
        return jsonify({
            "success": False, 
            "message": "Error interno del servidor"
        }), 500

@usuarios_bp.route("/obtener", methods=["GET"])
def obtener_usuarios():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Obtener usuarios con información de entidad
        query = """
            SELECT 
                u.id_usuario,
                u.nombre_usuario,
                u.nombre_completo,
                u.correo,
                u.telefono,
                u.rol,
                u.estado,
                u.fecha_registro,
                u.fecha_actualizacion,
                e.nombre_entidad AS entidad,
                u.id_entidad1
            FROM usuarios u
            LEFT JOIN entidades e ON u.id_entidad1 = e.id_entidad
        """
        cursor.execute(query)
        usuarios = cursor.fetchall()
        
        cursor.close()
        conn.close()
        return jsonify(usuarios)
    except Exception as e:
        print("Error al obtener usuarios:", e)
        return jsonify({
            "success": False, 
            "message": "Error al obtener usuarios"
        }), 500

@usuarios_bp.route("/eliminar/<int:usuario_id>", methods=["DELETE"])
def eliminar_usuario(usuario_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        # Verificar si el usuario existe
        cursor.execute("SELECT id_usuario FROM usuarios WHERE id_usuario = %s", (usuario_id,))
        usuario = cursor.fetchone()
        
        if not usuario:
            return jsonify({
                "success": False, 
                "message": "Usuario no encontrado"
            }), 404

        # Evitar que el usuario se elimine a sí mismo
        # (En un sistema real deberías tener más controles)
        
        # Eliminar el usuario
        cursor.execute("DELETE FROM usuarios WHERE id_usuario = %s", (usuario_id,))
        conn.commit()

        if cursor.rowcount == 0:
            return jsonify({
                "success": False, 
                "message": "No se pudo eliminar el usuario"
            }), 400

        return jsonify({
            "success": True, 
            "message": "Usuario eliminado correctamente"
        }), 200
        
    except Exception as e:
        print("Error al eliminar usuario:", e)
        conn.rollback()
        return jsonify({
            "success": False, 
            "message": "Error al eliminar el usuario"
        }), 500
        
    finally:
        cursor.close()
        conn.close()

@usuarios_bp.route("/obtenerEntidades", methods=["GET"])
def obtener_entidades():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM entidades")
        entidades = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(entidades)
    except Exception as e:
        print("Error al obtener entidades:", e)
        return jsonify({
            "success": False, 
            "message": "Error al obtener entidades"
        }), 500

@usuarios_bp.route("/verificar-estado/<string:nombre_usuario>", methods=["GET"])
def verificar_estado_usuario(nombre_usuario):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        cursor.execute("SELECT estado FROM usuarios WHERE nombre_usuario = %s", (nombre_usuario,))
        usuario = cursor.fetchone()
        
        cursor.close()
        conn.close()
        
        if not usuario:
            return jsonify({"success": False, "message": "Usuario no encontrado"}), 404
            
        return jsonify({
            "success": True,
            "estado": usuario['estado']
        }), 200
        
    except Exception as e:
        print("Error al verificar estado:", e)
        return jsonify({"success": False, "message": "Error interno del servidor"}), 500

# ticket
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
        tipo = request.form.get("tipo")
        categoria = request.form.get("categoria")
        solicitante = request.form.get("solicitante")

        # adjunto = request.files.get("archivo")

        if not all([prioridad, titulo, descripcion, ubicacion]):
            return jsonify({"success": False, "message": "Faltan campos requeridos"}), 400
        conn = get_db_connection()
        cursor = conn.cursor()

        query_ticket = """
            INSERT INTO tickets (prioridad, tipo,  titulo, descripcion, ubicacion, id_categoria1)
            VALUES (%s, %s, %s, %s, %s, %s)
        """
        cursor.execute(query_ticket, (prioridad, tipo, titulo, descripcion,
                                      ubicacion, categoria))
        ticket_id = cursor.lastrowid  # Obtener el ID del ticket recién creado
        query_usuarios_ticket = """ INSERT INTO usuarios_tickets (id_usuario1, id_ticket1)
            VALUES (%s, %s)
        """
        cursor.execute(query_usuarios_ticket, (solicitante, ticket_id))
        conn.commit()

        cursor.close()
        conn.close()

        return jsonify({"success": True, "message": "Ticket creado correctamente"}), 201

    except Exception as e:
        print("Error al crear ticket:", e)
        return jsonify({"success": False, "message": "Error interno del servidor"}), 500


@usuarios_bp.route("/tickets", methods=["GET"])
def obtener_tickets():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
    SELECT 
        t.id_ticket,
        t.titulo,
        t.nombre_tecnico,
        t.descripcion,
        t.ubicacion,
        t.prioridad,
        t.tipo,
        t.estado_ticket,
        t.grupo,
        t.fecha_creacion,
        c.nombre_categoria AS categoria,
        u.nombre_completo AS solicitante
    FROM tickets t
    JOIN categorias c ON t.id_categoria1 = c.id_categoria
    JOIN usuarios_tickets ut ON t.id_ticket = ut.id_ticket1
    JOIN usuarios u ON ut.id_usuario1 = u.id_usuario
""")

        tickets = cursor.fetchall()

        print("Tickets obtenidos:", tickets)  # <- ahora sí se ejecutará

        cursor.close()
        conn.close()
        return jsonify(tickets)

    except Exception as e:
        print("Error al obtener tickets:", e)
        return jsonify({"success": False, "message": "Error al obtener tickets"}), 500


@usuarios_bp.route("/tickets/<int:id_ticket>", methods=["GET"])
def obtener_ticket_por_id(id_ticket):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT 
                t.id_ticket,
                t.titulo,
                t.nombre_tecnico,
                t.descripcion,
                t.ubicacion,
                t.prioridad,
                t.tipo,
                t.estado_ticket,
                t.grupo,
                t.fecha_creacion,
                t.fecha_actualizacion,
                c.nombre_categoria AS categoria,
                u.nombre_completo AS solicitante
            FROM tickets t
            JOIN categorias c ON t.id_categoria1 = c.id_categoria
            JOIN usuarios_tickets ut ON t.id_ticket = ut.id_ticket1
            JOIN usuarios u ON ut.id_usuario1 = u.id_usuario
            WHERE t.id_ticket = %s
        """, (id_ticket,))

        row = cursor.fetchone()
        cursor.close()
        conn.close()

        if row is None:
            return jsonify({"success": False, "message": "Ticket no encontrado"}), 404

       
        ticket = {
            "id": row["id_ticket"],
            "titulo": row["titulo"],
            "descripcion": row["descripcion"],
            "solicitante": row["solicitante"],
            "prioridad": row["prioridad"],
            "estado": row["estado_ticket"],
            "asignadoA": row["nombre_tecnico"],
            "grupoAsignado": row["grupo"],
            "categoria": row["categoria"],
            "fechaApertura": row["fecha_creacion"].isoformat(),  # ISO 8601 para input datetime-local
            "ultimaActualizacion": row["fecha_actualizacion"],  # Llénalo si tienes columna
            "tipo": row["tipo"],
            "ubicacion": row["ubicacion"],
            "observador": "",           # Llénalo si lo manejas
        }
        print("Ticket obtenido:", ticket)  # Para depuración
        return jsonify(ticket)

    except Exception as e:
        print("Error al obtener el ticket:", e)
        return jsonify({"success": False, "message": "Error al obtener el ticket"}), 500

@usuarios_bp.route("/estado_tickets", methods=["GET"])
def obtener_estado_tickets():
    estado = request.args.get("estado")  

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        query = """
            SELECT 
                t.id_ticket,
                t.titulo,
                t.nombre_tecnico,
                t.descripcion,
                t.ubicacion,
                t.prioridad,
                t.tipo,
                t.estado_ticket,
                t.grupo,
                t.fecha_creacion,
                c.nombre_categoria AS categoria,
                u.nombre_completo AS solicitante
            FROM tickets t
            JOIN categorias c ON t.id_categoria1 = c.id_categoria
            JOIN usuarios_tickets ut ON t.id_ticket = ut.id_ticket1
            JOIN usuarios u ON ut.id_usuario1 = u.id_usuario
        """

        # Agregar filtro por estado si se especifica
        if estado:
            query += " WHERE t.estado_ticket = %s"
            cursor.execute(query, (estado,))
        else:
            cursor.execute(query)

        tickets = cursor.fetchall()
        cursor.close()
        conn.close()

        return jsonify(tickets)

    except Exception as e:
        print("Error al obtener tickets:", e)
        return jsonify({"success": False, "message": "Error al obtener tickets"}), 500
