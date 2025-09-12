from flask import Blueprint, request, jsonify
from database import get_db_connection

categorias_bp = Blueprint('categorias', __name__)

@categorias_bp.route('/obtener', methods=['GET'])
def obtener_categorias():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Primero obtenemos todas las categorías
        cursor.execute("SELECT * FROM categorias")
        categorias = cursor.fetchall()
        
        # Luego obtenemos todas las entidades
        cursor.execute("SELECT * FROM entidades")
        entidades = cursor.fetchall()
        
        # Creamos un diccionario rápido para buscar entidades por ID
        entidades_dict = {entidad['id_entidad']: entidad for entidad in entidades}
        
        # Para este ejemplo, vamos a asignar entidades de forma estática
        # Puedes modificar esta lógica según tus necesidades
        asignaciones_entidades = {
            1: 1,  # Hardware -> Departamento de TI
            2: 1,  # Software -> Departamento de TI  
            3: 1,  # Red -> Departamento de TI
            4: 2   # Cuentas -> Recursos Humanos
        }
        
        # Agregamos la información de la entidad a cada categoría
        for categoria in categorias:
            entidad_id = asignaciones_entidades.get(categoria['id_categoria'])
            if entidad_id and entidad_id in entidades_dict:
                categoria['entidad'] = entidades_dict[entidad_id]['nombre_entidad']
                categoria['id_entidad'] = entidad_id
            else:
                categoria['entidad'] = 'Sin entidad'
                categoria['id_entidad'] = None
        
        cursor.close()
        conn.close()
        return jsonify(categorias)
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@categorias_bp.route('/creacion', methods=['POST'])
def crear_categoria():
    try:
        data = request.get_json()
        nombre = data.get('nombre_categoria')
        descripcion = data.get('descripcion', '')
        id_entidad = data.get('id_entidad')  # Lo recibimos pero no lo guardamos en BD

        if not nombre:
            return jsonify({'success': False, 'message': 'El nombre de la categoría es requerido'}), 400

        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO categorias (nombre_categoria, descripcion) VALUES (%s, %s)",
            (nombre, descripcion)
        )
        conn.commit()
        cursor.close()
        conn.close()
        
        # Aquí podrías guardar la relación categoría-entidad en otra tabla si quieres
        # Por ahora solo retornamos éxito
        return jsonify({'success': True, 'message': 'Categoría creada exitosamente'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@categorias_bp.route('/actualizacion/<int:id>', methods=['PUT'])
def actualizar_categoria(id):
    try:
        data = request.get_json()
        nombre = data.get('nombre_categoria')
        descripcion = data.get('descripcion', '')
        id_entidad = data.get('id_entidad')  # Lo recibimos pero no lo actualizamos en BD

        if not nombre:
            return jsonify({'success': False, 'message': 'El nombre de la categoría es requerido'}), 400

        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            "UPDATE categorias SET nombre_categoria = %s, descripcion = %s WHERE id_categoria = %s",
            (nombre, descripcion, id)
        )
        conn.commit()
        cursor.close()
        conn.close()
        
        # Aquí podrías actualizar la relación categoría-entidad si la guardas en otra tabla
        return jsonify({'success': True, 'message': 'Categoría actualizada exitosamente'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@categorias_bp.route('/eliminar/<int:id>', methods=['DELETE'])
def eliminar_categoria(id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Verificar si hay tickets asociados a esta categoría
        cursor.execute("SELECT COUNT(*) FROM tickets WHERE id_categoria1 = %s", (id,))
        count = cursor.fetchone()[0]
        
        if count > 0:
            return jsonify({'success': False, 'message': 'No se puede eliminar la categoría porque tiene tickets asociados'}), 400
            
        cursor.execute("DELETE FROM categorias WHERE id_categoria = %s", (id,))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({'success': True, 'message': 'Categoría eliminada exitosamente'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500
    # Diccionario para almacenar relaciones categoría-entidad (en memoria)
categoria_entidad_relations = {}

@categorias_bp.route('/relacion_entidad', methods=['POST'])
def guardar_relacion_entidad():
    try:
        data = request.get_json()
        categoria_id = data.get('categoria_id')
        entidad_id = data.get('entidad_id')
        
        if not categoria_id or not entidad_id:
            return jsonify({'success': False, 'message': 'Datos incompletos'}), 400
        
        categoria_entidad_relations[categoria_id] = entidad_id
        return jsonify({'success': True, 'message': 'Relación guardada'})
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@categorias_bp.route('/relacion_entidad/<int:categoria_id>', methods=['GET'])
def obtener_relacion_entidad(categoria_id):
    try:
        entidad_id = categoria_entidad_relations.get(str(categoria_id))
        return jsonify({'entidad_id': entidad_id})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@categorias_bp.route('/relaciones_entidad', methods=['GET'])
def obtener_todas_relaciones():
    try:
        return jsonify(categoria_entidad_relations)
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500
