from flask import Blueprint, request, jsonify
from database import get_db_connection
import os
from werkzeug.utils import secure_filename
from datetime import datetime

usuarios_bp = Blueprint("usuarios", __name__)

# Configuración para archivos adjuntos
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'txt', 'pdf', 'png', 'jpg', 'jpeg', 'xlsx', 'doc', 'docx'}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

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
        estado = data.get("estado", "activo")
        id_grupo = data.get("id_grupo")  # Puede ser None

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

        # Validar que los técnicos tengan grupo y admin
        if rol in ["tecnico", "administrador"] and not id_grupo:
            return jsonify({
                "success": False, 
                "message": "Los técnicos y administradores deben tener un grupo asignado"
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
                id_entidad1,
                id_grupo
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        cursor.execute(query, (
            nombre_usuario, 
            nombre_completo, 
            correo, 
            telefono, 
            contrasena, 
            rol, 
            estado, 
            id_entidad,
            id_grupo
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
            "message": f"Error interno del servidor: {str(e)}"
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
        id_grupo = data.get("id_grupo")  # Puede ser None

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

        # Validar que los técnicos tengan grupo y admin
        if rol in ["tecnico", "administrador"] and not id_grupo:
            return jsonify({
                "success": False, 
                "message": "Los técnicos y administradores deben tener un grupo asignado"
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
                    id_entidad1 = %s,
                    id_grupo = %s,
                    fecha_actualizacion = NOW()
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
                id_grupo,
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
                    id_entidad1 = %s,
                    id_grupo = %s,
                    fecha_actualizacion = NOW()
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
                id_grupo,
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
            "message": f"Error interno del servidor: {str(e)}"
        }), 500

@usuarios_bp.route("/obtener", methods=["GET"])
def obtener_usuarios():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Obtener usuarios con información de entidad y grupo
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
                u.id_entidad1,
                g.nombre_grupo AS grupo,
                u.id_grupo
            FROM usuarios u
            LEFT JOIN entidades e ON u.id_entidad1 = e.id_entidad
            LEFT JOIN grupos g ON u.id_grupo = g.id_grupo
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

@usuarios_bp.route("/obtenerGrupos", methods=["GET"])
def obtener_grupos():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM grupos")
        grupos = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(grupos)
    except Exception as e:
        print("Error al obtener grupos:", e)
        return jsonify({
            "success": False, 
            "message": "Error al obtener grupos"
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

@usuarios_bp.route("/obtenerCategorias", methods=["GET"])
def obtener_categorias():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM categorias")
        categorias = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(categorias)
    except Exception as e:
        print("Error al obtener categorías:", e)
        return jsonify({
            "success": False, 
            "message": "Error al obtener categorías"
        }), 500

@usuarios_bp.route("/obtenerUsuario/<int:usuario_id>", methods=["GET"])
def obtener_usuario(usuario_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        cursor.execute("""
            SELECT 
                u.id_usuario,
                u.nombre_completo,
                u.nombre_usuario,
                u.correo,
                u.telefono,
                u.rol,
                u.estado,
                e.nombre_entidad AS entidad,
                e.id_entidad,
                g.nombre_grupo AS grupo,
                g.id_grupo
            FROM usuarios u
            LEFT JOIN entidades e ON u.id_entidad1 = e.id_entidad
            LEFT JOIN grupos g ON u.id_grupo = g.id_grupo
            WHERE u.id_usuario = %s
        """, (usuario_id,))
        
        usuario = cursor.fetchone()
        cursor.close()
        conn.close()
        
        if not usuario:
            return jsonify({"success": False, "message": "Usuario no encontrado"}), 404
            
        return jsonify(usuario)
        
    except Exception as e:
        print("Error al obtener usuario:", e)
        return jsonify({"success": False, "message": "Error al obtener usuario"}), 500
    
    #TICKET 
@usuarios_bp.route("/tickets", methods=["POST"])
def crear_ticket():
    try:
        # Obtener datos del formulario
        prioridad = request.form.get("prioridad")
        titulo = request.form.get("titulo")
        descripcion = request.form.get("descripcion")
        ubicacion = request.form.get("ubicacion")
        tipo = request.form.get("tipo")
        categoria = request.form.get("categoria")
        solicitante = request.form.get("solicitante")
        grupo_asignado = request.form.get("grupo_asignado")
        tecnico_asignado = request.form.get("tecnico_asignado")
        estado = request.form.get("estado", "nuevo")  # Nuevo campo: estado
        archivos = request.files.getlist("archivos")

        # Validación de campos requeridos
        if not all([prioridad, titulo, descripcion, ubicacion, tipo, categoria, solicitante, estado]):
            return jsonify({
                "success": False, 
                "message": "Faltan campos requeridos"
            }), 400

        conn = get_db_connection()
        cursor = conn.cursor()

        # Insertar ticket (incluyendo estado)
        query_ticket = """
            INSERT INTO tickets (
                prioridad, 
                tipo,  
                titulo, 
                descripcion, 
                ubicacion, 
                id_categoria1,
                id_usuario_reporta,
                estado_ticket,  -- Usar la variable estado
                id_grupo1,
                id_tecnico_asignado
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        cursor.execute(query_ticket, (
            prioridad, 
            tipo, 
            titulo, 
            descripcion,
            ubicacion, 
            categoria,
            solicitante,
            estado,  # Usar la variable estado
            grupo_asignado or None,
            tecnico_asignado or None
        ))
        ticket_id = cursor.lastrowid

        # Insertar relación usuario-ticket
        query_usuarios_ticket = """
            INSERT INTO usuarios_tickets (id_usuario1, id_ticket3)
            VALUES (%s, %s)
        """
        cursor.execute(query_usuarios_ticket, (solicitante, ticket_id))

        # Manejar archivos adjuntos si existen
        for archivo in archivos:
            if archivo and allowed_file(archivo.filename):
                # Crear directorio si no existe (ya se crea al inicio, pero por seguridad)
                if not os.path.exists(UPLOAD_FOLDER):
                    os.makedirs(UPLOAD_FOLDER)
                    
                filename = secure_filename(archivo.filename)
                filepath = os.path.join(UPLOAD_FOLDER, filename)
                archivo.save(filepath)
                
                query_adjunto = """
                    INSERT INTO adjuntos_tickets (
                        id_ticket1, 
                        nombre_archivo, 
                        ruta_archivo, 
                        tipo_archivo, 
                        tamano
                    ) VALUES (%s, %s, %s, %s, %s)
                """
                cursor.execute(query_adjunto, (
                    ticket_id,
                    filename,
                    filepath,
                    archivo.content_type,
                    os.path.getsize(filepath)
                ))

        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({
            "success": True, 
            "message": "Ticket creado correctamente",
            "ticket_id": ticket_id
        }), 201

    except Exception as e:
        print("Error al crear ticket:", e)
        if 'conn' in locals() and conn:
            conn.rollback()
            conn.close()
        return jsonify({
            "success": False, 
            "message": "Error interno del servidor"
        }), 500

@usuarios_bp.route("/tickets", methods=["GET"])
def obtener_tickets():
    try:
        usuario_id = request.args.get("usuario_id")
        rol = request.args.get("rol")
        
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        query = """
            SELECT 
                t.id_ticket as id,
                t.titulo,
                t.descripcion,
                t.prioridad,
                t.estado_ticket as estado,
                t.tipo,
                t.ubicacion,
                t.fecha_creacion,
                t.fecha_actualizacion as ultimaActualizacion,
                t.fecha_cierre,
                c.nombre_categoria AS categoria,
                u.nombre_completo AS solicitante,
                u.id_usuario AS solicitanteId,
                tec.nombre_completo AS tecnico,
                g.nombre_grupo AS grupo
            FROM tickets t
            LEFT JOIN categorias c ON t.id_categoria1 = c.id_categoria
            LEFT JOIN usuarios_tickets ut ON t.id_ticket = ut.id_ticket3
            LEFT JOIN usuarios u ON ut.id_usuario1 = u.id_usuario
            LEFT JOIN usuarios tec ON t.id_tecnico_asignado = tec.id_usuario
            LEFT JOIN grupos g ON t.id_grupo1 = g.id_grupo
        """
        
        params = []
        if rol and rol.lower() not in ['administrador', 'tecnico'] and usuario_id:
            query += " WHERE ut.id_usuario1 = %s"
            params.append(usuario_id)
        
        # Ordenar por fecha de creación descendente (más reciente primero)
        query += " ORDER BY t.fecha_creacion DESC"
        
        cursor.execute(query, params)
        tickets = cursor.fetchall()
        
        for ticket in tickets:
            ticket['fecha_creacion'] = ticket['fecha_creacion'].strftime('%Y-%m-%d %H:%M:%S')
            if ticket['ultimaActualizacion']:
                ticket['ultimaActualizacion'] = ticket['ultimaActualizacion'].strftime('%Y-%m-%d %H:%M:%S')
        
        cursor.close()
        conn.close()
        
        return jsonify(tickets)

    except Exception as e:
        print("Error al obtener tickets:", e)
        return jsonify({
            "success": False, 
            "message": "Error al obtener tickets"
        }), 500

@usuarios_bp.route("/tickets/<int:id_ticket>", methods=["GET"])
def obtener_ticket_por_id(id_ticket):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT 
                t.id_ticket as id,
                t.titulo,
                t.descripcion,
                t.prioridad,
                t.estado_ticket as estado,
                t.tipo,
                t.ubicacion,
                t.fecha_creacion as fechaApertura,
                t.fecha_actualizacion as ultimaActualizacion,
                t.id_categoria1,
                c.nombre_categoria AS categoria,
                u.nombre_completo AS solicitante,
                u.id_usuario AS solicitanteId,
                tec.nombre_completo AS asignadoA,
                g.nombre_grupo AS grupoAsignado
            FROM tickets t
            LEFT JOIN categorias c ON t.id_categoria1 = c.id_categoria
            LEFT JOIN usuarios_tickets ut ON t.id_ticket = ut.id_ticket3
            LEFT JOIN usuarios u ON ut.id_usuario1 = u.id_usuario
            LEFT JOIN usuarios tec ON t.id_tecnico_asignado = tec.id_usuario
            LEFT JOIN grupos g ON t.id_grupo1 = g.id_grupo
            WHERE t.id_ticket = %s
        """, (id_ticket,))

        ticket = cursor.fetchone()
        
        if ticket:
            # Formatear fechas
            ticket['fechaApertura'] = ticket['fechaApertura'].strftime('%Y-%m-%d %H:%M:%S')
            if ticket['ultimaActualizacion']:
                ticket['ultimaActualizacion'] = ticket['ultimaActualizacion'].strftime('%Y-%m-%d %H:%M:%S')
            
            # Obtener adjuntos si existen
            cursor.execute("""
                SELECT * FROM adjuntos_tickets 
                WHERE id_ticket1 = %s
            """, (id_ticket,))
            adjuntos = cursor.fetchall()
            ticket['adjuntos'] = adjuntos

        cursor.close()
        conn.close()

        if not ticket:
            return jsonify({
                "success": False, 
                "message": "Ticket no encontrado"
            }), 404

        return jsonify(ticket)

    except Exception as e:
        print("Error al obtener el ticket:", e)
        return jsonify({
            "success": False, 
            "message": "Error al obtener el ticket"
        }), 500

@usuarios_bp.route("/tickets/<int:id_ticket>", methods=["PUT"])
def actualizar_ticket(id_ticket):
    try:
        # Determinar el tipo de contenido (JSON o FormData)
        if request.content_type and request.content_type.startswith('multipart/form-data'):
            data = request.form
            archivos = request.files.getlist("archivos")
        else:
            data = request.get_json()
            archivos = []

        # Validar campos requeridos
        user_id = data.get("user_id")
        user_role = data.get("user_role")
        
        if not user_id or not user_role:
            return jsonify({
                "success": False,
                "message": "Se requieren user_id y user_role"
            }), 400

        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # Verificar existencia del ticket
        cursor.execute("SELECT * FROM tickets WHERE id_ticket = %s", (id_ticket,))
        ticket = cursor.fetchone()
        
        if not ticket:
            return jsonify({
                "success": False,
                "message": "Ticket no encontrado"
            }), 404

        # Validar permisos
        if user_role not in ['administrador', 'tecnico'] and str(ticket['id_usuario_reporta']) != str(user_id):
            return jsonify({
                "success": False,
                "message": "No tienes permisos para editar este ticket"
            }), 403

        # Preparar actualización con validación de foreign keys
        updates = []
        params = []
        
        campos_actualizables = [
            'titulo', 'descripcion', 'ubicacion', 'prioridad', 
            'tipo', 'id_categoria1', 'id_grupo1', 'id_tecnico_asignado',
            'estado_ticket'
        ]
        
        for campo in campos_actualizables:
            if campo in data and data[campo] is not None:
                # Validar foreign keys antes de agregar a la actualización
                if campo == 'id_categoria1' and data[campo]:
                    cursor.execute("SELECT id_categoria FROM categorias WHERE id_categoria = %s", (data[campo],))
                    if not cursor.fetchone():
                        continue  # Saltar si la categoría no existe
                
                elif campo == 'id_grupo1' and data[campo]:
                    cursor.execute("SELECT id_grupo FROM grupos WHERE id_grupo = %s", (data[campo],))
                    if not cursor.fetchone():
                        continue  # Saltar si el grupo no existe
                
                elif campo == 'id_tecnico_asignado' and data[campo]:
                    cursor.execute("SELECT id_usuario FROM usuarios WHERE id_usuario = %s AND rol IN ('tecnico', 'administrador')", (data[campo],))
                    if not cursor.fetchone():
                        continue  # Saltar si el técnico no existe o no tiene rol válido
                
                updates.append(f"{campo} = %s")
                params.append(data[campo])

        # Si no hay campos válidos para actualizar, verificar si hay archivos
        if not updates and not archivos:
            return jsonify({
                "success": False,
                "message": "No se proporcionaron campos válidos para actualizar"
            }), 400

        # Agregar fecha de actualización
        if updates:
            updates.append("fecha_actualizacion = NOW()")
            params.append(id_ticket)
            
            query = f"UPDATE tickets SET {', '.join(updates)} WHERE id_ticket = %s"
            cursor.execute(query, params)

        # Manejar archivos adjuntos
        for archivo in archivos:
            if archivo and allowed_file(archivo.filename):
                # Crear directorio si no existe
                if not os.path.exists(UPLOAD_FOLDER):
                    os.makedirs(UPLOAD_FOLDER)
                    
                filename = secure_filename(archivo.filename)
                filepath = os.path.join(UPLOAD_FOLDER, filename)
                archivo.save(filepath)
                
                query_adjunto = """
                    INSERT INTO adjuntos_tickets (
                        id_ticket1, 
                        nombre_archivo, 
                        ruta_archivo, 
                        tipo_archivo, 
                        tamano
                    ) VALUES (%s, %s, %s, %s, %s)
                """
                cursor.execute(query_adjunto, (
                    id_ticket,
                    filename,
                    filepath,
                    archivo.content_type,
                    os.path.getsize(filepath)
                ))

        conn.commit()

        # Obtener el ticket actualizado
        cursor.execute("""
            SELECT t.*, c.nombre_categoria, g.nombre_grupo, 
                   u.nombre_completo as solicitante,
                   tec.nombre_completo as tecnico_asignado
            FROM tickets t
            LEFT JOIN categorias c ON t.id_categoria1 = c.id_categoria
            LEFT JOIN grupos g ON t.id_grupo1 = g.id_grupo
            LEFT JOIN usuarios u ON t.id_usuario_reporta = u.id_usuario
            LEFT JOIN usuarios tec ON t.id_tecnico_asignado = tec.id_usuario
            WHERE t.id_ticket = %s
        """, (id_ticket,))
        
        ticket_actualizado = cursor.fetchone()
        
        cursor.close()
        conn.close()
        
        return jsonify({
            "success": True,
            "message": "Ticket actualizado correctamente",
            "ticket": ticket_actualizado
        }), 200

    except Exception as e:
        if 'conn' in locals():
            conn.rollback()
        print("Error al actualizar ticket:", e)
        return jsonify({
            "success": False,
            "message": f"Error al actualizar ticket: {str(e)}"
        }), 500
        
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals():
            conn.close()

@usuarios_bp.route("/estado_tickets", methods=["GET"])
def obtener_estado_tickets():
    estado = request.args.get("estado")  
    usuario_id = request.args.get("usuario_id")
    rol = request.args.get("rol")

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        query = """
            SELECT 
                t.id_ticket as id,
                t.titulo,
                t.descripcion,
                t.prioridad,
                t.estado_ticket as estado,
                t.tipo,
                t.ubicacion,
                t.fecha_creacion,
                t.fecha_actualizacion as ultimaActualizacion,
                c.nombre_categoria AS categoria,
                u.nombre_completo AS solicitante,
                u.id_usuario AS solicitanteId,
                tec.nombre_completo AS tecnico
            FROM tickets t
            LEFT JOIN categorias c ON t.id_categoria1 = c.id_categoria
            LEFT JOIN usuarios_tickets ut ON t.id_ticket = ut.id_ticket3
            LEFT JOIN usuarios u ON ut.id_usuario1 = u.id_usuario
            LEFT JOIN usuarios tec ON t.id_tecnico_asignado = tec.id_usuario  -- AÑADIR ESTE JOIN
        """

        conditions = []
        params = []

        if estado:
            conditions.append("t.estado_ticket = %s")
            params.append(estado)

        if rol and rol.lower() not in ['administrador', 'tecnico'] and usuario_id:
            conditions.append("ut.id_usuario1 = %s")
            params.append(usuario_id)

        if conditions:
            query += " WHERE " + " AND ".join(conditions)

        # Ordenar por fecha de creación descendente (más reciente primero)
        query += " ORDER BY t.fecha_creacion DESC"

        cursor.execute(query, params)
        tickets = cursor.fetchall()
        
        # Formatear fechas
        for ticket in tickets:
            ticket['fecha_creacion'] = ticket['fecha_creacion'].strftime('%Y-%m-%d %H:%M:%S')
            if ticket['ultimaActualizacion']:
                ticket['ultimaActualizacion'] = ticket['ultimaActualizacion'].strftime('%Y-%m-%d %H:%M:%S')

        cursor.close()
        conn.close()

        return jsonify(tickets)

    except Exception as e:
        print("Error al obtener tickets:", e)
        return jsonify({
            "success": False, 
            "message": "Error al obtener tickets"
        }), 500

# ENDPOINTS PARA SEGUIMIENTOS Y CIERRE DE TICKETS
@usuarios_bp.route("/tickets/<int:id_ticket>/cerrar", methods=["PUT"])
def cerrar_ticket(id_ticket):
    try:
        data = request.get_json()
        comentario = data.get("comentario", "")
        id_tecnico = data.get("id_tecnico")
        acciones_realizadas = data.get("acciones_realizadas", "")
        tipo_cierre = data.get("tipo_cierre", "visita")
        encontro_usuario = data.get("encontro_usuario", None)
        
        if not id_tecnico:
            return jsonify({
                "success": False,
                "message": "Se requiere ID del técnico"
            }), 400
            
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Registrar seguimiento de cierre
        cursor.execute("""
            INSERT INTO seguimientos_visitas 
            (id_ticket, id_tecnico, tipo_visita, observaciones, 
             encontro_usuario, acciones_realizadas, estado_resultante, cerrar_ticket)
            VALUES (%s, %s, %s, %s, %s, %s, 'resuelto', 1)
        """, (id_ticket, id_tecnico, tipo_cierre, comentario, 
              encontro_usuario, acciones_realizadas))
        
        # El trigger after_seguimiento_insert se encargará de cerrar el ticket automáticamente
        
        conn.commit()
        return jsonify({
            "success": True,
            "message": "Ticket cerrado correctamente con seguimiento"
        }), 200
        
    except Exception as e:
        conn.rollback()
        return jsonify({
            "success": False,
            "message": f"Error al cerrar ticket: {str(e)}"
        }), 500
    finally:
        cursor.close()
        conn.close()

@usuarios_bp.route("/tickets/<int:id_ticket>/seguimientos", methods=["GET"])
def obtener_seguimientos_ticket(id_ticket):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Obtener seguimientos y visitas
        cursor.execute("""
            SELECT 
                sv.id_seguimiento,
                sv.id_ticket,
                sv.id_tecnico,
                sv.tipo_visita,
                sv.observaciones,
                sv.acciones_realizadas,
                sv.encontro_usuario,
                sv.estado_resultante,
                sv.cerrar_ticket,
                sv.fecha_visita,
                sv.fecha_proxima_visita,
                u.nombre_completo as nombre_tecnico,
                NULL as tipo_registro
            FROM seguimientos_visitas sv
            JOIN usuarios u ON sv.id_tecnico = u.id_usuario
            WHERE sv.id_ticket = %s
            
            UNION ALL
            
            SELECT 
                ht.id_historial as id_seguimiento,
                ht.id_ticket2 as id_ticket,
                ht.modificado_por as id_tecnico,
                'reapertura' as tipo_visita,
                ht.comentario_reapertura as observaciones,
                NULL as acciones_realizadas,
                NULL as encontro_usuario,
                NULL as estado_resultante,
                0 as cerrar_ticket,
                ht.fecha_modificacion as fecha_visita,
                NULL as fecha_proxima_visita,
                COALESCE(u.nombre_completo, 'Sistema') as nombre_tecnico,
                'reapertura' as tipo_registro
            FROM historial_tickets ht
            LEFT JOIN usuarios u ON ht.modificado_por = u.id_usuario
            WHERE ht.id_ticket2 = %s AND ht.campo_modificado = 'reapertura'
            
            ORDER BY fecha_visita DESC
        """, (id_ticket, id_ticket))
        
        seguimientos = cursor.fetchall()
        
        # Formatear fechas
        for seg in seguimientos:
            seg['fecha_visita'] = seg['fecha_visita'].strftime('%Y-%m-%d %H:%M:%S')
            if seg['fecha_proxima_visita']:
                seg['fecha_proxima_visita'] = seg['fecha_proxima_visita'].strftime('%Y-%m-%d %H:%M:%S')
        
        cursor.close()
        conn.close()
        
        return jsonify(seguimientos)
        
    except Exception as e:
        print("Error al obtener seguimientos:", e)
        return jsonify({
            "success": False, 
            "message": "Error al obtener seguimientos"
        }), 500

@usuarios_bp.route("/tickets/<int:id_ticket>/solucion", methods=["GET"])
def obtener_solucion_ticket(id_ticket):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Obtener el último seguimiento de cierre como solución
        cursor.execute("""
            SELECT sv.*, u.nombre_completo as nombre_tecnico
            FROM seguimientos_visitas sv
            JOIN usuarios u ON sv.id_tecnico = u.id_usuario
            WHERE sv.id_ticket = %s AND sv.cerrar_ticket = 1
            ORDER BY sv.fecha_visita DESC
            LIMIT 1
        """, (id_ticket,))
        
        solucion = cursor.fetchone()
        
        if solucion:
            solucion['fecha_visita'] = solucion['fecha_visita'].strftime('%Y-%m-%d %H:%M:%S')
        
        cursor.close()
        conn.close()
        
        return jsonify(solucion or {})
        
    except Exception as e:
        print("Error al obtener solución:", e)
        return jsonify({
            "success": False, 
            "message": "Error al obtener solución"
        }), 500

@usuarios_bp.route("/tickets/<int:id_ticket>/reabrir", methods=["PUT"])
def reabrir_ticket(id_ticket):
    try:
        data = request.get_json()
        comentario = data.get("comentario", "Usuario no conforme con la solución")
        usuario_id = data.get("usuario_id")
        
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Verificar que el usuario es el solicitante del ticket
        cursor.execute("""
            SELECT id_usuario_reporta FROM tickets 
            WHERE id_ticket = %s
        """, (id_ticket,))
        ticket = cursor.fetchone()
        
        if not ticket or str(ticket['id_usuario_reporta']) != str(usuario_id):
            return jsonify({
                "success": False,
                "message": "No tienes permisos para reabrir este ticket"
            }), 403
        
        # Reabrir el ticket
        cursor.execute("""
            UPDATE tickets 
            SET estado_ticket = 'reabierto', 
                fecha_cierre = NULL,
                fecha_actualizacion = NOW(),
                contador_reaperturas = contador_reaperturas + 1
            WHERE id_ticket = %s
        """, (id_ticket,))
        
        # Registrar en historial
        cursor.execute("""
            INSERT INTO historial_tickets 
            (id_ticket2, campo_modificado, valor_anterior, valor_nuevo, 
             modificado_por, comentario_reapertura)
            VALUES (%s, 'reapertura', 'resuelto', 'reabierto', %s, %s)
        """, (id_ticket, usuario_id, comentario))
        
        conn.commit()
        return jsonify({
            "success": True,
            "message": "Ticket reabierto correctamente"
        }), 200
        
    except Exception as e:
        conn.rollback()
        return jsonify({
            "success": False,
            "message": f"Error al reabrir ticket: {str(e)}"
        }), 500
    finally:
        cursor.close()
        conn.close()

@usuarios_bp.route("/tickets/<int:id_ticket>/seguimiento", methods=["POST"])
def agregar_seguimiento_ticket(id_ticket):
    try:
        data = request.get_json()
        descripcion = data.get("descripcion")
        id_tecnico = data.get("id_tecnico")
        tipo_seguimiento = data.get("tipo_seguimiento", "seguimiento")
        
        if not descripcion or not id_tecnico:
            return jsonify({
                "success": False,
                "message": "Faltan campos requeridos"
            }), 400
            
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Insertar seguimiento
        cursor.execute("""
            INSERT INTO seguimientos_visitas 
            (id_ticket, id_tecnico, tipo_visita, observaciones)
            VALUES (%s, %s, %s, %s)
        """, (id_ticket, id_tecnico, tipo_seguimiento, descripcion))
        
        # Actualizar fecha de modificación del ticket
        cursor.execute("""
            UPDATE tickets 
            SET fecha_actualizacion = NOW()
            WHERE id_ticket = %s
        """, (id_ticket,))
        
        conn.commit()
        return jsonify({
            "success": True,
            "message": "Seguimiento agregado correctamente"
        }), 200
        
    except Exception as e:
        conn.rollback()
        return jsonify({
            "success": False,
            "message": f"Error al agregar seguimiento: {str(e)}"
        }), 500
    finally:
        cursor.close()
        conn.close()

@usuarios_bp.route("/tickets/<int:id_ticket>/estado", methods=["GET"])
def obtener_estado_ticket(id_ticket):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        cursor.execute("""
            SELECT estado_ticket, fecha_cierre, contador_reaperturas 
            FROM tickets WHERE id_ticket = %s
        """, (id_ticket,))
        
        estado = cursor.fetchone()
        cursor.close()
        conn.close()
        
        return jsonify(estado or {})
        
    except Exception as e:
        print("Error al obtener estado del ticket:", e)
        return jsonify({
            "success": False, 
            "message": "Error al obtener estado del ticket"
        }), 500
@usuarios_bp.route("/tickets/<int:id_ticket>/reaperturas", methods=["GET"])
def obtener_reaperturas_ticket(id_ticket):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        cursor.execute("""
            SELECT * FROM historial_tickets 
            WHERE id_ticket2 = %s AND campo_modificado = 'reapertura'
            ORDER BY fecha_modificacion DESC
        """, (id_ticket,))
        
        reaperturas = cursor.fetchall()
        
        # Formatear fechas
        for reapertura in reaperturas:
            reapertura['fecha_modificacion'] = reapertura['fecha_modificacion'].strftime('%Y-%m-%d %H:%M:%S')
        
        cursor.close()
        conn.close()
        
        return jsonify(reaperturas)
        
    except Exception as e:
        print("Error al obtener reaperturas:", e)
        return jsonify({
            "success": False, 
            "message": "Error al obtener reaperturas"
        }), 500
    # Agregar este endpoint en usuarios.py
@usuarios_bp.route("/obtenerTecnicosPorGrupo/<int:grupo_id>", methods=["GET"])
def obtener_tecnicos_por_grupo(grupo_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        cursor.execute("""
            SELECT u.id_usuario, u.nombre_completo 
            FROM usuarios u
            WHERE u.id_grupo = %s AND u.rol IN ('tecnico', 'administrador')
            AND u.estado = 'activo'
        """, (grupo_id,))
        
        tecnicos = cursor.fetchall()
        cursor.close()
        conn.close()
        
        return jsonify(tecnicos)
        
    except Exception as e:
        print("Error al obtener técnicos:", e)
        return jsonify({
            "success": False, 
            "message": "Error al obtener técnicos"
        }), 500
    
# ENCUESTAS DE SATISFACCIÓN
@usuarios_bp.route("/encuestas/<int:ticket_id>/verificar", methods=["GET"])
def verificar_encuesta(ticket_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        cursor.execute("""
            SELECT * FROM encuestas_satisfaccion 
            WHERE id_ticket = %s
        """, (ticket_id,))
        
        encuesta = cursor.fetchone()
        cursor.close()
        conn.close()
        
        return jsonify({
            "existe_encuesta": encuesta is not None,
            "encuesta": encuesta
        }), 200
        
    except Exception as e:
        print("Error al verificar encuesta:", e)
        return jsonify({
            "success": False, 
            "message": f"Error al verificar encuesta: {str(e)}"
        }), 500

@usuarios_bp.route("/api/encuestasatisfaccion", methods=["POST"])
def crear_encuesta_satisfaccion():
    try:
        data = request.get_json()
        ticket_id = data.get("ticketId")
        calificacion = data.get("calificacion")
        comentario = data.get("comentario", "")
        usuario = data.get("usuario", "Anónimo")
        
        # Validaciones
        if not ticket_id or not calificacion:
            return jsonify({
                "success": False,
                "message": "Faltan campos requeridos"
            }), 400
            
        if int(calificacion) < 1 or int(calificacion) > 5:
            return jsonify({
                "success": False,
                "message": "La calificación debe estar entre 1 y 5"
            }), 400
            
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Verificar si ya existe encuesta para este ticket
        cursor.execute("""
            SELECT id_encuesta FROM encuestas_satisfaccion 
            WHERE id_ticket = %s
        """, (ticket_id,))
        
        if cursor.fetchone():
            return jsonify({
                "success": False,
                "message": "Ya existe una encuesta para este ticket"
            }), 409
        
        # Verificar que el ticket existe y está resuelto
        cursor.execute("""
            SELECT estado_ticket FROM tickets 
            WHERE id_ticket = %s
        """, (ticket_id,))
        
        ticket = cursor.fetchone()
        if not ticket:
            return jsonify({
                "success": False,
                "message": "Ticket no encontrado"
            }), 404
            
        if ticket['estado_ticket'] != 'resuelto':
            return jsonify({
                "success": False,
                "message": "Solo se pueden enviar encuestas para tickets resueltos"
            }), 400
        
        # Insertar encuesta
        cursor.execute("""
            INSERT INTO encuestas_satisfaccion 
            (id_ticket, calificacion, comentario, usuario)
            VALUES (%s, %s, %s, %s)
        """, (ticket_id, calificacion, comentario, usuario))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return jsonify({
            "success": True,
            "message": "Encuesta enviada correctamente"
        }), 200
        
    except Exception as e:
        print("Error al crear encuesta:", e)
        if 'conn' in locals():
            conn.rollback()
        return jsonify({
            "success": False,
            "message": f"Error al procesar la encuesta: {str(e)}"
        }), 500
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals():
            conn.close()

@usuarios_bp.route("/encuestas/ticket/<int:ticket_id>", methods=["GET"])
def obtener_encuesta_por_ticket(ticket_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        cursor.execute("""
            SELECT * FROM encuestas_satisfaccion 
            WHERE id_ticket = %s
        """, (ticket_id,))
        
        encuesta = cursor.fetchone()
        cursor.close()
        conn.close()
        
        if not encuesta:
            return jsonify({
                "success": False,
                "message": "No se encontró encuesta para este ticket"
            }), 404
            
        return jsonify({
            "success": True,
            "encuesta": encuesta
        }), 200
        
    except Exception as e:
        print("Error al obtener encuesta:", e)
        return jsonify({
            "success": False, 
            "message": f"Error al obtener encuesta: {str(e)}"
        }), 500

@usuarios_bp.route("/encuestas/usuario", methods=["GET"])
def obtener_encuestas_usuario():
    try:
        usuario_id = request.args.get("usuario_id")
        
        if not usuario_id:
            return jsonify({
                "success": False,
                "message": "Se requiere ID de usuario"
            }), 400
            
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Obtener el nombre del usuario para filtrar las encuestas
        cursor.execute("SELECT nombre_completo FROM usuarios WHERE id_usuario = %s", (usuario_id,))
        usuario = cursor.fetchone()
        
        if not usuario:
            return jsonify({
                "success": False,
                "message": "Usuario no encontrado"
            }), 404
        
        # Obtener encuestas SOLO del usuario específico usando su nombre
        cursor.execute("""
            SELECT es.*, t.titulo as ticket_titulo, t.descripcion as ticket_descripcion
            FROM encuestas_satisfaccion es
            JOIN tickets t ON es.id_ticket = t.id_ticket
            WHERE es.usuario = %s
            ORDER BY es.fecha_encuesta DESC
        """, (usuario['nombre_completo'],))
        
        encuestas = cursor.fetchall()
        
        cursor.close()
        conn.close()
        
        return jsonify({
            "success": True,
            "encuestas": encuestas
        }), 200
        
    except Exception as e:
        print("Error al obtener encuestas del usuario:", e)
        return jsonify({
            "success": False, 
            "message": f"Error al obtener encuestas: {str(e)}"
        }), 500
    
@usuarios_bp.route("/encuestas/detalle/<int:encuesta_id>", methods=["GET"])
def obtener_detalle_encuesta(encuesta_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        cursor.execute("""
            SELECT es.*, t.titulo, t.descripcion, u.nombre_completo as tecnico_asignado
            FROM encuestas_satisfaccion es
            JOIN tickets t ON es.id_ticket = t.id_ticket
            LEFT JOIN usuarios u ON t.id_tecnico_asignado = u.id_usuario
            WHERE es.id_encuesta = %s
        """, (encuesta_id,))
        
        encuesta = cursor.fetchone()
        
        cursor.close()
        conn.close()
        
        if not encuesta:
            return jsonify({
                "success": False,
                "message": "Encuesta no encontrada"
            }), 404
            
        return jsonify({
            "success": True,
            "encuesta": encuesta
        }), 200
        
    except Exception as e:
        print("Error al obtener detalle de encuesta:", e)
        return jsonify({
            "success": False, 
            "message": f"Error al obtener detalle: {str(e)}"
        }), 500
    
@usuarios_bp.route("/encuestas/tecnico/<int:tecnico_id>", methods=["GET"])
def obtener_encuestas_por_tecnico(tecnico_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Obtener encuestas de tickets asignados a este técnico
        cursor.execute("""
            SELECT es.*, t.titulo, t.descripcion, 
                   u.nombre_completo as nombre_usuario,
                   t.id_tecnico_asignado
            FROM encuestas_satisfaccion es
            JOIN tickets t ON es.id_ticket = t.id_ticket
            JOIN usuarios u ON t.id_usuario_reporta = u.id_usuario
            WHERE t.id_tecnico_asignado = %s
            ORDER BY es.fecha_encuesta DESC
        """, (tecnico_id,))
        
        encuestas = cursor.fetchall()
        
        cursor.close()
        conn.close()
        
        return jsonify({
            "success": True,
            "encuestas": encuestas
        }), 200
        
    except Exception as e:
        print("Error al obtener encuestas del técnico:", e)
        return jsonify({
            "success": False, 
            "message": f"Error al obtener encuestas: {str(e)}"
        }), 500
    
@usuarios_bp.route("/encuestas/todas", methods=["GET"])
def obtener_todas_encuestas():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        cursor.execute("""
            SELECT es.*, t.titulo as ticket_titulo, t.descripcion as ticket_descripcion,
                   u.nombre_completo as nombre_tecnico, t.id_tecnico_asignado
            FROM encuestas_satisfaccion es
            JOIN tickets t ON es.id_ticket = t.id_ticket
            LEFT JOIN usuarios u ON t.id_tecnico_asignado = u.id_usuario
            ORDER BY es.fecha_encuesta DESC
        """)
        
        encuestas = cursor.fetchall()
        cursor.close()
        conn.close()
        
        return jsonify({
            "success": True,
            "encuestas": encuestas
        }), 200
        
    except Exception as e:
        print("Error al obtener todas las encuestas:", e)
        return jsonify({
            "success": False, 
            "message": f"Error al obtener encuestas: {str(e)}"
        }), 500
