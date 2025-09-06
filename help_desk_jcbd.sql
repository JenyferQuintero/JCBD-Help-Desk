DROP DATABASE IF EXISTS help_desk_jcbd;

CREATE DATABASE help_desk_jcbd;

USE help_desk_jcbd;

-- Tabla de categorías
CREATE TABLE `categorias` (
  `id_categoria` int(11) NOT NULL,
  `nombre_categoria` varchar(100) NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `categorias` (`id_categoria`, `nombre_categoria`, `descripcion`) VALUES
(1, 'Hardware', 'Problemas relacionados con equipos físicos'),
(2, 'Software', 'Problemas relacionados con programas y sistemas'),
(3, 'Red', 'Problemas de conectividad y redes'),
(4, 'Cuentas', 'Gestión de cuentas y permisos de usuarios');

-- Tabla de entidades
CREATE TABLE `entidades` (
  `id_entidad` int(11) NOT NULL,
  `nombre_entidad` varchar(100) NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `entidades` (`id_entidad`, `nombre_entidad`, `descripcion`) VALUES
(1, 'Departamento de TI', 'Departamento de Tecnologías de la Información'),
(2, 'Recursos Humanos', 'Departamento de gestión de personal'),
(3, 'Contabilidad', 'Departamento financiero y contable'),
(4, 'Operaciones', 'Departamento de operaciones generales');

-- Tabla de grupos
CREATE TABLE `grupos` (
  `id_grupo` int(11) NOT NULL,
  `nombre_grupo` varchar(100) NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `grupos` (`id_grupo`, `nombre_grupo`, `descripcion`) VALUES
(1, 'Administradores del Sistema', 'Grupo de administración de sistemas'),
(2, 'Soporte Técnico N1', 'Grupo de soporte técnico de primer nivel'),
(3, 'Soporte Técnico N2', 'Grupo de soporte técnico especializado'),
(4, 'Redes', 'Grupo de soporte técnico especializado en redes');

-- Tabla de usuarios
CREATE TABLE `usuarios` (
  `id_usuario` int(11) NOT NULL,
  `nombre_completo` varchar(100) NOT NULL,
  `correo` varchar(100) NOT NULL,
  `telefono` varchar(20) NOT NULL,
  `nombre_usuario` varchar(50) NOT NULL,
  `contraseña` varchar(100) NOT NULL,
  `rol` varchar(100) NOT NULL,
  `estado` varchar(100) NOT NULL DEFAULT 'activo',
  `fecha_registro` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_actualizacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `id_entidad1` int(11) DEFAULT NULL,
  `id_grupo` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `usuarios` (`id_usuario`, `nombre_completo`, `correo`, `telefono`, `nombre_usuario`, `contraseña`, `rol`, `estado`, `fecha_registro`, `fecha_actualizacion`, `id_entidad1`, `id_grupo`) VALUES
(1, 'Admin Sistema', 'admin@helpdeskjcbd.com', '123456789', 'Admin', 'admin123', 'administrador', 'activo', '2025-06-18 10:09:59', '2025-06-18 11:32:19', 1, 1),
(2, 'Técnico Principal', 'tecnico@helpdeskjcbd.com', '123456789', 'Tecnico_1', 'tecnico123', 'tecnico', 'activo', '2025-06-18 10:09:59', '2025-06-18 10:59:48', 1, 2),
(3, 'Sistema Usuario', 'usuario1@helpdeskjcbd.com', '123456789', 'Usuario_1', 'usuario123', 'usuario', 'activo', '2025-06-18 10:09:59', '2025-06-18 11:09:01', 2, NULL),
(4, 'Usuario Sistema', 'usuario2@helpdeskjcbd.com', '123456789', 'Usuario_2', 'usuario1234', 'usuario', 'activo', '2025-06-18 10:09:59', '2025-06-18 11:09:14', 3, NULL),
(5, 'Usuario Usuario', 'usuario3@helpdeskjcbd.com', '5551234567', 'Usuario_3', 'usuario12345', 'usuario', 'inactivo', '2025-06-18 10:09:59', '2025-06-18 11:09:23', 4, NULL),
(6, 'Tecnico Tecnico', 'tecnico1@helpdeskjcbd.com', '5557654321', 'Tecnico_2', 'tecnico1234', 'tecnico', 'activo', '2025-06-18 10:09:59', '2025-06-18 11:09:34', 1, 3),
(7, 'Tecnico Tecnico Tecnico', 'tecnico2@helpdeskjcbd.com', '5559876543', 'Tecnico_3', 'tecnico12345', 'tecnico', 'activo', '2025-06-18 10:09:59', '2025-06-18 11:09:47', 1, 4);

-- Tabla de tickets
CREATE TABLE `tickets` (
  `id_ticket` int(11) NOT NULL,
  `prioridad` varchar(100) NOT NULL,
  `estado_ticket` varchar(100) NOT NULL DEFAULT 'nuevo',
  `tipo` varchar(100) NOT NULL,
  `titulo` varchar(200) NOT NULL,
  `descripcion` text NOT NULL,
  `ubicacion` varchar(100) NOT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_cierre` timestamp NULL DEFAULT NULL,
  `fecha_actualizacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `id_categoria1` int(11) DEFAULT NULL,
  `id_grupo1` int(11) DEFAULT NULL,
  `id_tecnico_asignado` int(11) DEFAULT NULL,
  `id_usuario_reporta` int(11) DEFAULT NULL,
  `contador_reaperturas` int(11) DEFAULT 0 COMMENT 'Número de veces que se ha reabierto este ticket',
  `comentario_cierre` TEXT NULL DEFAULT NULL COMMENT 'Comentario al cerrar el ticket directamente'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `tickets` (`id_ticket`, `prioridad`, `estado_ticket`, `tipo`, `titulo`, `descripcion`, `ubicacion`, `fecha_creacion`, `fecha_cierre`, `fecha_actualizacion`, `id_categoria1`, `id_grupo1`, `id_tecnico_asignado`, `id_usuario_reporta`, `contador_reaperturas`) VALUES
(1, 'Alta', 'nuevo', 'incidencia', 'Computadora no enciende', 'El equipo del usuario no muestra señal de vida al presionar el botón de encendido', 'Oficina 101', '2025-06-18 10:10:10', '2025-06-18 11:34:07', '2025-06-18 11:34:07', 1, 1, 2, 3, 0),
(2, 'Media', 'en_proceso', 'requerimiento', 'Instalación de Photoshop', 'El usuario requiere la instalación de Adobe Photoshop para edición de imágenes', 'Oficina 205', '2025-06-18 10:10:10', '2025-06-18 11:34:07', '2025-06-18 11:34:12', 2, 2, 2, 3, 0),
(3, 'Alta', 'en-espera', 'incidencia', 'No hay conexión a internet', 'Todo el departamento de contabilidad ha perdido conexión a internet', 'Área Contabilidad', '2025-06-18 10:10:10', '2025-06-18 11:34:07', '2025-06-18 11:34:32', 3, 1, 6, 2, 0),
(4, 'Baja', 'resuelto', 'requerimiento', 'Restablecer contraseña', 'El usuario olvidó su contraseña y necesita que se la restablezcan', 'Oficina 312', '2025-06-18 10:10:10', '2025-06-18 11:34:07', '2025-06-25 01:00:00', 4, 3, 2, 3, 0),
(5, 'Media', 'cerrado', 'incidencia', 'Impresora no funciona', 'La impresora de la oficina 107 no responde y muestra un error de papel atascado', 'Oficina 107', '2025-06-18 10:10:10', '2025-06-18 11:34:07', '2025-06-18 11:34:45', 1, 2, 7, 3, 0);

-- Tabla de historial de tickets
CREATE TABLE `historial_tickets` (
  `id_historial` int(11) NOT NULL,
  `id_ticket2` int(11) NOT NULL,
  `campo_modificado` varchar(50) NOT NULL,
  `valor_anterior` text DEFAULT NULL,
  `valor_nuevo` text DEFAULT NULL,
  `fecha_modificacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `modificado_por` int(11) DEFAULT NULL,
  `nombre_modificador` varchar(100) DEFAULT NULL,
  `rol_modificador` varchar(100) DEFAULT NULL,
  `comentario_reapertura` text DEFAULT NULL,
  `tipo_seguimiento` varchar(50) DEFAULT NULL,
  `observaciones_visita` text DEFAULT NULL,
  `encontro_usuario` tinyint(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Tabla de adjuntos
CREATE TABLE `adjuntos_tickets` (
  `id_adjunto` int(11) NOT NULL,
  `id_ticket1` int(11) NOT NULL,
  `nombre_archivo` varchar(255) NOT NULL,
  `ruta_archivo` varchar(255) NOT NULL,
  `tipo_archivo` varchar(50) DEFAULT NULL,
  `tamano` int(11) DEFAULT NULL COMMENT 'Tamaño en bytes',
  `fecha_subida` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Tabla de seguimientos de visitas
CREATE TABLE `seguimientos_visitas` (
  `id_seguimiento` int(11) NOT NULL AUTO_INCREMENT,
  `id_ticket` int(11) NOT NULL,
  `id_tecnico` int(11) NOT NULL,
  `fecha_visita` timestamp NOT NULL DEFAULT current_timestamp(),
  `tipo_visita` varchar(50) NOT NULL,
  `observaciones` text NOT NULL,
  `encontro_usuario` tinyint(1) NULL DEFAULT NULL,
  `acciones_realizadas` text DEFAULT NULL,
  `estado_resultante` varchar(100) DEFAULT NULL,
  `fecha_proxima_visita` timestamp NULL DEFAULT NULL,
  `cerrar_ticket` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id_seguimiento`),
  KEY `id_ticket` (`id_ticket`),
  KEY `id_tecnico` (`id_tecnico`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Tabla de relación usuarios-tickets
CREATE TABLE `usuarios_tickets` (
  `id_usuario1` int(11) NOT NULL,
  `id_ticket3` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Tabla de encuestas de satisfacion
CREATE TABLE `encuestas_satisfaccion` (
  `id_encuesta` int(11) NOT NULL AUTO_INCREMENT,
  `id_ticket` int(11) NOT NULL,
  `calificacion` int(11) NOT NULL COMMENT 'Valor del 1 al 5',
  `comentario` text DEFAULT NULL,
  `fecha_encuesta` timestamp NOT NULL DEFAULT current_timestamp(),
  `usuario` varchar(100) NOT NULL COMMENT 'Nombre del usuario que responde',
  `estado` varchar(20) DEFAULT 'activa' COMMENT 'activa, inactiva',
  PRIMARY KEY (`id_encuesta`),
  KEY `id_ticket` (`id_ticket`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Insertar algunos datos de ejemplo en encuestas
INSERT INTO `encuestas_satisfaccion` (`id_ticket`, `calificacion`, `comentario`, `usuario`) VALUES
(1, 5, 'Excelente servicio, resolvieron mi problema rápidamente', 'Usuario_1'),
(2, 4, 'Buen servicio, pero tardaron un poco en responder', 'Usuario_2'),
(3, 5, 'Muy profesionales, solucionaron el problema de red', 'Admin Sistema'),
(4, 3, 'Servicio regular, esperaba más rapidez', 'Usuario_3'),
(5, 5, '¡Increíble! Mi impresora funciona como nueva', 'Técnico Principal');

-- Índices y constraints
ALTER TABLE `adjuntos_tickets`
  ADD PRIMARY KEY (`id_adjunto`),
  ADD KEY `adjuntos_tickets_ibfk_1` (`id_ticket1`);

ALTER TABLE `categorias`
  ADD PRIMARY KEY (`id_categoria`);

ALTER TABLE `entidades`
  ADD PRIMARY KEY (`id_entidad`);

ALTER TABLE `grupos`
  ADD PRIMARY KEY (`id_grupo`);

ALTER TABLE `historial_tickets`
  ADD PRIMARY KEY (`id_historial`),
  ADD KEY `id_ticket2` (`id_ticket2`),
  ADD KEY `modificado_por` (`modificado_por`);

ALTER TABLE `tickets`
  ADD PRIMARY KEY (`id_ticket`),
  ADD KEY `id_categoria1` (`id_categoria1`),
  ADD KEY `id_grupo1` (`id_grupo1`),
  ADD KEY `id_tecnico_asignado` (`id_tecnico_asignado`),
  ADD KEY `id_usuario_reporta` (`id_usuario_reporta`);

ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id_usuario`),
  ADD UNIQUE KEY `correo` (`correo`),
  ADD UNIQUE KEY `nombre_usuario` (`nombre_usuario`),
  ADD KEY `id_entidad1` (`id_entidad1`),
  ADD KEY `id_grupo` (`id_grupo`);

ALTER TABLE `usuarios_tickets`
  ADD PRIMARY KEY (`id_usuario1`,`id_ticket3`),
  ADD KEY `id_ticket3` (`id_ticket3`);

-- Auto incrementos
ALTER TABLE `adjuntos_tickets`
  MODIFY `id_adjunto` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `categorias`
  MODIFY `id_categoria` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

ALTER TABLE `entidades`
  MODIFY `id_entidad` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

ALTER TABLE `grupos`
  MODIFY `id_grupo` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

ALTER TABLE `historial_tickets`
  MODIFY `id_historial` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `tickets`
  MODIFY `id_ticket` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

ALTER TABLE `usuarios`
  MODIFY `id_usuario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

-- Foreign keys (AHORA SÍ AGREGAMOS LA FK PARA ENCUESTAS)
ALTER TABLE `adjuntos_tickets`
  ADD CONSTRAINT `adjuntos_tickets_ibfk_1` FOREIGN KEY (`id_ticket1`) REFERENCES `tickets` (`id_ticket`) ON DELETE CASCADE;

ALTER TABLE `historial_tickets`
  ADD CONSTRAINT `historial_tickets_ibfk_1` FOREIGN KEY (`id_ticket2`) REFERENCES `tickets` (`id_ticket`) ON DELETE CASCADE,
  ADD CONSTRAINT `historial_tickets_ibfk_2` FOREIGN KEY (`modificado_por`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL;

ALTER TABLE `tickets`
  ADD CONSTRAINT `tickets_ibfk_1` FOREIGN KEY (`id_categoria1`) REFERENCES `categorias` (`id_categoria`) ON DELETE SET NULL,
  ADD CONSTRAINT `tickets_ibfk_2` FOREIGN KEY (`id_grupo1`) REFERENCES `grupos` (`id_grupo`) ON DELETE SET NULL,
  ADD CONSTRAINT `tickets_ibfk_3` FOREIGN KEY (`id_tecnico_asignado`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL,
  ADD CONSTRAINT `tickets_ibfk_4` FOREIGN KEY (`id_usuario_reporta`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL;

ALTER TABLE `usuarios`
  ADD CONSTRAINT `usuarios_ibfk_1` FOREIGN KEY (`id_entidad1`) REFERENCES `entidades` (`id_entidad`) ON DELETE SET NULL,
  ADD CONSTRAINT `usuarios_ibfk_2` FOREIGN KEY (`id_grupo`) REFERENCES `grupos` (`id_grupo`) ON DELETE SET NULL;

ALTER TABLE `usuarios_tickets`
  ADD CONSTRAINT `usuarios_tickets_ibfk_1` FOREIGN KEY (`id_usuario1`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE,
  ADD CONSTRAINT `usuarios_tickets_ibfk_2` FOREIGN KEY (`id_ticket3`) REFERENCES `tickets` (`id_ticket`) ON DELETE CASCADE;

ALTER TABLE `seguimientos_visitas`
  ADD CONSTRAINT `seguimientos_visitas_ibfk_1` FOREIGN KEY (`id_ticket`) REFERENCES `tickets` (`id_ticket`) ON DELETE CASCADE,
  ADD CONSTRAINT `seguimientos_visitas_ibfk_2` FOREIGN KEY (`id_tecnico`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE;

-- AHORA AGREGAMOS LA FK PARA ENCUESTAS (CUANDO TODAS LAS TABLAS YA EXISTEN)
ALTER TABLE `encuestas_satisfaccion`
  ADD CONSTRAINT `encuestas_satisfaccion_ibfk_1` FOREIGN KEY (`id_ticket`) REFERENCES `tickets` (`id_ticket`) ON DELETE CASCADE;

-- TRIGGERS
DELIMITER $$

-- Trigger después de insertar ticket
CREATE TRIGGER `after_ticket_insert` AFTER INSERT ON `tickets` FOR EACH ROW 
BEGIN
    DECLARE usuario_reporta_nombre VARCHAR(100);
    DECLARE usuario_reporta_id INT;
    DECLARE usuario_reporta_rol VARCHAR(100);
    
    SET usuario_reporta_id = NEW.id_usuario_reporta;
    SELECT nombre_completo, rol INTO usuario_reporta_nombre, usuario_reporta_rol 
    FROM usuarios WHERE id_usuario = usuario_reporta_id;
    
    INSERT INTO historial_tickets (id_ticket2, campo_modificado, valor_anterior, 
                                 valor_nuevo, modificado_por, nombre_modificador, rol_modificador)
    VALUES (NEW.id_ticket, 'ticket_creado', NULL, 
           'Ticket creado con todos los campos',
           usuario_reporta_id, usuario_reporta_nombre, usuario_reporta_rol);
END$$

-- Trigger después de actualizar ticket
CREATE TRIGGER `after_ticket_update` AFTER UPDATE ON `tickets` FOR EACH ROW 
BEGIN
    DECLARE user_id INT;
    DECLARE user_name VARCHAR(100);
    DECLARE user_rol VARCHAR(100);
    DECLARE old_categoria_nombre VARCHAR(100);
    DECLARE new_categoria_nombre VARCHAR(100);
    DECLARE old_grupo_nombre VARCHAR(100);
    DECLARE new_grupo_nombre VARCHAR(100);
    DECLARE old_tecnico_nombre VARCHAR(100);
    DECLARE new_tecnico_nombre VARCHAR(100);
    DECLARE old_usuario_reporta_nombre VARCHAR(100);
    DECLARE new_usuario_reporta_nombre VARCHAR(100);
    DECLARE es_reapertura BOOLEAN DEFAULT FALSE;
    
    SET user_id = IFNULL(NEW.id_tecnico_asignado, @current_user_id);
    IF user_id IS NULL THEN
        SET user_id = 1;
        SET user_name = 'Admin Sistema';
        SET user_rol = 'administrador';
    ELSE
        SELECT nombre_completo, rol INTO user_name, user_rol FROM usuarios WHERE id_usuario = user_id;
    END IF;
    
    IF (OLD.estado_ticket = 'resuelto' AND NEW.estado_ticket != 'resuelto' AND user_rol = 'usuario') THEN
        SET es_reapertura = TRUE;
        UPDATE tickets SET contador_reaperturas = contador_reaperturas + 1 WHERE id_ticket = NEW.id_ticket;
    END IF;
    
    SELECT IFNULL(nombre_categoria, 'Sin categoría') INTO old_categoria_nombre 
    FROM categorias WHERE id_categoria = OLD.id_categoria1;
    
    SELECT IFNULL(nombre_categoria, 'Sin categoría') INTO new_categoria_nombre 
    FROM categorias WHERE id_categoria = NEW.id_categoria1;
    
    SELECT IFNULL(nombre_grupo, 'Sin grupo') INTO old_grupo_nombre 
    FROM grupos WHERE id_grupo = OLD.id_grupo1;
    
    SELECT IFNULL(nombre_grupo, 'Sin grupo') INTO new_grupo_nombre 
    FROM grupos WHERE id_grupo = NEW.id_grupo1;
    
    SELECT IFNULL(nombre_completo, 'Sin técnico') INTO old_tecnico_nombre 
    FROM usuarios WHERE id_usuario = OLD.id_tecnico_asignado;
    
    SELECT IFNULL(nombre_completo, 'Sin técnico') INTO new_tecnico_nombre 
    FROM usuarios WHERE id_usuario = NEW.id_tecnico_asignado;
    
    SELECT IFNULL(nombre_completo, 'Usuario desconocido') INTO old_usuario_reporta_nombre 
    FROM usuarios WHERE id_usuario = OLD.id_usuario_reporta;
    
    SELECT IFNULL(nombre_completo, 'Usuario desconocido') INTO new_usuario_reporta_nombre 
    FROM usuarios WHERE id_usuario = NEW.id_usuario_reporta;
    
    IF es_reapertura THEN
        INSERT INTO historial_tickets (id_ticket2, campo_modificado, valor_anterior, valor_nuevo, 
                                     modificado_por, nombre_modificador, rol_modificador, comentario_reapertura)
        VALUES (NEW.id_ticket, 'reapertura_usuario', OLD.estado_ticket, NEW.estado_ticket, 
               user_id, user_name, user_rol, @comentario_reapertura);
    END IF;
    
    IF NEW.prioridad != OLD.prioridad THEN
        INSERT INTO historial_tickets (id_ticket2, campo_modificado, valor_anterior, valor_nuevo, 
                                     modificado_por, nombre_modificador, rol_modificador)
        VALUES (NEW.id_ticket, 'prioridad', OLD.prioridad, NEW.prioridad, 
               user_id, user_name, user_rol);
    END IF;
    
    IF NEW.estado_ticket != OLD.estado_ticket AND NOT es_reapertura THEN
        INSERT INTO historial_tickets (id_ticket2, campo_modificado, valor_anterior, valor_nuevo, 
                                     modificado_por, nombre_modificador, rol_modificador)
        VALUES (NEW.id_ticket, 'estado_ticket', OLD.estado_ticket, NEW.estado_ticket, 
               user_id, user_name, user_rol);
    END IF;
    
    IF NEW.tipo != OLD.tipo THEN
        INSERT INTO historial_tickets (id_ticket2, campo_modificado, valor_anterior, valor_nuevo, 
                                     modificado_por, nombre_modificador, rol_modificador)
        VALUES (NEW.id_ticket, 'tipo', OLD.tipo, NEW.tipo, 
               user_id, user_name, user_rol);
    END IF;
    
    IF NEW.titulo != OLD.titulo THEN
        INSERT INTO historial_tickets (id_ticket2, campo_modificado, valor_anterior, valor_nuevo, 
                                     modificado_por, nombre_modificador, rol_modificador)
        VALUES (NEW.id_ticket, 'titulo', OLD.titulo, NEW.titulo, 
               user_id, user_name, user_rol);
    END IF;
    
    IF NEW.descripcion != OLD.descripcion THEN
        INSERT INTO historial_tickets (id_ticket2, campo_modificado, valor_anterior, valor_nuevo, 
                                     modificado_por, nombre_modificador, rol_modificador)
        VALUES (NEW.id_ticket, 'descripcion', LEFT(OLD.descripcion, 255), LEFT(NEW.descripcion, 255), 
               user_id, user_name, user_rol);
    END IF;
    
    IF NEW.ubicacion != OLD.ubicacion THEN
        INSERT INTO historial_tickets (id_ticket2, campo_modificado, valor_anterior, valor_nuevo, 
                                     modificado_por, nombre_modificador, rol_modificador)
        VALUES (NEW.id_ticket, 'ubicacion', OLD.ubicacion, NEW.ubicacion, 
               user_id, user_name, user_rol);
    END IF;
    
    IF (NEW.id_categoria1 != OLD.id_categoria1) OR (NEW.id_categoria1 IS NULL AND OLD.id_categoria1 IS NOT NULL) OR (NEW.id_categoria1 IS NOT NULL AND OLD.id_categoria1 IS NULL) THEN
        INSERT INTO historial_tickets (id_ticket2, campo_modificado, valor_anterior, valor_nuevo, 
                                     modificado_por, nombre_modificador, rol_modificador)
        VALUES (NEW.id_ticket, 'categoría', old_categoria_nombre, new_categoria_nombre, 
               user_id, user_name, user_rol);
    END IF;
    
    IF (NEW.id_grupo1 != OLD.id_grupo1) OR (NEW.id_grupo1 IS NULL AND OLD.id_grupo1 IS NOT NULL) OR (NEW.id_grupo1 IS NOT NULL AND OLD.id_grupo1 IS NULL) THEN
        INSERT INTO historial_tickets (id_ticket2, campo_modificado, valor_anterior, valor_nuevo, 
                                     modificado_por, nombre_modificador, rol_modificador)
        VALUES (NEW.id_ticket, 'grupo', old_grupo_nombre, new_grupo_nombre, 
               user_id, user_name, user_rol);
    END IF;
    
    IF (NEW.id_tecnico_asignado != OLD.id_tecnico_asignado) OR (NEW.id_tecnico_asignado IS NULL AND OLD.id_tecnico_asignado IS NOT NULL) OR (NEW.id_tecnico_asignado IS NOT NULL AND OLD.id_tecnico_asignado IS NULL) THEN
        INSERT INTO historial_tickets (id_ticket2, campo_modificado, valor_anterior, valor_nuevo, 
                                     modificado_por, nombre_modificador, rol_modificador)
        VALUES (NEW.id_ticket, 'técnico asignado', old_tecnico_nombre, new_tecnico_nombre, 
               user_id, user_name, user_rol);
    END IF;
    
    IF (NEW.id_usuario_reporta != OLD.id_usuario_reporta) OR (NEW.id_usuario_reporta IS NULL AND OLD.id_usuario_reporta IS NOT NULL) OR (NEW.id_usuario_reporta IS NOT NULL AND OLD.id_usuario_reporta IS NULL) THEN
        INSERT INTO historial_tickets (id_ticket2, campo_modificado, valor_anterior, valor_nuevo, 
                                     modificado_por, nombre_modificador, rol_modificador)
        VALUES (NEW.id_ticket, 'usuario que reporta', old_usuario_reporta_nombre, new_usuario_reporta_nombre, 
               user_id, user_name, user_rol);
    END IF;
    
    IF (NEW.fecha_cierre IS NOT NULL AND OLD.fecha_cierre IS NULL) THEN
        INSERT INTO historial_tickets (id_ticket2, campo_modificado, valor_anterior, valor_nuevo, 
                                     modificado_por, nombre_modificador, rol_modificador)
        VALUES (NEW.id_ticket, 'fecha_cierre', NULL, NEW.fecha_cierre, 
               user_id, user_name, user_rol);
    END IF;
    
    IF (NEW.fecha_cierre IS NULL AND OLD.fecha_cierre IS NOT NULL) THEN
        INSERT INTO historial_tickets (id_ticket2, campo_modificado, valor_anterior, valor_nuevo, 
                                     modificado_por, nombre_modificador, rol_modificador)
        VALUES (NEW.id_ticket, 'ticket_reapertura', OLD.fecha_cierre, NULL, 
               user_id, user_name, user_rol);
    END IF;
    
    IF (NEW.estado_ticket = 'resuelto' AND OLD.estado_ticket != 'resuelto' AND NEW.comentario_cierre IS NOT NULL) THEN
        INSERT INTO historial_tickets (id_ticket2, campo_modificado, valor_anterior, valor_nuevo, 
                                     modificado_por, nombre_modificador, rol_modificador, comentario_reapertura)
        VALUES (NEW.id_ticket, 'comentario_cierre', NULL, NEW.comentario_cierre,
               user_id, user_name, user_rol, NULL);
    END IF;
END$$

-- Trigger para seguimientos de visitas
CREATE TRIGGER `after_seguimiento_insert` AFTER INSERT ON `seguimientos_visitas` FOR EACH ROW 
BEGIN
    IF NEW.cerrar_ticket = 1 THEN
        UPDATE tickets 
        SET estado_ticket = 'resuelto', 
            fecha_cierre = CURRENT_TIMESTAMP,
            id_tecnico_asignado = NEW.id_tecnico,
            fecha_actualizacion = CURRENT_TIMESTAMP
        WHERE id_ticket = NEW.id_ticket;
        
        INSERT INTO historial_tickets 
        (id_ticket2, campo_modificado, valor_anterior, valor_nuevo, 
         modificado_por, comentario_reapertura, tipo_seguimiento, observaciones_visita, encontro_usuario)
        VALUES 
        (NEW.id_ticket, 'cierre_por_seguimiento', 'abierto', 'resuelto',
         NEW.id_tecnico, NEW.observaciones, NEW.tipo_visita, NEW.acciones_realizadas, NEW.encontro_usuario);
    END IF;
END$$

-- Trigger que obliga seguimiento al cerrar
CREATE TRIGGER `before_ticket_update_cierre` BEFORE UPDATE ON `tickets` FOR EACH ROW 
BEGIN
    IF (NEW.estado_ticket = 'resuelto' AND OLD.estado_ticket != 'resuelto') THEN
        IF NOT EXISTS (SELECT 1 FROM seguimientos_visitas WHERE id_ticket = NEW.id_ticket) THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'No se puede cerrar el ticket sin al menos un registro de seguimiento';
        END IF;
    END IF;
END$$

DELIMITER ;

-- PROCEDIMIENTOS ALMACENADOS
DELIMITER $$

CREATE PROCEDURE `CerrarTicketConSeguimiento`(
    IN p_id_ticket INT,
    IN p_id_tecnico INT,
    IN p_comentario TEXT,
    IN p_acciones_realizadas TEXT,
    IN p_tipo_cierre VARCHAR(50),
    IN p_encontro_usuario TINYINT
)
BEGIN
    DECLARE v_nombre_tecnico VARCHAR(100);
    DECLARE v_rol_tecnico VARCHAR(100);
    
    SELECT nombre_completo, rol INTO v_nombre_tecnico, v_rol_tecnico 
    FROM usuarios WHERE id_usuario = p_id_tecnico;
    
    INSERT INTO seguimientos_visitas 
    (id_ticket, id_tecnico, tipo_visita, observaciones, 
     encontro_usuario, acciones_realizadas, estado_resultante, cerrar_ticket)
    VALUES 
    (p_id_ticket, p_id_tecnico, p_tipo_cierre, p_comentario,
     p_encontro_usuario, p_acciones_realizadas, 'resuelto', 1);
     
    SELECT 'Ticket cerrado con seguimiento registrado' as resultado;
END$$

CREATE PROCEDURE `CerrarTicketDirecto`(
    IN p_id_ticket INT,
    IN p_id_tecnico INT,
    IN p_comentario_cierre TEXT
)
BEGIN
    DECLARE v_nombre_tecnico VARCHAR(100);
    DECLARE v_rol_tecnico VARCHAR(100);
    
    SELECT nombre_completo, rol INTO v_nombre_tecnico, v_rol_tecnico 
    FROM usuarios WHERE id_usuario = p_id_tecnico;
    
    UPDATE tickets 
    SET estado_ticket = 'resuelto',
        fecha_cierre = CURRENT_TIMESTAMP,
        id_tecnico_asignado = p_id_tecnico,
        comentario_cierre = p_comentario_cierre,
        fecha_actualizacion = CURRENT_TIMESTAMP
    WHERE id_ticket = p_id_ticket;
    
    INSERT INTO historial_tickets 
    (id_ticket2, campo_modificado, valor_anterior, valor_nuevo, 
     modificado_por, nombre_modificador, rol_modificador, comentario_reapertura)
    VALUES 
    (p_id_ticket, 'cierre_directo', 'abierto', 'resuelto',
     p_id_tecnico, v_nombre_tecnico, v_rol_tecnico, p_comentario_cierre);
     
    SELECT 'Ticket cerrado directamente' as resultado;
END$$

DELIMITER ;

COMMIT;
